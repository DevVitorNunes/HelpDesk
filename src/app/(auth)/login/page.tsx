"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Headphones, ArrowLeft, Mail } from "lucide-react";
import { signIn, requestPasswordReset } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loginState, loginAction, loginPending] = useActionState(signIn, undefined);
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordReset, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [demoPending, setDemoPending] = useState(false);
  const [demoError, setDemoError] = useState("");

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
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <Headphones className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">HelpDesk</h1>
              <p className="mt-1 text-sm text-gray-500">
                Sistema de gerenciamento de chamados
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            {/* ── Login form ── */}
            <div
              className={[
                "transition-all duration-300",
                mode === "login" ? "block opacity-100" : "hidden opacity-0",
              ].join(" ")}
            >
              <h2 className="mb-6 text-base font-semibold text-gray-900">
                Entrar na sua conta
              </h2>

              <form action={loginAction} className="flex flex-col gap-4">
                <Input
                  label="E-mail"
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
                <Input
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  rightAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />

                {loginState?.error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {loginState.error}
                  </p>
                )}

                <Button type="submit" loading={loginPending} className="mt-1 w-full">
                  Entrar
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-gray-500 hover:text-primary transition-colors duration-150 hover:underline underline-offset-2"
                >
                  Esqueci minha senha
                </button>
              </div>

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

            {/* ── Forgot password form ── */}
            <div
              className={[
                "transition-all duration-300",
                mode === "forgot" ? "block opacity-100" : "hidden opacity-0",
              ].join(" ")}
            >
              {resetState?.success ? (
                <div className="flex flex-col items-center gap-4 py-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Verifique seu e-mail
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                      Se o e-mail estiver cadastrado, enviaremos um link de
                      recuperação em instantes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-2"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar para o login
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar
                  </button>

                  <h2 className="mb-1 text-base font-semibold text-gray-900">
                    Recuperar senha
                  </h2>
                  <p className="mb-5 text-sm text-gray-500">
                    Informe seu e-mail e enviaremos um link para redefinir a senha.
                  </p>

                  <form action={resetAction} className="flex flex-col gap-4">
                    <Input
                      label="E-mail"
                      type="email"
                      name="email"
                      placeholder="seu@email.com"
                      required
                      autoComplete="email"
                      error={resetState?.error}
                    />
                    <Button type="submit" loading={resetPending} className="w-full">
                      Enviar link de recuperação
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

          {mode === "login" && (
            <p className="mt-6 text-center text-xs text-gray-400">
              Novo por aqui?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Criar conta
              </Link>
            </p>
          )}
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
