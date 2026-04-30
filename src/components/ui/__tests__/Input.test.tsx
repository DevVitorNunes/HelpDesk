import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../Input";

describe("Input", () => {
  it("renderiza com label associado via htmlFor/id", () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input.id).toBe("email");
  });

  it("renderiza sem label", () => {
    render(<Input placeholder="busca" />);
    expect(screen.getByPlaceholderText("busca")).toBeInTheDocument();
  });

  it("exibe mensagem de erro", () => {
    render(<Input label="Email" error="E-mail inválido" />);
    expect(screen.getByText("E-mail inválido")).toBeInTheDocument();
  });

  it("aplica classe de erro quando error é fornecido", () => {
    render(<Input label="x" error="erro" />);
    expect(screen.getByLabelText("x")).toHaveClass("border-red-400");
  });

  it("propaga onChange", () => {
    const onChange = jest.fn();
    render(<Input label="Nome" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "joão" },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("renderiza rightAdornment", () => {
    render(<Input label="x" rightAdornment={<span>$</span>} />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("usa id customizado quando fornecido", () => {
    render(<Input label="Email" id="custom-id" />);
    expect(screen.getByLabelText("Email").id).toBe("custom-id");
  });
});
