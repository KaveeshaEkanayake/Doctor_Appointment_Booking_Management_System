-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "profileStatus" "ProfileStatus" NOT NULL DEFAULT 'NOT_SUBMITTED';
