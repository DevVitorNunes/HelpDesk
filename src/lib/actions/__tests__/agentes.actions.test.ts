import { revalidatePath } from "next/cache";
import { buildFormData, makeSupabaseMock } from "@/test/supabase-mock";

const mockServerClient = jest.fn();
const mockServiceClient = jest.fn();
const mockGetCompanyId = jest.fn(async () => "c-1");

jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockServerClient(),
  getSupabaseServiceClient: () => mockServiceClient(),
  getCompanyId: () => mockGetCompanyId(),
}));

const validAgente = {
  nome: "Agente A",
  email: "agente@example.com",
  telefone: "(11) 99999-9999",
  password: "senha1234",
};

describe("agentes.actions", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("createAgente", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { createAgente } = await import("../agentes.actions");
      await expect(
        createAgente(undefined, buildFormData(validAgente))
      ).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("rejeita payload inválido", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerClient.mockResolvedValue(client);

      const { createAgente } = await import("../agentes.actions");
      const res = await createAgente(
        undefined,
        buildFormData({ ...validAgente, password: "12" })
      );
      expect(res?.error?.password).toBeDefined();
    });

    it("rejeita criação sem senha", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerClient.mockResolvedValue(client);

      const { createAgente } = await import("../agentes.actions");
      // Password ausente — schema aceita (optional), mas action deve bloquear
      const fd = buildFormData({
        nome: "A",
        email: "a@a.com",
      });
      const res = await createAgente(undefined, fd);
      expect(res?.error?.password?.[0]).toMatch(/obrigatória/);
    });

    it("cria agente com sucesso (auth + tabela)", async () => {
      const { client: serverClient } = makeSupabaseMock({
        auth: { user: { id: "admin-1" } },
        from: { agentes: { insert: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(serverClient);

      const { client: serviceClient } = makeSupabaseMock({
        auth: { user: { id: "new-agente-id" } },
      });
      mockServiceClient.mockResolvedValue(serviceClient);

      const { createAgente } = await import("../agentes.actions");
      const res = await createAgente(undefined, buildFormData(validAgente));

      expect(res).toEqual({ success: true });
      expect(serviceClient.auth.admin.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "agente@example.com",
          email_confirm: true,
          app_metadata: { role: "agente" },
          user_metadata: expect.objectContaining({ company_id: "c-1" }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/agentes");
    });

    it("retorna erro de e-mail duplicado", async () => {
      const { client: serverClient } = makeSupabaseMock({
        auth: { user: { id: "admin-1" } },
      });
      mockServerClient.mockResolvedValue(serverClient);

      const { client: serviceClient } = makeSupabaseMock({});
      serviceClient.auth.admin.createUser = jest.fn(async () => ({
        data: null,
        error: { message: "User already registered" },
      })) as unknown as typeof serviceClient.auth.admin.createUser;
      mockServiceClient.mockResolvedValue(serviceClient);

      const { createAgente } = await import("../agentes.actions");
      const res = await createAgente(undefined, buildFormData(validAgente));
      expect(res?.error?.email?.[0]).toMatch(/cadastrado/);
    });

    it("retorna erro genérico se createUser falhar com outra mensagem", async () => {
      const { client: serverClient } = makeSupabaseMock({
        auth: { user: { id: "admin-1" } },
      });
      mockServerClient.mockResolvedValue(serverClient);

      const { client: serviceClient } = makeSupabaseMock({});
      serviceClient.auth.admin.createUser = jest.fn(async () => ({
        data: null,
        error: { message: "rate limit reached" },
      })) as unknown as typeof serviceClient.auth.admin.createUser;
      mockServiceClient.mockResolvedValue(serviceClient);

      const { createAgente } = await import("../agentes.actions");
      const res = await createAgente(undefined, buildFormData(validAgente));
      expect(res?.error?._root?.[0]).toMatch(/Tente novamente/);
    });
  });

  describe("updateAgente", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { updateAgente } = await import("../agentes.actions");
      await expect(
        updateAgente("ag-1", undefined, buildFormData({
          nome: "x", email: "x@x.com",
        }))
      ).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("ignora password no schema de update (omit)", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { agentes: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { updateAgente } = await import("../agentes.actions");
      const res = await updateAgente(
        "ag-1",
        undefined,
        buildFormData({
          nome: "Agente Atualizado",
          email: "novo@example.com",
        })
      );
      expect(res).toEqual({ success: true });

      const builder = (client.from as jest.Mock).mock.results[0].value;
      const updateCall = (builder.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.password).toBeUndefined();
    });
  });

  describe("deleteAgente", () => {
    it("faz soft delete", async () => {
      const { client } = makeSupabaseMock({
        from: { agentes: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { deleteAgente } = await import("../agentes.actions");
      const res = await deleteAgente("ag-1");

      expect(res).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/agentes");

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.update).toHaveBeenCalledWith({ deletado: true });
    });

    it("propaga erro do supabase", async () => {
      const { client } = makeSupabaseMock({
        from: { agentes: { update: { data: null, error: { message: "denied" } } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { deleteAgente } = await import("../agentes.actions");
      const res = await deleteAgente("ag-1");
      expect(res?.error).toBe("denied");
    });
  });
});
