#!/usr/bin/env node
/**
 * Optional: upload a file to Google Drive using a service account.
 * Skips cleanly when GDRIVE_FOLDER_ID or GDRIVE_SERVICE_ACCOUNT_JSON are unset.
 *
 * Usage:
 *   GDRIVE_FOLDER_ID=... GDRIVE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' \
 *     node artifacts/lista/scripts/upload-backup-to-gdrive.mjs path/to/backup.sql.gz
 */
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { createSign } from "node:crypto";

const filePath = process.argv[2];
const folderId = process.env.GDRIVE_FOLDER_ID?.trim();
const saJson = process.env.GDRIVE_SERVICE_ACCOUNT_JSON?.trim();

if (!folderId || !saJson) {
  console.log("GDRIVE_* secrets not set — skipping Google Drive upload.");
  process.exit(0);
}
if (!filePath) {
  console.error("Usage: upload-backup-to-gdrive.mjs <file>");
  process.exit(1);
}

const sa = JSON.parse(saJson);
const scopes = ["https://www.googleapis.com/auth/drive.file"];

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: scopes.join(" "),
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const signature = sign.sign(sa.private_key);
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  const { access_token } = await res.json();
  return access_token;
}

async function upload(accessToken) {
  const name = basename(filePath);
  const metadata = {
    name,
    parents: [folderId],
  };
  const boundary = `lista_backup_${Date.now()}`;
  const fileBytes = await readFile(filePath);
  const preamble =
    `--${boundary}\r\n` +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    "Content-Type: application/gzip\r\n\r\n";
  const closing = `\r\n--${boundary}--`;
  const body = Buffer.concat([
    Buffer.from(preamble, "utf8"),
    fileBytes,
    Buffer.from(closing, "utf8"),
  ]);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );
  if (!res.ok) {
    throw new Error(`Drive upload failed: ${res.status} ${await res.text()}`);
  }
  const file = await res.json();
  console.log(`Uploaded to Google Drive: ${file.id} (${name})`);
}

await upload(await getAccessToken());
