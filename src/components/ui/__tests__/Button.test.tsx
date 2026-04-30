import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("renderiza o texto", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("aplica variante primary por padrão", () => {
    render(<Button>x</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");
  });

  it("aplica variante danger", () => {
    render(<Button variant="danger">delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });

  it("desabilita quando loading=true", () => {
    render(<Button loading>x</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("desabilita quando disabled=true", () => {
    render(<Button disabled>x</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("dispara onClick", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("não dispara onClick quando desabilitado", () => {
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} disabled>
        x
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renderiza ícone de loading quando loading=true", () => {
    render(<Button loading>x</Button>);
    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("aceita size=%s", (size) => {
    render(<Button size={size}>x</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
