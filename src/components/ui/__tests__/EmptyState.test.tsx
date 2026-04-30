import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renderiza apenas o título", () => {
    render(<EmptyState title="Sem dados" />);
    expect(screen.getByText("Sem dados")).toBeInTheDocument();
  });

  it("renderiza descrição quando fornecida", () => {
    render(<EmptyState title="Sem dados" description="Cadastre o primeiro" />);
    expect(screen.getByText("Cadastre o primeiro")).toBeInTheDocument();
  });

  it("renderiza ícone customizado", () => {
    render(
      <EmptyState
        title="x"
        icon={<svg data-testid="custom-icon" />}
      />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renderiza ação customizada", () => {
    render(
      <EmptyState
        title="x"
        action={<button>Criar</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument();
  });
});
