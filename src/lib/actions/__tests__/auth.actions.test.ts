import { redirect } from "next/navigation";
import { buildFormData, makeSupabaseMock } from "@/test/supabase-mock";

const mockServerClient = jest.fn();
const mockServiceClient = jest.fn();
const mockServerActionClient = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockServerClient(),
  getSupabaseServiceClient: () => mockServiceClient(),
  getSupabaseServerActionClient: () => mockServerActionClient(),
  getCompanyId: jest.fn(async () => "c-1"),
}));

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

describe("auth.actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  describe("signIn", () => {
    it("redireciona para / em caso de sucesso", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerActionClient.mockResolvedValue(client);

      const { signIn } = await import("../auth.actions");

      await expect(
        signIn(undefined, buildFormData({ email: "a@a.com", password: "12345678" }))
      ).rejects.toThrow("NEXT_REDIRECT:/");

      expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "a@a.com",
        password: "12345678",
      });
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("retorna erro quando credenciais são inválidas", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: null, error: { message: "Invalid login credentials" } },
      });
      mockServerActionClient.mockResolvedValue(client);

      const { signIn } = await import("../auth.actions");

      const res = await signIn(undefined, buildFormData({ email: "a@a.com", password: "x" }));
      expect(res).toEqual({ error: "Email ou senha inválidos." });
    });
  });

  describe("signOut", () => {
    it("desloga e redireciona para /login", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerActionClient.mockResolvedValue(client);

      const { signOut } = await import("../auth.actions");
      await expect(signOut()).rejects.toThrow("NEXT_REDIRECT:/login");
      expect(client.auth.signOut).toHaveBeenCalled();
    });
  });

  describe("requestPasswordReset", () => {
    it("rejeita e-mail inválido", async () => {
      const { requestPasswordReset } = await import("../auth.actions");
      const res = await requestPasswordReset(undefined, buildFormData({ email: "not-email" }));
      expect(res?.error).toMatch(/e-mail/i);
    });

    it("retorna success genérico mesmo se generateLink falhar (não vaza existência)", async () => {
      const { client } = makeSupabaseMock({});
      client.auth.admin.generateLink = jest.fn(async () => ({
        data: null,
        error: { message: "user not found" },
      })) as unknown as typeof client.auth.admin.generateLink;
      mockServiceClient.mockResolvedValue(client);

      const { requestPasswordReset } = await import("../auth.actions");
      const res = await requestPasswordReset(
        undefined,
        buildFormData({ email: "ghost@a.com" })
      );
      expect(res).toEqual({ success: true });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("envia e-mail via Brevo quando link é gerado", async () => {
      const { client } = makeSupabaseMock({});
      mockServiceClient.mockResolvedValue(client);
      fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => "" });

      const { requestPasswordReset } = await import("../auth.actions");
      const res = await requestPasswordReset(
        undefined,
        buildFormData({ email: "user@a.com" })
      );

      expect(res).toEqual({ success: true });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.brevo.com/v3/smtp/email",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("retorna success mesmo se envio Brevo falhar (apenas loga)", async () => {
      const { client } = makeSupabaseMock({});
      mockServiceClient.mockResolvedValue(client);
      fetchMock.mockRejectedValue(new Error("network error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const { requestPasswordReset } = await import("../auth.actions");
      const res = await requestPasswordReset(
        undefined,
        buildFormData({ email: "user@a.com" })
      );

      expect(res).toEqual({ success: true });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("resetPassword", () => {
    it("rejeita senha curta", async () => {
      const { resetPassword } = await import("../auth.actions");
      const res = await resetPassword(
        undefined,
        buildFormData({ password: "1234", confirm: "1234" })
      );
      expect(res?.fieldErrors?.password).toMatch(/8/);
    });

    it("rejeita confirmação divergente", async () => {
      const { resetPassword } = await import("../auth.actions");
      const res = await resetPassword(
        undefined,
        buildFormData({ password: "12345678", confirm: "87654321" })
      );
      expect(res?.fieldErrors?.confirm).toMatch(/coincidem/);
    });

    it("redireciona em caso de sucesso", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerActionClient.mockResolvedValue(client);

      const { resetPassword } = await import("../auth.actions");
      await expect(
        resetPassword(undefined, buildFormData({ password: "12345678", confirm: "12345678" }))
      ).rejects.toThrow("NEXT_REDIRECT:/");
    });

    it("retorna erro genérico se updateUser falhar", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: null, error: { message: "expired" } },
      });
      mockServerActionClient.mockResolvedValue(client);

      const { resetPassword } = await import("../auth.actions");
      const res = await resetPassword(
        undefined,
        buildFormData({ password: "12345678", confirm: "12345678" })
      );
      expect(res?.error).toMatch(/expirado|expirad/i);
    });
  });

  describe("registerCompany", () => {
    const validForm = {
      empresa_nome: "Empresa LTDA",
      empresa_cnpj: "11.222.333/0001-81",
      empresa_email: "contato@empresa.com",
      empresa_telefone: "(11) 99999-9999",
      admin_nome: "Admin",
      admin_email: "admin@empresa.com",
      admin_password: "senha1234",
    };

    it("rejeita payload inválido", async () => {
      const { registerCompany } = await import("../auth.actions");
      const res = await registerCompany(
        undefined,
        buildFormData({ ...validForm, empresa_cnpj: "11.111.111/1111-11" })
      );
      expect(res?.error?.empresa_cnpj?.[0]).toMatch(/CNPJ/);
    });

    it("rejeita CNPJ duplicado", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: {
          empresas: { maybeSingle: { data: { id: "existing" }, error: null } },
        },
      });
      mockServiceClient.mockResolvedValue(client);

      const { registerCompany } = await import("../auth.actions");
      const res = await registerCompany(undefined, buildFormData(validForm));
      expect(res?.error?.empresa_cnpj?.[0]).toMatch(/cadastrado/);
    });

    it("rolls back empresa se createUser falhar", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: {
          empresas: {
            maybeSingle: { data: null, error: null },
            insert: { data: { id: "new-empresa" }, error: null },
            single: { data: { id: "new-empresa" }, error: null },
            delete: { data: null, error: null },
          },
        },
      });
      // Force createUser to fail with "already registered"
      client.auth.admin.createUser = jest.fn(async () => ({
        data: null,
        error: { message: "User already registered" },
      })) as unknown as typeof client.auth.admin.createUser;

      mockServiceClient.mockResolvedValue(client);

      const { registerCompany } = await import("../auth.actions");
      const res = await registerCompany(undefined, buildFormData(validForm));

      expect(res?.error?.admin_email?.[0]).toMatch(/cadastrado/);
      // Verify rollback: empresas.delete was called
      expect(client.from).toHaveBeenCalledWith("empresas");
    });

    it("retorna sucesso e cria empresa+admin no caminho feliz", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "new-user-id", email: "admin@empresa.com" } },
        from: {
          empresas: {
            maybeSingle: { data: null, error: null },
            insert: { data: { id: "empresa-1" }, error: null },
            single: { data: { id: "empresa-1" }, error: null },
          },
          users: {
            upsert: { data: null, error: null },
          },
        },
      });
      mockServiceClient.mockResolvedValue(client);

      const { client: serverClient } = makeSupabaseMock({
        auth: { user: { id: "new-user-id" } },
      });
      mockServerActionClient.mockResolvedValue(serverClient);

      const { registerCompany } = await import("../auth.actions");
      const res = await registerCompany(undefined, buildFormData(validForm));

      expect(res?.success).toBe(true);
      expect(client.auth.admin.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "admin@empresa.com",
          email_confirm: true,
          app_metadata: { role: "admin" },
        })
      );
    });
  });
});
