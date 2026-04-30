import { revalidatePath } from "next/cache";
import { buildFormData, makeSupabaseMock } from "@/test/supabase-mock";

const mockServerClient = jest.fn();
const mockGetCompanyId = jest.fn(async () => "c-1");

jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockServerClient(),
  getCompanyId: () => mockGetCompanyId(),
}));

describe("comments.actions", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("createComment", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { createComment } = await import("../comments.actions");
      await expect(
        createComment("t-1", undefined, buildFormData({ body: "olá" }))
      ).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("rejeita corpo vazio", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerClient.mockResolvedValue(client);

      const { createComment } = await import("../comments.actions");
      const res = await createComment(
        "t-1",
        undefined,
        buildFormData({ body: "   " })
      );
      expect(res?.error).toMatch(/vazio/);
    });

    it("cria comentário com author_id e company_id", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { comments: { insert: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { createComment } = await import("../comments.actions");
      const res = await createComment(
        "t-1",
        undefined,
        buildFormData({ body: "comentário válido" })
      );

      expect(res).toBeUndefined();
      expect(revalidatePath).toHaveBeenCalledWith("/tickets/t-1");

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          body: "comentário válido",
          author_id: "u-1",
          ticket_id: "t-1",
          company_id: "c-1",
        })
      );
    });

    it("retorna erro do supabase", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { comments: { insert: { data: null, error: { message: "denied" } } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { createComment } = await import("../comments.actions");
      const res = await createComment(
        "t-1",
        undefined,
        buildFormData({ body: "x" })
      );
      expect(res?.error).toBe("denied");
    });
  });

  describe("updateComment", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { updateComment } = await import("../comments.actions");
      await expect(updateComment("c-1", "novo body")).rejects.toThrow(
        "NEXT_REDIRECT:/login"
      );
    });

    it("rejeita corpo vazio (após trim)", async () => {
      const { client } = makeSupabaseMock({ auth: { user: { id: "u-1" } } });
      mockServerClient.mockResolvedValue(client);

      const { updateComment } = await import("../comments.actions");
      const res = await updateComment("c-1", "  ");
      expect(res?.error).toMatch(/vazio/);
    });

    it("atualiza comentário com sucesso", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { comments: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { updateComment } = await import("../comments.actions");
      const res = await updateComment("c-1", "novo");
      expect(res).toEqual({});

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.update).toHaveBeenCalledWith({ body: "novo" });
    });
  });

  describe("deleteComment", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { deleteComment } = await import("../comments.actions");
      await expect(deleteComment("c-1", "t-1")).rejects.toThrow(
        "NEXT_REDIRECT:/login"
      );
    });

    it("deleta e revalida", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { comments: { delete: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { deleteComment } = await import("../comments.actions");
      const res = await deleteComment("c-1", "t-1");

      expect(res).toEqual({});
      expect(revalidatePath).toHaveBeenCalledWith("/tickets/t-1");
    });
  });
});
