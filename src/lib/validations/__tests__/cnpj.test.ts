import { validateCNPJ, formatCNPJ } from "../cnpj";

describe("validateCNPJ", () => {
  it("aceita CNPJ válido formatado", () => {
    expect(validateCNPJ("11.222.333/0001-81")).toBe(true);
  });

  it("aceita CNPJ válido sem formatação", () => {
    expect(validateCNPJ("11222333000181")).toBe(true);
  });

  it("rejeita CNPJ com menos de 14 dígitos", () => {
    expect(validateCNPJ("123456")).toBe(false);
  });

  it("rejeita CNPJ com mais de 14 dígitos", () => {
    expect(validateCNPJ("112223330001819")).toBe(false);
  });

  it("rejeita CNPJ com todos os dígitos iguais", () => {
    expect(validateCNPJ("11111111111111")).toBe(false);
    expect(validateCNPJ("00000000000000")).toBe(false);
  });

  it("rejeita CNPJ com primeiro dígito verificador errado", () => {
    expect(validateCNPJ("11.222.333/0001-91")).toBe(false);
  });

  it("rejeita CNPJ com segundo dígito verificador errado", () => {
    expect(validateCNPJ("11.222.333/0001-80")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(validateCNPJ("")).toBe(false);
  });
});

describe("formatCNPJ", () => {
  it("formata 14 dígitos", () => {
    expect(formatCNPJ("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("formata progressivamente conforme dígitos vão sendo digitados", () => {
    expect(formatCNPJ("11")).toBe("11");
    expect(formatCNPJ("112")).toBe("11.2");
    expect(formatCNPJ("11222333")).toBe("11.222.333");
    expect(formatCNPJ("11222333000")).toBe("11.222.333/000");
    expect(formatCNPJ("112223330001")).toBe("11.222.333/0001");
    expect(formatCNPJ("1122233300018")).toBe("11.222.333/0001-8");
  });

  it("limita a 14 dígitos", () => {
    expect(formatCNPJ("112223330001815555")).toBe("11.222.333/0001-81");
  });

  it("ignora caracteres não numéricos", () => {
    expect(formatCNPJ("abc11222333000181xyz")).toBe("11.222.333/0001-81");
  });
});
