import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: false,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.public.blob.vercel-storage.com",
			},
			{
				protocol: "https",
				hostname: "dvazzolenhn0fdib.public.blob.vercel-storage.com",
			},
		],
	},
};

export default nextConfig;
