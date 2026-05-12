import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "npx.cmd",
    args: ["-y", "obsidian-mcp", "C:\\Users\\PC\\Documents\\Obsidian Vault"]
  });

  const client = new Client({
    name: "tool-checker",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  const tools = await client.listTools();
  console.log(JSON.stringify(tools, null, 2));
  await transport.close();
}

main().catch(console.error);
