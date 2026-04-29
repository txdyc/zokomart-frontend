import type { NextConfig } from "next";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

function buildRemotePatterns() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
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
