"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerActionClient, getSupabaseServiceClient } from "@/lib/supabase/server";
import { RegisterSchema } from "@/lib/validations/register.schema";

// ─── Password Reset ───────────────────────────────────────────────────────────

type ResetRequestState = { error?: string; success?: boolean } | undefined;

export async function requestPasswordReset(
  _prevState: ResetRequestState,
  formData: FormData
): Promise<ResetRequestState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Por favor, informe um e-mail válido." };
  }

  const adminClient = await getSupabaseServiceClient();

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${appUrl}/reset-password` },
  });

  // Always return the same success message regardless of whether email exists (security)
  if (error || !data?.properties?.action_link) {
    return { success: true };
  }

  try {
    await sendPasswordResetEmail(email, data.properties.action_link);
  } catch (err) {
    console.error("[password-reset] email send failed:", err);
  }

  return { success: true };
}

async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY is not set");

  const senderEmail = process.env.BREVO_SENDER_EMAIL ?? "noreply@helpdesk.com";
  const senderName = process.env.BREVO_SENDER_NAME ?? "HelpDesk";

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: "Recuperação de senha — HelpDesk",
      htmlContent: buildResetEmailHtml(resetLink),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo ${res.status}: ${body}`);
  }
}

function buildResetEmailHtml(resetLink: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recuperação de senha</title>
</head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#F97316;padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">HelpDesk</span>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
                Redefinição de senha
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">
                Recebemos uma solicitação de recuperação de acesso para a sua conta.
                Clique no botão abaixo para criar uma nova senha:
              </p>
              <div style="text-align:center;margin:0 0 24px;">
                <a href="${resetLink}"
                   style="display:inline-block;background:#F97316;color:#ffffff;font-size:15px;font-weight:600;
                          text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:0.1px;">
                  Redefinir minha senha
                </a>
              </div>
              <p style="margin:0 0 8px;font-size:13px;color:#9CA3AF;line-height:1.5;">
                Este link é válido por <strong>1 hora</strong>. Após esse prazo será necessário solicitar um novo link.
              </p>
              <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.5;">
                Se você não solicitou a recuperação de senha, ignore este e-mail.
                Sua conta permanece segura.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #F3F4F6;"></div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#D1D5DB;">
                © ${new Date().getFullYear()} HelpDesk · Sistema de gerenciamento de chamados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

type ResetPasswordState = { error?: string; fieldErrors?: { password?: string; confirm?: string } } | undefined;

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  const fieldErrors: { password?: string; confirm?: string } = {};

  if (!password || password.length < 8) {
    fieldErrors.password = "A senha deve ter pelo menos 8 caracteres.";
  }
  if (!confirm || confirm !== password) {
    fieldErrors.confirm = "As senhas não coincidem.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await getSupabaseServerActionClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Não foi possível atualizar a senha. O link pode ter expirado. Solicite um novo." };
  }

  redirect("/");
}

export async function signIn(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await getSupabaseServerActionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email ou senha inválidos." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await getSupabaseServerActionClient();
  await supabase.auth.signOut();
  redirect("/login");
}

type RegisterState =
  | { error?: Record<string, string[]>; generalError?: string; success?: boolean }
  | undefined;

export async function registerCompany(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const {
    empresa_nome,
    empresa_cnpj,
    empresa_email,
    empresa_telefone,
    admin_nome,
    admin_email,
    admin_password,
  } = parsed.data;

  const cnpjDigits = empresa_cnpj.replace(/\D/g, "");
  const adminClient = await getSupabaseServiceClient();

  const { data: existingCnpj } = await adminClient
    .from("empresas")
    .select("id")
    .eq("cnpj", cnpjDigits)
    .maybeSingle();

  if (existingCnpj) {
    return { error: { empresa_cnpj: ["Este CNPJ já está cadastrado"] } };
  }

  const { data: existingEmail } = await adminClient
    .from("empresas")
    .select("id")
    .ilike("email", empresa_email)
    .maybeSingle();

  if (existingEmail) {
    return { error: { empresa_email: ["Este e-mail já está cadastrado"] } };
  }

  const { data: empresa, error: empresaError } = await adminClient
    .from("empresas")
    .insert({
      nome: empresa_nome,
      email: empresa_email,
      telefone: empresa_telefone || null,
      cnpj: cnpjDigits,
    })
    .select("id")
    .single();

  if (empresaError || !empresa) {
    if (empresaError?.code === "23505") {
      return { error: { empresa_email: ["Este e-mail já está cadastrado"] } };
    }
    return { generalError: "Erro ao criar empresa. Tente novamente." };
  }

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: admin_email,
      password: admin_password,
      email_confirm: true,
      app_metadata: { role: "admin" },
      user_metadata: { name: admin_nome, company_id: empresa.id },
    });

  if (authError) {
    await adminClient.from("empresas").delete().eq("id", empresa.id);
    const msg = authError.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("already been registered") ||
      msg.includes("email address already in use") ||
      msg.includes("already exists")
    ) {
      return { error: { admin_email: ["Este e-mail já está cadastrado"] } };
    }
    return { generalError: "Erro ao criar usuário. Tente novamente." };
  }

  await adminClient.from("users").upsert({
    id: authData.user.id,
    name: admin_nome,
    email: admin_email,
    role: "admin",
    company_id: empresa.id,
  });

  const serverClient = await getSupabaseServerActionClient();
  await serverClient.auth.signInWithPassword({ email: admin_email, password: admin_password });

  return { success: true };
}
