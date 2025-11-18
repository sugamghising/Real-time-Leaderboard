-- CreateIndex
CREATE INDEX "Message_toUserId_isRead_idx" ON "Message"("toUserId", "isRead");

-- CreateIndex
CREATE INDEX "Message_fromUserId_createdAt_idx" ON "Message"("fromUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_toUserId_createdAt_idx" ON "Message"("toUserId", "createdAt");
