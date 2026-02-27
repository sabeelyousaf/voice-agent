import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceSettings, updateWorkspaceSettings, rotateIntegrationKey } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getWorkspaceSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, websiteUrl, logoUrl, phoneNumber, email, address, vapiApiKey, vapiPublicKey, vapiBaseUrl, vapiPhoneNumberId, rotateKey } =
      body as {
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
        rotateKey?: boolean;
      };

    if (rotateKey) {
      const rotated = await rotateIntegrationKey();
      return NextResponse.json(rotated);
    }

    const updated = await updateWorkspaceSettings({
      businessName,
      websiteUrl,
      logoUrl,
      phoneNumber,
      email,
      address,
      vapiApiKey,
      vapiPublicKey,
      vapiBaseUrl,
      vapiPhoneNumberId,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update settings error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}

