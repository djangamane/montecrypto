#!/usr/bin/env node

/**
 * MCP Server Setup Helper
 * Helps users configure Claude Desktop to use the AI Crypto Risk MCP server
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Detect platform and config path
function getClaudeConfigPath() {
  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE;

  if (platform === "darwin") {
    return path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  } else if (platform === "win32") {
    return path.join(process.env.APPDATA, "Claude", "claude_desktop_config.json");
  } else {
    return path.join(home, ".config", "claude", "claude_desktop_config.json");
  }
}

async function main() {
  console.log("\n🔐 AI Crypto Risk MCP Server Setup\n");
  console.log("This will configure Claude Desktop to use the crypto risk analysis tools.\n");

  // Get API key
  const apiKey = await prompt("Enter your API key (get one at https://aicryptorisk.com/api-keys): ");

  if (!apiKey || !apiKey.startsWith("acr_")) {
    console.log("\n❌ Invalid API key. Keys should start with 'acr_'");
    rl.close();
    process.exit(1);
  }

  const configPath = getClaudeConfigPath();
  const serverPath = path.resolve(__dirname, "index.js");

  // Read existing config or create new
  let config = { mcpServers: {} };
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      config.mcpServers = config.mcpServers || {};
    }
  } catch (err) {
    console.log("Creating new Claude config...");
  }

  // Add our server
  config.mcpServers.aicryptorisk = {
    command: "node",
    args: [serverPath],
    env: {
      AICRYPTORISK_API_KEY: apiKey,
    },
  };

  // Ensure directory exists
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Write config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`\n✅ Configuration saved to: ${configPath}`);
  console.log("\n📋 Next steps:");
  console.log("   1. Restart Claude Desktop");
  console.log("   2. You can now ask Claude to analyze crypto tokens!");
  console.log("\n💡 Try: \"Analyze this token for scam risk: 0x...\"");

  rl.close();
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  rl.close();
  process.exit(1);
});
