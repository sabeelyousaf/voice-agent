-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "vapiCallId" TEXT,
    "customerNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scenarioType" TEXT,
    "scriptId" TEXT,
    "transcript" TEXT,
    "recordingUrl" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentScript" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "firstMessage" TEXT NOT NULL,
    "options" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentScript_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Call_vapiCallId_key" ON "Call"("vapiCallId");

-- CreateIndex
CREATE INDEX "Call_status_createdAt_idx" ON "Call"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Call_customerNumber_idx" ON "Call"("customerNumber");

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "AgentScript"("id") ON DELETE SET NULL ON UPDATE CASCADE;
