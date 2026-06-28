CREATE INDEX "friendships_senderId_status_idx" ON "friendships"("senderId", "status");
CREATE INDEX "friendships_receiverId_status_idx" ON "friendships"("receiverId", "status");
CREATE INDEX "user_media_userId_watched_idx" ON "user_media"("userId", "watched");
CREATE INDEX "user_media_userId_liked_idx" ON "user_media"("userId", "liked");
CREATE INDEX "user_media_userId_watchlist_idx" ON "user_media"("userId", "watchlist");
