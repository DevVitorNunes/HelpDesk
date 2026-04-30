import { TicketSchema } from "../ticket.schema";

const validBase = {
  title: "Servidor offline",
  description: "Cliente reportou indisponibilidade",
  client_id: "11111111-1111-1111-1111-111111111111",
  priority: "Alta",
};

describe("TicketSchema", () => {
  it("aceita payload mínimo válido com defaults", () => {
    const r = TicketSchema.safeParse(validBase);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("Aberto");
      expect(r.data.agente_id).toBeUndefined();
    }
  });

  it("aceita agente_id como uuid válido", () => {
    const r = TicketSchema.safeParse({
      ...validBase,
      agente_id: "22222222-2222-2222-2222-222222222222",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita title vazio", () => {
    const r = TicketSchema.safeParse({ ...validBase, title: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.title?.[0]).toMatch(/obrigatório/);
    }
  });

  it("rejeita title acima de 200 caracteres", () => {
    const r = TicketSchema.safeParse({ ...validBase, title: "x".repeat(201) });
    expect(r.success).toBe(false);
  });

  it("rejeita description vazia", () => {
    const r = TicketSchema.safeParse({ ...validBase, description: "" });
    expect(r.success).toBe(false);
  });

  it("rejeita client_id que não é uuid", () => {
    const r = TicketSchema.safeParse({ ...validBase, client_id: "not-a-uuid" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.client_id?.[0]).toMatch(/cliente/);
    }
  });

  it("rejeita prioridade fora dos enums", () => {
    const r = TicketSchema.safeParse({ ...validBase, priority: "Crítica" });
    expect(r.success).toBe(false);
  });

  it("rejeita status fora dos enums", () => {
    const r = TicketSchema.safeParse({ ...validBase, status: "Pendente" });
    expect(r.success).toBe(false);
  });

  it.each(["Baixa", "Média", "Alta", "Urgente"])("aceita prioridade %s", (p) => {
    const r = TicketSchema.safeParse({ ...validBase, priority: p });
    expect(r.success).toBe(true);
  });

  it.each(["Aberto", "Em progresso", "Resolvido", "Fechado"])(
    "aceita status %s",
    (s) => {
      const r = TicketSchema.safeParse({ ...validBase, status: s });
      expect(r.success).toBe(true);
    }
  );
});
