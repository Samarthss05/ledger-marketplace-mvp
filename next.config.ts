import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = "";
if (isGithubActions && process.env.GITHUB_REPOSITORY) {
  repo = `/${process.env.GITHUB_REPOSITORY.replace(/.*?\//, "")}`;
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: repo,
  assetPrefix: repo,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
