-- AlterTable
ALTER TABLE "service_record" ADD COLUMN     "afterImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
