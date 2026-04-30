import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/lib/actions/auth.actions", () => ({
  signIn: jest.fn(),
  requestPasswordReset: jest.fn(),
}));

import LoginPage from "../page";

describe("LoginPage (smoke)", () => {
  it("renderiza título e formulário de login", () => {
    render(<LoginPage />);
    expect(screen.getByText("HelpDesk")).toBeInTheDocument();
    expect(screen.getByText("Entrar na sua conta")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("mostra link 'Criar conta' que aponta para /register", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: "Criar conta" });
    expect(link).toHaveAttribute("href", "/register");
  });

  it("alterna para o formulário de recuperação ao clicar em 'Esqueci minha senha'", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Esqueci minha senha"));
    expect(screen.getByText("Recuperar senha")).toBeInTheDocument();
  });

  it("alterna visibilidade da senha ao clicar no toggle", () => {
    render(<LoginPage />);
    const senha = screen.getByLabelText("Senha") as HTMLInputElement;
    expect(senha.type).toBe("password");
    fireEvent.click(screen.getByLabelText("Mostrar senha"));
    expect(senha.type).toBe("text");
  });

  it("e-mail e senha são obrigatórios", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("E-mail")).toBeRequired();
    expect(screen.getByLabelText("Senha")).toBeRequired();
  });
});
