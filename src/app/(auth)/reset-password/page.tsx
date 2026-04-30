"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Headphones } from "lucide-react";
import { resetPassword } from "@/lib/actions/auth.actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

// ── Shell shared layout ───────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
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
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Inner component (uses useSearchParams — must be inside Suspense) ──────────

type PageState = "loading" | "ready" | "invalid";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, formAction, pending] = useActionState(resetPassword, undefined);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) { setPageState("invalid"); return; }

    // Supabase recovery links usam hash fragment (#access_token=...), não query params (?code=...)
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken || type !== "recovery") {
      setPageState("invalid");
      return;
    }

    // Remove tokens sensíveis da barra de endereço
    window.history.replaceState(null, "", window.location.pathname);

    getSupabaseBrowserClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        setPageState(error ? "invalid" : "ready");
      });
  }, [searchParams]);

  if (pageState === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-gray-500">Verificando link…</p>
      </div>
    );
  }

  if (pageState === "invalid") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl">⚠️</span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Link inválido ou expirado
          </h2>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            Este link de recuperação não é válido ou já expirou. Solicite um
            novo link na tela de login.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
        >
          Ir para o login
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-1 text-base font-semibold text-gray-900">
        Criar nova senha
      </h2>
      <p className="mb-5 text-sm text-gray-500">
        Escolha uma senha segura com pelo menos 8 caracteres.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Nova senha"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          error={state?.fieldErrors?.password}
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

        <Input
          label="Confirmar nova senha"
          type={showConfirm ? "text" : "password"}
          name="confirm"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          error={state?.fieldErrors?.confirm}
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <Button type="submit" loading={pending} className="mt-1 w-full">
          Salvar nova senha
        </Button>
      </form>
    </>
  );
}

// ── Page export (wraps content in Suspense) ───────────────────────────────────

export default function ResetPasswordPage() {
  return (
    <Shell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-4">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-gray-500">Carregando…</p>
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </Shell>
  );
}
