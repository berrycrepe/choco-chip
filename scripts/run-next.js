#!/usr/bin/env node
"use strict";

const { spawn } = require("node:child_process");
const path = require("node:path");

const nextCli = require.resolve("next/dist/bin/next");
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/run-next.js <dev|start|build|...> [args]");
  process.exit(1);
}

const child = spawn(process.execPath, [nextCli, ...args], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: process.env,
  windowsHide: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (err) => {
  console.error(`Failed to run Next.js CLI (${path.relative(process.cwd(), nextCli)}):`, err.message);
  process.exit(1);
});