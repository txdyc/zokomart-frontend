import type { NextConfig } from "next";
import { API_PROXY_BASE_PATH, getApiBaseUrl, stripTrailingSlash } from "./lib/url";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

function buildRemotePatterns() {
  const configuredBaseUrl = getApiBaseUrl();
  const fallbackUrls = ["http://localhost:8000", "http://127.0.0.1:8000"];
  const candidates = [configuredBaseUrl, ...fallbackUrls];
  const uniquePatterns = new Map<string, RemotePattern>();

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      const pathname = url.pathname === "/" ? "/**" : `${url.pathname.replace(/\/$/, "")}/**`;
      const key = `${url.protocol}//${url.hostname}:${url.port}${pathname}`;

      uniquePatterns.set(key, {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname,
      });
    } catch {
      continue;
    }
  }

  return Array.from(uniquePatterns.values());
}

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = stripTrailingSlash(getApiBaseUrl());

    return [
      {
        source: `${API_PROXY_BASE_PATH}/:path*`,
        destination: `${apiBaseUrl}/:path*`,
      },
      {
        source: "/public/uploads/:path*",
        destination: `${apiBaseUrl}/public/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      ...buildRemotePatterns(),
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/api/mcp/asset/**",
      },
    ],
  },
};

export default nextConfig;
