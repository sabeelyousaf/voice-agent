import { prisma } from "./db";

function generateIntegrationKey() {
  // Simple random key generator – good enough for demo/integration purposes
  return Array.from({ length: 4 })
    .map(() => Math.random().toString(36).slice(2, 10))
    .join("-");
}

export async function ensureWorkspaceSettings() {
  let settings = await prisma.workspaceSettings.findFirst();
  if (!settings) {
    settings = await prisma.workspaceSettings.create({
      data: {
        // default id = 1 by schema
        integrationApiKey: generateIntegrationKey(),
      },
    });
  }
  return settings;
}

export async function getWorkspaceSettings() {
  return ensureWorkspaceSettings();
}

export async function updateWorkspaceSettings(data: {
  businessName?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  vapiApiKey?: string | null;
  vapiPublicKey?: string | null;
  vapiBaseUrl?: string | null;
  vapiPhoneNumberId?: string | null;
}) {
  const current = await ensureWorkspaceSettings();
  return prisma.workspaceSettings.update({
    where: { id: current.id },
    data,
  });
}

export async function rotateIntegrationKey() {
  const current = await ensureWorkspaceSettings();
  return prisma.workspaceSettings.update({
    where: { id: current.id },
    data: { integrationApiKey: generateIntegrationKey() },
  });
}

