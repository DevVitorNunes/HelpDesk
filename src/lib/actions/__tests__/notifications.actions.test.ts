import { makeSupabaseMock } from "@/test/supabase-mock";

const mockServerClient = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockServerClient(),
}));

describe("notifications.actions", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("markNotificationRead", () => {
    it("marca notificação como lida pelo id", async () => {
      const { client } = makeSupabaseMock({
        from: { notifications: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { markNotificationRead } = await import("../notifications.actions");
      await markNotificationRead("n-1");

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.update).toHaveBeenCalledWith({ lida: true });
      expect(builder.eq).toHaveBeenCalledWith("id", "n-1");
    });
  });

  describe("markAllNotificationsRead", () => {
    it("marca todas as notificações não lidas do usuário", async () => {
      const { client } = makeSupabaseMock({
        from: { notifications: { update: { data: null, error: null } } },
      });
      mockServerClient.mockResolvedValue(client);

      const { markAllNotificationsRead } = await import(
        "../notifications.actions"
      );
      await markAllNotificationsRead("u-1");

      const builder = (client.from as jest.Mock).mock.results[0].value;
      expect(builder.update).toHaveBeenCalledWith({ lida: true });
      expect(builder.eq).toHaveBeenCalledWith("usuario_id", "u-1");
      expect(builder.eq).toHaveBeenCalledWith("lida", false);
    });
  });
});
