import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "../Pagination";

describe("Pagination", () => {
  it("não renderiza quando totalPages <= 1", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renderiza páginas e botões anterior/próximo", () => {
    render(<Pagination page={2} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByLabelText("Página anterior")).toBeInTheDocument();
    expect(screen.getByLabelText("Próxima página")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });

  it("desabilita 'anterior' na primeira página", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByLabelText("Página anterior")).toBeDisabled();
  });

  it("desabilita 'próximo' na última página", () => {
    render(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByLabelText("Próxima página")).toBeDisabled();
  });

  it("dispara onPageChange ao clicar em uma página", () => {
    const onPageChange = jest.fn();
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("dispara onPageChange com page-1 ao clicar 'anterior'", () => {
    const onPageChange = jest.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText("Página anterior"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("dispara onPageChange com page+1 ao clicar 'próximo'", () => {
    const onPageChange = jest.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText("Próxima página"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("destaca a página atual visualmente", () => {
    render(<Pagination page={2} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "2" })).toHaveClass(
      "bg-primary"
    );
  });
});
