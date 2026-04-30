import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../Modal";

describe("Modal", () => {
  it("não renderiza quando open=false", () => {
    render(
      <Modal open={false} onClose={() => {}}>
        conteúdo
      </Modal>
    );
    expect(screen.queryByText("conteúdo")).not.toBeInTheDocument();
  });

  it("renderiza conteúdo quando open=true", () => {
    render(
      <Modal open onClose={() => {}}>
        conteúdo
      </Modal>
    );
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("renderiza título quando fornecido", () => {
    render(
      <Modal open onClose={() => {}} title="Confirmação">
        x
      </Modal>
    );
    expect(screen.getByText("Confirmação")).toBeInTheDocument();
  });

  it("dispara onClose ao clicar no botão fechar", () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="x">
        y
      </Modal>
    );
    fireEvent.click(screen.getByLabelText("Fechar"));
    expect(onClose).toHaveBeenCalled();
  });

  it("dispara onClose ao pressionar Escape", () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose}>
        x
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("possui role=dialog e aria-modal", () => {
    render(
      <Modal open onClose={() => {}}>
        x
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal");
  });
});
