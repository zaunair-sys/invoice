const path = require("path");

const workspaceRoot = path.join(__dirname, "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
};

module.exports = nextConfig;
