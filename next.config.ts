import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**", // allow all domains (not recommended for production)
            },
        ],
    },
};

export default nextConfig;
