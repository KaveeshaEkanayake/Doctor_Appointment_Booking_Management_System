/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,date,startTime]` on the table `BlockedSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "BlockedSlot_doctorId_date_idx" ON "BlockedSlot"("doctorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedSlot_doctorId_date_startTime_key" ON "BlockedSlot"("doctorId", "date", "startTime");
