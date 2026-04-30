import { render, screen } from "@testing-library/react";
import { StatusBadge, PriorityBadge } from "../Badge";

describe("StatusBadge", () => {
  it.each(["Aberto", "Em progresso", "Resolvido", "Fechado"] as const)(
    "renderiza status %s com texto",
    (status) => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    }
  );

  it("aplica cor azul para Aberto", () => {
    render(<StatusBadge status="Aberto" />);
    expect(screen.getByText("Aberto")).toHaveClass("bg-blue-100");
  });

  it("aplica cor verde para Resolvido", () => {
    render(<StatusBadge status="Resolvido" />);
    expect(screen.getByText("Resolvido")).toHaveClass("bg-green-100");
  });
});

describe("PriorityBadge", () => {
  it.each(["Baixa", "Média", "Alta", "Urgente"] as const)(
    "renderiza prioridade %s",
    (priority) => {
      render(<PriorityBadge priority={priority} />);
      expect(screen.getByText(priority)).toBeInTheDocument();
    }
  );

  it("aplica cor vermelha para Urgente", () => {
    render(<PriorityBadge priority="Urgente" />);
    expect(screen.getByText("Urgente")).toHaveClass("bg-red-100");
  });

  it("aplica cor verde para Baixa", () => {
    render(<PriorityBadge priority="Baixa" />);
    expect(screen.getByText("Baixa")).toHaveClass("bg-green-100");
  });
});
