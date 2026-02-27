export type Call = {
  id: string;
  vapiCallId: string | null;
  customerNumber: string;
  status: string;
  scenarioType: string | null;
  scriptId: string | null;
  transcript: string | null;
  recordingUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  script?: AgentScript | null;
};

export type AgentScript = {
  id: string;
  name: string;
  scenarioType: string;
  systemPrompt: string;
  firstMessage: string;
  options: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  status: string;
  tags: string | null;
  metadata: unknown;
  callStatus?: string | null;
  callAttempts?: number;
  lastCallAt?: string | null;
  nextCallAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceSettings = {
  id: number;
  businessName: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  integrationApiKey: string;
   vapiApiKey?: string | null;
   vapiPublicKey?: string | null;
   vapiBaseUrl?: string | null;
   vapiPhoneNumberId?: string | null;
  createdAt: string;
  updatedAt: string;
};
