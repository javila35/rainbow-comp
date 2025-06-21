-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "gender" "Gender";
