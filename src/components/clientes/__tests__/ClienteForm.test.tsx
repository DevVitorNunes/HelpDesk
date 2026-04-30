import { render, screen, fireEvent } from "@testing-library/react";
import { ClienteForm } from "../ClienteForm";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe("ClienteForm", () => {
  it("renderiza campos vazios em modo criação", () => {
    render(<ClienteForm action={jest.fn()} />);

    expect(screen.getByLabelText("Nome")).toHaveValue("");
    expect(screen.getByLabelText("E-mail")).toHaveValue("");
    expect(screen.getByLabelText("Telefone")).toHaveValue("");
    expect(
      screen.getByRole("button", { name: "Criar cliente" })
    ).toBeInTheDocument();
  });

  it("preenche campos com defaultValue em modo edição", () => {
    const cliente = {
      id: "1",
      name: "Cliente A",
      email: "a@a.com",
      phone: "(11) 99999-9999",
      user_id: null,
      company_id: null,
      deletado: false,
      created_at: null,
      updated_at: null,
    };
    render(<ClienteForm action={jest.fn()} cliente={cliente} />);

    expect(screen.getByLabelText("Nome")).toHaveValue("Cliente A");
    expect(screen.getByLabelText("E-mail")).toHaveValue("a@a.com");
    expect(screen.getByLabelText("Telefone")).toHaveValue("(11) 99999-9999");
    expect(
      screen.getByRole("button", { name: "Salvar alterações" })
    ).toBeInTheDocument();
  });

  it("formata telefone celular (11 dígitos)", () => {
    render(<ClienteForm action={jest.fn()} />);
    const phone = screen.getByLabelText("Telefone");
    fireEvent.change(phone, { target: { value: "11987654321" } });
    expect(phone).toHaveValue("(11) 98765-4321");
  });

  it("formata telefone fixo (10 dígitos)", () => {
    render(<ClienteForm action={jest.fn()} />);
    const phone = screen.getByLabelText("Telefone");
    fireEvent.change(phone, { target: { value: "1133334444" } });
    expect(phone).toHaveValue("(11) 3333-4444");
  });

  it("Nome e E-mail são obrigatórios", () => {
    render(<ClienteForm action={jest.fn()} />);
    expect(screen.getByLabelText("Nome")).toBeRequired();
    expect(screen.getByLabelText("E-mail")).toBeRequired();
  });

  it("E-mail tem type=email", () => {
    render(<ClienteForm action={jest.fn()} />);
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
  });

  it("aciona onCancel quando Cancelar é clicado", () => {
    const onCancel = jest.fn();
    render(<ClienteForm action={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
