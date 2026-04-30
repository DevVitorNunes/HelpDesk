import { render, screen } from "@testing-library/react";
import { Spinner } from "../Spinner";

describe("Spinner", () => {
  it("renderiza com aria-label de carregamento", () => {
    render(<Spinner />);
    expect(screen.getByLabelText("Carregando")).toBeInTheDocument();
  });

  it("aplica classe customizada", () => {
    const { container } = render(<Spinner className="text-red-500" />);
    expect(container.querySelector("svg")).toHaveClass("text-red-500");
  });

  it("possui classe de animação", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toHaveClass("animate-spin");
  });
});
