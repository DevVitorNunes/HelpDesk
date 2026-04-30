import { revalidatePath } from "next/cache";
import { buildFormData, makeSupabaseMock } from "@/test/supabase-mock";

const mockServerClient = jest.fn();
const mockGetCompanyId = jest.fn(async () => "c-1");

jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockServerClient(),
  getCompanyId: () => mockGetCompanyId(),
}));

const validCliente = {
  name: "Cliente A",
  email: "cliente@example.com",
  phone: "(11) 99999-9999",
};

describe("clientes.actions", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("createCliente", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { createCliente } = await import("../clientes.actions");
      await expect(
        createCliente(undefined, buildFormData(validCliente))
      ).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("rejeita payload inválido", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerClient.mockResolvedValue(client);

      const { createCliente } = await import("../clientes.actions");
      const res = await createCliente(
        undefined,
        buildFormData({ ...validCliente, email: "not-email" })
      );
      expect(res?.error?.email).toBeDefined();
    });

    it("cria cliente com user_id e company_id", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { clients: { insert: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { createCliente } = await import("../clientes.actions");
      const res = await createCliente(undefined, buildFormData(validCliente));

      expect(res).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/clientes");

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Cliente A",
          email: "cliente@example.com",
          user_id: "u-1",
          company_id: "c-1",
        })
      );
    });

    it("retorna erro de root se insert falhar", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: {
          clients: { insert: { data: null, error: { message: "unique constraint" } } },
        },
      });
      mockServerClient.mockResolvedValue(client);

      const { createCliente } = await import("../clientes.actions");
      const res = await createCliente(undefined, buildFormData(validCliente));
      expect(res?.error?._root?.[0]).toBe("unique constraint");
    });
  });

  describe("updateCliente", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { updateCliente } = await import("../clientes.actions");
      await expect(
        updateCliente("cli-1", undefined, buildFormData(validCliente))
      ).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("atualiza cliente e revalida", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { clients: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { updateCliente } = await import("../clientes.actions");
      const res = await updateCliente("cli-1", undefined, buildFormData(validCliente));

      expect(res).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/clientes");

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.eq).toHaveBeenCalledWith("id", "cli-1");
    });

    it("retorna erro de root se update falhar", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { clients: { update: { data: null, error: { message: "denied" } } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { updateCliente } = await import("../clientes.actions");
      const res = await updateCliente("cli-1", undefined, buildFormData(validCliente));
      expect(res?.error?._root?.[0]).toBe("denied");
    });
  });

  describe("deleteCliente", () => {
    it("faz soft delete (deletado=true)", async () => {
      const { client } = makeSupabaseMock({
        from: { clients: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { deleteCliente } = await import("../clientes.actions");
      const res = await deleteCliente("cli-1");

      expect(res).toEqual({ success: true });

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.update).toHaveBeenCalledWith({ deletado: true });
      expect(builder.eq).toHaveBeenCalledWith("id", "cli-1");
    });

    it("propaga erro do supabase", async () => {
      const { client } = makeSupabaseMock({
        from: { clients: { update: { data: null, error: { message: "fk error" } } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { deleteCliente } = await import("../clientes.actions");
      const res = await deleteCliente("cli-1");
      expect(res?.error).toBe("fk error");
    });
  });
});
