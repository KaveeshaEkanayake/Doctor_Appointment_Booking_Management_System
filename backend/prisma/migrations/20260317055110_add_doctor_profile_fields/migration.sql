-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "consultationFee" DOUBLE PRECISION,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "qualifications" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
