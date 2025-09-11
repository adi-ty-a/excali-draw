-- DropForeignKey
ALTER TABLE "chat" DROP CONSTRAINT "chat_roomid_fkey";

-- DropForeignKey
ALTER TABLE "chat" DROP CONSTRAINT "chat_userId_fkey";

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_roomid_fkey" FOREIGN KEY ("roomid") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
