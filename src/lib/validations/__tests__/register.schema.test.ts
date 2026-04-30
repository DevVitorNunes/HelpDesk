import { RegisterSchema } from "../register.schema";

const validBase = {
  empresa_nome: "Empresa LTDA",
  empresa_cnpj: "11.222.333/0001-81", // valid CNPJ
  empresa_email: "contato@empresa.com",
  empresa_telefone: "(11) 99999-9999",
  admin_nome: "Admin",
  admin_email: "admin@empresa.com",
  admin_password: "senha1234",
};

describe("RegisterSchema", () => {
  it("aceita payload válido", () => {
    const r = RegisterSchema.safeParse(validBase);
    expect(r.success).toBe(true);
  });

  it("aceita telefone vazio (opcional)", () => {
    const r = RegisterSchema.safeParse({ ...validBase, empresa_telefone: "" });
    expect(r.success).toBe(true);
  });

  it("rejeita CNPJ inválido (dígitos verificadores errados)", () => {
    const r = RegisterSchema.safeParse({
      ...validBase,
      empresa_cnpj: "11.222.333/0001-99",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.empresa_cnpj?.[0]).toMatch(/CNPJ/);
    }
  });

  it("rejeita CNPJ com todos dígitos iguais", () => {
    const r = RegisterSchema.safeParse({
      ...validBase,
      empresa_cnpj: "11.111.111/1111-11",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita telefone fora do formato (00) 00000-0000", () => {
    const r = RegisterSchema.safeParse({
      ...validBase,
      empresa_telefone: "11999999999",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita senha de admin com menos de 8 caracteres", () => {
    const r = RegisterSchema.safeParse({
      ...validBase,
      admin_password: "1234567",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita senha de admin acima de 72 caracteres (limite bcrypt)", () => {
    const r = RegisterSchema.safeParse({
      ...validBase,
      admin_password: "x".repeat(73),
    });
    expect(r.success).toBe(false);
  });

  it("rejeita e-mail de empresa inválido", () => {
    const r = RegisterSchema.safeParse({
      ...validBase,
      empresa_email: "not-email",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita e-mail de admin inválido", () => {
    const r = RegisterSchema.safeParse({
      ...validBase,
      admin_email: "not-email",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita nome de empresa muito curto", () => {
    const r = RegisterSchema.safeParse({ ...validBase, empresa_nome: "X" });
    expect(r.success).toBe(false);
  });

  it("rejeita nome de admin muito curto", () => {
    const r = RegisterSchema.safeParse({ ...validBase, admin_nome: "X" });
    expect(r.success).toBe(false);
  });
});
