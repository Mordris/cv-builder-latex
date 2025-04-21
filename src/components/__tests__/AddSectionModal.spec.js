// src/components/__tests__/AddSectionModal.spec.js
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import AddSectionModal from "../AddSectionModal.vue";
import { Transition } from "vue"; // Import Transition stub if needed

describe("AddSectionModal.vue", () => {
  const renderModal = (props = { show: true }) => {
    return render(AddSectionModal, {
      props,
      global: {
        // Stub Transition component to avoid transition complexities in testing DOM state
        stubs: {
          Transition: {
            template: '<div v-if="show"><slot/></div>',
            props: ["name", "show"],
          },
        },
      },
    });
  };

  it("does not render when show prop is false", () => {
    renderModal({ show: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); // Modal role might vary, check structure
    expect(screen.queryByText("Add New Section")).not.toBeInTheDocument();
  });

  it("renders when show prop is true", () => {
    renderModal({ show: true });
    expect(screen.getByText("Add New Section")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /work experience/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /education/i })
    ).toBeInTheDocument();
    // Add checks for other buttons if needed
  });

  it('emits "close" when close button is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = renderModal();

    // Find close button by its icon class or add a title/aria-label
    const closeButton = screen.getByRole("button", { name: "" }); // Assuming close button has no text, maybe add aria-label="Close"
    await user.click(closeButton);

    expect(emitted()).toHaveProperty("close");
  });

  it('emits "close" when clicking outside the modal content (on the backdrop)', async () => {
    const user = userEvent.setup();
    const { emitted } = renderModal();

    // Click the backdrop div (assuming it's the root element with the @click.self)
    const backdrop = screen.getByText("Add New Section").closest(".fixed"); // Find the backdrop
    await user.click(backdrop);

    expect(emitted()).toHaveProperty("close");
  });

  it('emits "select-section" with correct type when an option is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = renderModal();

    const educationButton = screen.getByRole("button", { name: /education/i });
    await user.click(educationButton);

    expect(emitted()).toHaveProperty("select-section");
    expect(emitted()["select-section"][0]).toEqual(["education"]);

    // Test another option
    const skillsButton = screen.getByRole("button", { name: /skills/i });
    await user.click(skillsButton);
    expect(emitted()["select-section"][1]).toEqual(["skills"]);
  });
});
