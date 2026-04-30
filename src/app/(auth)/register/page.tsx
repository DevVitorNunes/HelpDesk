"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Headphones } from "lucide-react";
import { toast } from "sonner";
import { registerCompany } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCNPJ } from "@/lib/validations/cnpj";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerCompany, undefined);

  const [empresaNome, setEmpresaNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [empresaEmail, setEmpresaEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adminNome, setAdminNome] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [demoPending, setDemoPending] = useState(false);
  const [demoError, setDemoError] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success("Conta criada com sucesso! Bem-vindo ao HelpDesk.");
      router.push("/");
    }
  }, [state?.success]);

  async function handleDemoLogin() {
    setDemoPending(true);
    setDemoError("");
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: "helpdesk@email.com",
      password: "demo12345678",
    });
    if (error) {
      setDemoError("Conta demo indisponível no momento.");
      setDemoPending(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <Headphones className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">HelpDesk</h1>
              <p className="mt-1 text-sm text-gray-500">
                Crie sua conta e comece a gerenciar chamados
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            {state?.generalError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {state.generalError}
              </div>
            )}

            <form action={formAction} className="flex flex-col gap-6">
              {/* Dados da empresa */}
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Dados da empresa
                </h2>

                <Input
                  label="Nome da empresa"
                  name="empresa_nome"
                  placeholder="Acme Ltda."
                  required
                  value={empresaNome}
                  onChange={(e) => setEmpresaNome(e.target.value)}
                  error={state?.error?.empresa_nome?.[0]}
                />

                <Input
                  label="CNPJ"
                  name="empresa_cnpj"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  inputMode="numeric"
                  required
                  error={state?.error?.empresa_cnpj?.[0]}
                />

                <Input
                  label="E-mail da empresa"
                  type="email"
                  name="empresa_email"
                  placeholder="contato@empresa.com"
                  required
                  value={empresaEmail}
                  onChange={(e) => setEmpresaEmail(e.target.value)}
                  error={state?.error?.empresa_email?.[0]}
                />

                <Input
                  label="Telefone"
                  name="empresa_telefone"
                  placeholder="(11) 99999-9999"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  error={state?.error?.empresa_telefone?.[0]}
                />
              </div>

              <div className="border-t border-border" />

              {/* Dados do administrador */}
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Administrador da conta
                </h2>

                <Input
                  label="Nome completo"
                  name="admin_nome"
                  placeholder="João Silva"
                  required
                  value={adminNome}
                  onChange={(e) => setAdminNome(e.target.value)}
                  error={state?.error?.admin_nome?.[0]}
                />

                <Input
                  label="E-mail"
                  type="email"
                  name="admin_email"
                  placeholder="admin@empresa.com"
                  autoComplete="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  error={state?.error?.admin_email?.[0]}
                />

                <Input
                  label="Senha"
                  type={showAdminPassword ? "text" : "password"}
                  name="admin_password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  error={state?.error?.admin_password?.[0]}
                  rightAdornment={
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword((v) => !v)}
                      className="text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                      aria-label={showAdminPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <Button type="submit" loading={pending} className="w-full">
                Criar conta
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {demoError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {demoError}
              </p>
            )}

            <Button
              type="button"
              variant="secondary"
              loading={demoPending}
              onClick={handleDemoLogin}
              className="w-full"
            >
              🚀 Testar Demonstração
            </Button>
            <p className="mt-2 text-center text-xs text-gray-400">
              Acesso imediato sem precisar criar conta
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>

      {/* Right — image panel (replace src with your image URL) */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-white">
        <img
          src="/img.png"
          alt=""
          className="absolute inset-0 h-full w-full object-contain p-10"
        />
        {/* Fallback shown while no image src is set */}
        
      </div>
    </div>
  );
}
