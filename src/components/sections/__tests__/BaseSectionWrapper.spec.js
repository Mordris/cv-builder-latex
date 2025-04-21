// src/components/sections/__tests__/BaseSectionWrapper.spec.js
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import BaseSectionWrapper from "../BaseSectionWrapper.vue";

describe("BaseSectionWrapper.vue", () => {
  const renderComponent = (props = {}, slots = {}) => {
    return render(BaseSectionWrapper, { props, slots });
  };

  it("renders header and content slots", () => {
    renderComponent(
      {},
      {
        header: '<h3 data-testid="header-slot">My Header</h3>',
        content: '<div data-testid="content-slot">My Content</div>',
      }
    );

    expect(screen.getByTestId("header-slot")).toHaveTextContent("My Header");
    expect(screen.getByTestId("content-slot")).toHaveTextContent("My Content");
  });

  it("emits delete-section when delete button is clicked", async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();

    const deleteButton = screen.getByRole("button", {
      name: /delete section/i,
    });
    await user.click(deleteButton);

    expect(emitted()).toHaveProperty("delete-section");
    expect(emitted()["delete-section"]).toHaveLength(1);
  });

  it("emits move-section with -1 when move up button is clicked", async () => {
    const user = userEvent.setup();
    // Enable button by not being first
    const { emitted } = renderComponent({ isFirst: false });

    const moveUpButton = screen.getByRole("button", { name: /move up/i });
    await user.click(moveUpButton);

    expect(emitted()).toHaveProperty("move-section");
    expect(emitted()["move-section"][0]).toEqual([-1]);
  });

  it("emits move-section with 1 when move down button is clicked", async () => {
    const user = userEvent.setup();
    // Enable button by not being last
    const { emitted } = renderComponent({ isLast: false });

    const moveDownButton = screen.getByRole("button", { name: /move down/i });
    await user.click(moveDownButton);

    expect(emitted()).toHaveProperty("move-section");
    expect(emitted()["move-section"][0]).toEqual([1]);
  });

  it("disables move up button when isFirst is true", () => {
    renderComponent({ isFirst: true, isLast: false });
    expect(screen.getByRole("button", { name: /move up/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /move down/i })
    ).not.toBeDisabled();
  });

  it("disables move down button when isLast is true", () => {
    renderComponent({ isFirst: false, isLast: true });
    expect(screen.getByRole("button", { name: /move up/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /move down/i })).toBeDisabled();
  });

  it("disables both move buttons when isFirst and isLast are true (only one section)", () => {
    renderComponent({ isFirst: true, isLast: true });
    expect(screen.getByRole("button", { name: /move up/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /move down/i })).toBeDisabled();
  });
});
