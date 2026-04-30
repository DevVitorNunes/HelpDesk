import { render, screen, fireEvent } from "@testing-library/react";
import { TicketForm } from "../TicketForm";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const agentes = [
  { id: "ag-1", nome: "Agente Um" },
  { id: "ag-2", nome: "Agente Dois" },
];

const clientes = [
  { id: "cli-1", name: "Cliente X" },
  { id: "cli-2", name: "Cliente Y" },
];

describe("TicketForm", () => {
  it("renderiza campos obrigatórios em modo criação", () => {
    render(
      <TicketForm action={jest.fn()} agentes={agentes} clientes={clientes} />
    );

    expect(screen.getByLabelText("Título")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
    expect(screen.getByLabelText("Cliente")).toBeInTheDocument();
    expect(screen.getByLabelText("Prioridade")).toBeInTheDocument();
    expect(screen.getByLabelText("Agente responsável")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Criar ticket" })
    ).toBeInTheDocument();
  });

  it("não exibe Status quando showStatus=false", () => {
    render(
      <TicketForm action={jest.fn()} agentes={agentes} clientes={clientes} />
    );
    expect(screen.queryByLabelText("Status")).not.toBeInTheDocument();
  });

  it("exibe Status quando showStatus=true", () => {
    render(
      <TicketForm
        action={jest.fn()}
        agentes={agentes}
        clientes={clientes}
        showStatus
      />
    );
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("popula opções de cliente e agente nos selects", () => {
    render(
      <TicketForm action={jest.fn()} agentes={agentes} clientes={clientes} />
    );
    const clienteSelect = screen.getByLabelText("Cliente");
    expect(clienteSelect).toHaveTextContent("Cliente X");
    expect(clienteSelect).toHaveTextContent("Cliente Y");

    const agenteSelect = screen.getByLabelText("Agente responsável");
    expect(agenteSelect).toHaveTextContent("Agente Um");
    expect(agenteSelect).toHaveTextContent("Agente Dois");
  });

  it("Título e Descrição são obrigatórios", () => {
    render(
      <TicketForm action={jest.fn()} agentes={agentes} clientes={clientes} />
    );
    expect(screen.getByLabelText("Título")).toBeRequired();
    expect(screen.getByLabelText("Descrição")).toBeRequired();
    expect(screen.getByLabelText("Cliente")).toBeRequired();
  });

  it("inicializa prioridade como 'Média' por padrão", () => {
    render(
      <TicketForm action={jest.fn()} agentes={agentes} clientes={clientes} />
    );
    expect(screen.getByLabelText("Prioridade")).toHaveValue("Média");
  });

  it("preenche campos quando ticket é fornecido (edição)", () => {
    const ticket = {
      id: "t-1",
      title: "Erro X",
      description: "Detalhe do erro",
      client_id: "cli-1",
      agente_id: "ag-2",
      priority: "Alta" as const,
      status: "Em progresso" as const,
      user_id: "u-1",
      company_id: "c-1",
      deletado: false,
      created_at: null,
      updated_at: null,
      agentes: { id: "ag-2", nome: "Agente Dois", email: "" },
      clients: { id: "cli-1", name: "Cliente X", email: "" },
      users: { id: "u-1", name: "User" },
    };

    render(
      <TicketForm
        action={jest.fn()}
        agentes={agentes}
        clientes={clientes}
        ticket={ticket}
        showStatus
      />
    );

    expect(screen.getByLabelText("Título")).toHaveValue("Erro X");
    expect(screen.getByLabelText("Descrição")).toHaveValue("Detalhe do erro");
    expect(screen.getByLabelText("Cliente")).toHaveValue("cli-1");
    expect(screen.getByLabelText("Prioridade")).toHaveValue("Alta");
    expect(screen.getByLabelText("Status")).toHaveValue("Em progresso");
    expect(
      screen.getByRole("button", { name: "Salvar alterações" })
    ).toBeInTheDocument();
  });

  it("aciona onCancel quando Cancelar é clicado", () => {
    const onCancel = jest.fn();
    render(
      <TicketForm
        action={jest.fn()}
        agentes={agentes}
        clientes={clientes}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
