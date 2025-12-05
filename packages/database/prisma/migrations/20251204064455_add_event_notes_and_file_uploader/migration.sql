-- AlterTable: Add uploadedBy column to File table
ALTER TABLE "File" ADD COLUMN "uploadedBy" TEXT;

-- AddForeignKey: File.uploadedBy -> User.id
ALTER TABLE "File" ADD CONSTRAINT "File_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: Note
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: Note.eventId -> Event.id
ALTER TABLE "Note" ADD CONSTRAINT "Note_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Note.createdBy -> User.id
ALTER TABLE "Note" ADD CONSTRAINT "Note_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex: Note.eventId
CREATE INDEX "Note_eventId_idx" ON "Note"("eventId");

-- CreateIndex: Note.createdBy
CREATE INDEX "Note_createdBy_idx" ON "Note"("createdBy");

-- CreateIndex: Note.createdAt
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

-- CreateIndex: Note.eventId_createdAt
CREATE INDEX "Note_eventId_createdAt_idx" ON "Note"("eventId", "createdAt");

-- CreateIndex: Note.eventId_updatedAt
CREATE INDEX "Note_eventId_updatedAt_idx" ON "Note"("eventId", "updatedAt");

-- CreateIndex: File.uploadedBy
CREATE INDEX "File_uploadedBy_idx" ON "File"("uploadedBy");






