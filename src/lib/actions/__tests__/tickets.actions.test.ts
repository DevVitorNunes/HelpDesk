import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buildFormData, makeSupabaseMock } from "@/test/supabase-mock";

const mockServerClient = jest.fn();
const mockGetCompanyId = jest.fn(async () => "c-1");

jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockServerClient(),
  getCompanyId: () => mockGetCompanyId(),
}));

jest.mock("@/lib/queries/tickets.queries", () => ({
  getTicketById: jest.fn(async () => null),
}));

const validTicket = {
  title: "Servidor offline",
  description: "Cliente reportou indisponibilidade",
  client_id: "11111111-1111-1111-1111-111111111111",
  priority: "Alta",
};

describe("tickets.actions", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("createTicket", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { createTicket } = await import("../tickets.actions");
      await expect(
        createTicket(undefined, buildFormData(validTicket))
      ).rejects.toThrow("NEXT_REDIRECT:/login");
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("retorna fieldErrors quando payload é inválido", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerClient.mockResolvedValue(client);

      const { createTicket } = await import("../tickets.actions");
      const res = await createTicket(
        undefined,
        buildFormData({ ...validTicket, title: "" })
      );
      expect(res?.error?.title).toBeDefined();
    });

    it("cria ticket com company_id, user_id e status 'Aberto'", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { tickets: { single: { data: { id: "t-1" }, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { createTicket } = await import("../tickets.actions");
      const res = await createTicket(undefined, buildFormData(validTicket));

      expect(res).toEqual({ success: true });
      expect(client.from).toHaveBeenCalledWith("tickets");
      expect(revalidatePath).toHaveBeenCalledWith("/tickets");

      const insertCall = (client.from as jest.Mock).mock.results.find(
        (r) => r.value
      )?.value.insert;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "Aberto",
          user_id: "u-1",
          company_id: "c-1",
          agente_id: null,
        })
      );
    });

    it("retorna erro de root se insert falhar", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: {
          tickets: { single: { data: null, error: { message: "db error" } } },
        },
      });
      mockServerClient.mockResolvedValue(client);

      const { createTicket } = await import("../tickets.actions");
      const res = await createTicket(undefined, buildFormData(validTicket));
      expect(res?.error?._root?.[0]).toBe("db error");
    });
  });

  describe("updateTicket", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { updateTicket } = await import("../tickets.actions");
      await expect(
        updateTicket("t-1", undefined, buildFormData(validTicket))
      ).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("atualiza ticket e revalida paths", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { tickets: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { updateTicket } = await import("../tickets.actions");
      const res = await updateTicket("t-1", undefined, buildFormData(validTicket));

      expect(res).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/tickets/t-1");
      expect(revalidatePath).toHaveBeenCalledWith("/tickets");
    });

    it("retorna erro se validação falha", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerClient.mockResolvedValue(client);

      const { updateTicket } = await import("../tickets.actions");
      const res = await updateTicket(
        "t-1",
        undefined,
        buildFormData({ ...validTicket, client_id: "not-uuid" })
      );
      expect(res?.error?.client_id).toBeDefined();
    });
  });

  describe("updateTicketStatus", () => {
    it("retorna erro se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { updateTicketStatus } = await import("../tickets.actions");
      const res = await updateTicketStatus("t-1", "Resolvido");
      expect(res?.error).toBe("Não autenticado");
    });

    it("atualiza status com sucesso", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { tickets: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { updateTicketStatus } = await import("../tickets.actions");
      const res = await updateTicketStatus("t-1", "Resolvido");

      expect(res).toBeUndefined();
      expect(revalidatePath).toHaveBeenCalledWith("/tickets/t-1");
    });

    it("propaga erro do supabase", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: {
          tickets: { update: { data: null, error: { message: "denied" } } },
        },
      });
      mockServerClient.mockResolvedValue(client);

      const { updateTicketStatus } = await import("../tickets.actions");
      const res = await updateTicketStatus("t-1", "Fechado");
      expect(res?.error).toBe("denied");
    });
  });

  describe("deleteTicket", () => {
    it("faz soft delete (deletado=true)", async () => {
      const { client } = makeSupabaseMock({
        from: { tickets: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { deleteTicket } = await import("../tickets.actions");
      const res = await deleteTicket("t-1");

      expect(res).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/tickets");

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.update).toHaveBeenCalledWith({ deletado: true });
      expect(builder.eq).toHaveBeenCalledWith("id", "t-1");
    });

    it("retorna erro do supabase", async () => {
      const { client } = makeSupabaseMock({
        from: {
          tickets: { update: { data: null, error: { message: "fk error" } } },
        },
      });
      mockServerClient.mockResolvedValue(client);

      const { deleteTicket } = await import("../tickets.actions");
      const res = await deleteTicket("t-1");
      expect(res?.error).toBe("fk error");
    });
  });
});
