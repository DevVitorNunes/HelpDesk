import { ClienteSchema } from "../cliente.schema";

describe("ClienteSchema", () => {
  it("aceita payload válido", () => {
    const r = ClienteSchema.safeParse({
      name: "Cliente A",
      email: "cliente@example.com",
      phone: "(11) 99999-9999",
    });
    expect(r.success).toBe(true);
  });

  it("aceita sem telefone", () => {
    const r = ClienteSchema.safeParse({
      name: "Cliente B",
      email: "b@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const r = ClienteSchema.safeParse({ name: "", email: "a@a.com" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.name?.[0]).toMatch(/obrigatório/);
    }
  });

  it("rejeita nome acima de 100 caracteres", () => {
    const r = ClienteSchema.safeParse({
      name: "x".repeat(101),
      email: "a@a.com",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const r = ClienteSchema.safeParse({ name: "Ok", email: "not-email" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.email?.[0]).toMatch(/inválido/);
    }
  });
});
