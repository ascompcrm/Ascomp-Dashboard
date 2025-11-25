import type { auth } from "@my-better-t-app/auth";
import { createAuthClient, inferAdditionalFields } from "@my-better-t-app/auth/client";

export const authClient = createAuthClient({
	baseURL: typeof window !== 'undefined' 
		? window.location.origin 
		: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
	plugins: [inferAdditionalFields<typeof auth>()],
});
