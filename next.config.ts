import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/unity/:path*.br",
        headers: [
          {
            key: "Content-Encoding",
            value: "br",
          },
          {
            key: "Content-Type",
            value: "application/javascript",
          },
        ],
      },
      {
        source: "/unity/:path*.wasm.br",
        headers: [
          {
            key: "Content-Encoding",
            value: "br",
          },
          {
            key: "Content-Type",
            value: "application/wasm",
          },
        ],
      },
      {
        source: "/unity/:path*.data.br",
        headers: [
          {
            key: "Content-Encoding",
            value: "br",
          },
          {
            key: "Content-Type",
            value: "application/octet-stream",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
