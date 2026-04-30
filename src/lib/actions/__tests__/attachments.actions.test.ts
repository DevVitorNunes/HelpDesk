import { revalidatePath } from "next/cache";
import { makeSupabaseMock } from "@/test/supabase-mock";

const mockServerClient = jest.fn();
const mockGetCompanyId = jest.fn(async () => "c-1");

jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockServerClient(),
  getCompanyId: () => mockGetCompanyId(),
}));

describe("attachments.actions", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("saveAttachmentMetadata", () => {
    it("redireciona para login se não autenticado", async () => {
      const { client } = makeSupabaseMock({ auth: { user: null } });
      mockServerClient.mockResolvedValue(client);

      const { saveAttachmentMetadata } = await import("../attachments.actions");
      await expect(
        saveAttachmentMetadata("t-1", "f.png", "https://x/f.png", 1024)
      ).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("salva metadata com uploaded_by e company_id", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: { attachments: { insert: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { saveAttachmentMetadata } = await import("../attachments.actions");
      const res = await saveAttachmentMetadata(
        "t-1",
        "doc.pdf",
        "https://x/doc.pdf",
        2048
      );

      expect(res).toBeUndefined();
      expect(revalidatePath).toHaveBeenCalledWith("/tickets/t-1");

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          ticket_id: "t-1",
          nome_arquivo: "doc.pdf",
          url: "https://x/doc.pdf",
          tamanho_bytes: 2048,
          uploaded_by: "u-1",
          company_id: "c-1",
        })
      );
    });

    it("retorna erro do supabase", async () => {
      const { client } = makeSupabaseMock({
        auth: { user: { id: "u-1" } },
        from: {
          attachments: { insert: { data: null, error: { message: "size limit" } } },
        },
      });
      mockServerClient.mockResolvedValue(client);

      const { saveAttachmentMetadata } = await import("../attachments.actions");
      const res = await saveAttachmentMetadata("t-1", "f", "u", 1);
      expect(res?.error).toBe("size limit");
    });
  });

  describe("deleteAttachment", () => {
    it("remove storage e linha da tabela e revalida", async () => {
      const { client } = makeSupabaseMock({
        from: { attachments: { delete: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { deleteAttachment } = await import("../attachments.actions");
      await deleteAttachment("att-1", "t-1", "u-1/t-1/f.png");

      expect(client.storage.from).toHaveBeenCalledWith("attachments");

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith("id", "att-1");
      expect(revalidatePath).toHaveBeenCalledWith("/tickets/t-1");
    });
  });
});
