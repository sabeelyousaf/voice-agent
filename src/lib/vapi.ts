import { getWorkspaceSettings } from "./settings";

const FALLBACK_VAPI_BASE = process.env.VAPI_BASE_URL || "https://api.vapi.ai";
const FALLBACK_VAPI_KEY = process.env.VAPI_API_KEY;

export type ScenarioType = "appointment" | "product_info" | "feedback";

const SCENARIO_PROMPTS: Record<
  ScenarioType,
  { firstMessage: string; systemPrompt: string }
> = {
  appointment: {
    firstMessage:
      "Hi, this is Acme Corp calling. Would you like to schedule a demo? Say yes to book or no to skip.",
    systemPrompt: `You are a friendly Acme Corp phone assistant. Your goal is to schedule a demo.
- Greet the caller and offer to schedule a demo.
- If they say yes, ask for their preferred date and time, then confirm.
- If they say no, thank them and offer to call back later.
- Keep responses under 30 words. Be polite and professional.`,
  },
  product_info: {
    firstMessage:
      "Hi, thanks for calling Acme Corp. We have 3 packages. Would you like me to explain them? Say the package number or ask a question.",
    systemPrompt: `You are a friendly Acme Corp phone assistant explaining product packages.
- We have 3 packages: Basic, Pro, and Enterprise.
- Basic: core features, best for small teams.
- Pro: advanced features, best for growing businesses.
- Enterprise: full features + dedicated support.
- Keep responses under 40 words. Offer to transfer to sales if they want to buy.`,
  },
  feedback: {
    firstMessage:
      "Hi, this is Acme Corp. How satisfied are you with our service? Press 1 for satisfied, 2 for neutral, or 3 for dissatisfied. Or just say your answer.",
    systemPrompt: `You are a friendly Acme Corp feedback assistant.
- Collect satisfaction: 1 = satisfied, 2 = neutral, 3 = dissatisfied.
- If they give a number or say the word, acknowledge and thank them.
- Optionally ask one short follow-up: "Any specific feedback?" then thank them and say goodbye.
- Keep responses under 25 words.`,
  },
};

export function getAssistantConfig(scenario: ScenarioType, scriptOverride?: { firstMessage?: string; systemPrompt?: string }) {
  const base = SCENARIO_PROMPTS[scenario];
  const systemContent = (scriptOverride?.systemPrompt ?? base.systemPrompt) + "\n\nAlways keep responses concise.";
  return {
    firstMessage: scriptOverride?.firstMessage ?? base.firstMessage,
    model: {
      provider: "openai" as const,
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system" as const,
          content: systemContent,
        },
      ],
    },
    voice: {
      provider: "11labs" as const,
      voiceId: "rachel",
    },
    transcriber: {
      provider: "deepgram" as const,
      model: "nova-2",
      language: "en",
    },
  };
}

export async function createVapiPhoneCall(params: {
  customerNumber: string;
  scenario: ScenarioType;
  scriptId?: string | null;
  assistantOverrides?: { firstMessage?: string; systemPrompt?: string };
}): Promise<{ callId?: string; error?: string }> {
  const settings = (await getWorkspaceSettings().catch(() => null)) as any;
  const apiKey = settings?.vapiApiKey || FALLBACK_VAPI_KEY;
  const baseUrl = settings?.vapiBaseUrl || FALLBACK_VAPI_BASE;
  const phoneNumberId = settings?.vapiPhoneNumberId || process.env.VAPI_PHONE_NUMBER_ID;

  if (!apiKey) return { error: "VAPI API key is not configured in Settings." };
  if (!phoneNumberId) {
    return {
      error:
        "VAPI phone number ID is not configured. Add it in Settings → Telephony / VAPI.",
    };
  }

  const assistantConfig = getAssistantConfig(params.scenario, params.assistantOverrides);

  const body = {
    assistant: {
      ...assistantConfig,
      serverUrl: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/webhooks/vapi`
        : undefined,
      serverMessages: ["end-of-call-report"],
    },
    phoneNumberId,
    customer: { number: params.customerNumber },
  };

  const res = await fetch(`${baseUrl}/call/phone`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: text || `VAPI error ${res.status}` };
  }

  const data = (await res.json()) as { id?: string };
  return { callId: data.id };
}

export async function getVapiCall(callId: string): Promise<{ transcript?: string; recordingUrl?: string; status?: string } | null> {
  const settings = (await getWorkspaceSettings().catch(() => null)) as any;
  const apiKey = settings?.vapiApiKey || FALLBACK_VAPI_KEY;
  const baseUrl = settings?.vapiBaseUrl || FALLBACK_VAPI_BASE;
  if (!apiKey) return null;
  const res = await fetch(`${baseUrl}/call/${callId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { transcript?: string; recordingUrl?: string; status?: string };
  return data;
}
