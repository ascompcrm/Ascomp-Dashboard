-- AlterTable
ALTER TABLE "service_record" ADD COLUMN     "brokenImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
