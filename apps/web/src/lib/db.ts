import { PrismaClient, Role, ServiceStatus } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
	prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export default prisma;
export { Role, ServiceStatus };

