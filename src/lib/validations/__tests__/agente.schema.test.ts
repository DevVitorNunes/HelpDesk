import { AgenteSchema } from "../agente.schema";

describe("AgenteSchema", () => {
  it("aceita criação com senha", () => {
    const r = AgenteSchema.safeParse({
      nome: "Agente",
      email: "a@a.com",
      password: "12345678",
    });
    expect(r.success).toBe(true);
  });

  it("aceita atualização sem senha (omit)", () => {
    const r = AgenteSchema.omit({ password: true }).safeParse({
      nome: "Agente",
      email: "a@a.com",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita senha curta", () => {
    const r = AgenteSchema.safeParse({
      nome: "A",
      email: "a@a.com",
      password: "1234",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.password?.[0]).toMatch(/8/);
    }
  });

  it("rejeita e-mail inválido", () => {
    const r = AgenteSchema.safeParse({ nome: "A", email: "x" });
    expect(r.success).toBe(false);
  });

  it("rejeita nome vazio", () => {
    const r = AgenteSchema.safeParse({ nome: "", email: "a@a.com" });
    expect(r.success).toBe(false);
  });

  it("rejeita nome acima de 100 caracteres", () => {
    const r = AgenteSchema.safeParse({
      nome: "x".repeat(101),
      email: "a@a.com",
    });
    expect(r.success).toBe(false);
  });
});
