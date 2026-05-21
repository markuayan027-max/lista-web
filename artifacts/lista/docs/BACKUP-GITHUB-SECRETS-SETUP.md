# GitHub Actions backup — one-time secret setup

Do this once so [lista-db-backup.yml](../../../.github/workflows/lista-db-backup.yml) can run.

## 1. Add DATABASE_URL (required)

1. Open https://github.com/markuayan027-max/lista-web/settings/secrets/actions  
2. **New repository secret** → Name: `DATABASE_URL`  
3. Value: the same Postgres URL used on Cloudflare Worker **lista-web** (InsForge dashboard → database connection string).  
4. Save.

## 2. Test the workflow

1. **Actions** → **LISTA DB backup** → **Run workflow** → **Run workflow**  
2. Open the run → confirm **pg_dump** and **Upload workflow artifact** succeed.  
3. Download the `.sql.gz` artifact and store offline if desired.

## 3. Optional: Google Drive copy

1. Google Cloud Console → create a **service account** → download JSON key.  
2. Google Drive → create folder **LISTA-DB-Backups** → share with the service account email (Editor).  
3. Copy the folder ID from the URL (`folders/<ID>`).  
4. GitHub secrets:
   - `GDRIVE_FOLDER_ID` = folder ID  
   - `GDRIVE_SERVICE_ACCOUNT_JSON` = entire JSON file contents (one secret)  
5. Re-run **LISTA DB backup**; log should show `Uploaded to Google Drive: ...`

## 4. Keepalive (no secrets)

**LISTA keepalive** runs daily automatically. No setup required.

---

See also [PRODUCTION-MAINTENANCE.md](./PRODUCTION-MAINTENANCE.md) and [DOMAIN-OPTIONS.md](./DOMAIN-OPTIONS.md).
