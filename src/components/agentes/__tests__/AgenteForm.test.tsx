import { render, screen, fireEvent } from "@testing-library/react";
import { AgenteForm } from "../AgenteForm";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const baseAgente = {
  id: "1",
  nome: "Agente A",
  email: "a@a.com",
  telefone: "(11) 99999-9999",
  user_id: null,
  company_id: null,
  deletado: false,
  created_at: null,
  updated_at: null,
};

describe("AgenteForm", () => {
  it("renderiza campo de senha em modo criação", () => {
    render(<AgenteForm action={jest.fn()} />);
    expect(screen.getByLabelText("Senha inicial")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha inicial")).toBeRequired();
    expect(screen.getByLabelText("Senha inicial")).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("oculta campo de senha em modo edição", () => {
    render(<AgenteForm action={jest.fn()} agente={baseAgente} />);
    expect(screen.queryByLabelText("Senha inicial")).not.toBeInTheDocument();
  });

  it("botão muda label entre criar e editar", () => {
    const { rerender } = render(<AgenteForm action={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: "Criar agente" })
    ).toBeInTheDocument();

    rerender(<AgenteForm action={jest.fn()} agente={baseAgente} />);
    expect(
      screen.getByRole("button", { name: "Salvar alterações" })
    ).toBeInTheDocument();
  });

  it("preenche campos com defaultValue em modo edição", () => {
    render(<AgenteForm action={jest.fn()} agente={baseAgente} />);
    expect(screen.getByLabelText("Nome")).toHaveValue("Agente A");
    expect(screen.getByLabelText("E-mail")).toHaveValue("a@a.com");
    expect(screen.getByLabelText("Telefone")).toHaveValue("(11) 99999-9999");
  });

  it("formata telefone celular (11 dígitos)", () => {
    render(<AgenteForm action={jest.fn()} />);
    const phone = screen.getByLabelText("Telefone");
    fireEvent.change(phone, { target: { value: "11987654321" } });
    expect(phone).toHaveValue("(11) 98765-4321");
  });

  it("Nome e E-mail são obrigatórios", () => {
    render(<AgenteForm action={jest.fn()} />);
    expect(screen.getByLabelText("Nome")).toBeRequired();
    expect(screen.getByLabelText("E-mail")).toBeRequired();
  });

  it("aciona onCancel quando Cancelar é clicado", () => {
    const onCancel = jest.fn();
    render(<AgenteForm action={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
