import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/lib/actions/auth.actions", () => ({
  registerCompany: jest.fn(),
}));

import RegisterPage from "../page";

describe("RegisterPage (smoke)", () => {
  it("renderiza dois grupos: empresa e administrador", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Dados da empresa")).toBeInTheDocument();
    expect(screen.getByText("Administrador da conta")).toBeInTheDocument();
  });

  it("renderiza todos os campos da empresa", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText("Nome da empresa")).toBeInTheDocument();
    expect(screen.getByLabelText("CNPJ")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail da empresa")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefone")).toBeInTheDocument();
  });

  it("renderiza todos os campos do administrador", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
  });

  it("formata CNPJ enquanto digita", () => {
    render(<RegisterPage />);
    const cnpj = screen.getByLabelText("CNPJ") as HTMLInputElement;
    fireEvent.change(cnpj, { target: { value: "11222333000181" } });
    expect(cnpj.value).toBe("11.222.333/0001-81");
  });

  it("formata Telefone enquanto digita", () => {
    render(<RegisterPage />);
    const tel = screen.getByLabelText("Telefone") as HTMLInputElement;
    fireEvent.change(tel, { target: { value: "11987654321" } });
    expect(tel.value).toBe("(11) 98765-4321");
  });

  it("link para /login presente", () => {
    render(<RegisterPage />);
    const link = screen.getByRole("link", { name: "Entrar" });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("alterna visibilidade da senha do admin", () => {
    render(<RegisterPage />);
    const senha = screen.getByLabelText("Senha") as HTMLInputElement;
    expect(senha.type).toBe("password");
    fireEvent.click(screen.getByLabelText("Mostrar senha"));
    expect(senha.type).toBe("text");
  });

  it("campos obrigatórios marcados como required", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText("Nome da empresa")).toBeRequired();
    expect(screen.getByLabelText("CNPJ")).toBeRequired();
    expect(screen.getByLabelText("E-mail da empresa")).toBeRequired();
    expect(screen.getByLabelText("Nome completo")).toBeRequired();
    expect(screen.getByLabelText("E-mail")).toBeRequired();
    expect(screen.getByLabelText("Senha")).toBeRequired();
  });
});
