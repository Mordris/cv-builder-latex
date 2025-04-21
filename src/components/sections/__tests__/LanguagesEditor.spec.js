// src/components/sections/__tests__/LanguagesEditor.spec.js
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import LanguagesEditor from "../LanguagesEditor.vue";

const mockGenerateUUID = vi.fn(() => `mock-uuid-${Math.random()}`);

describe("LanguagesEditor.vue", () => {
  const initialProps = {
    modelValue: {
      id: "sec-lang",
      type: "languages",
      title: "Languages Known",
      items: [{ id: "lang-1", name: "English", level: "Native" }],
    },
    isFirst: false,
    isLast: false,
  };

  const renderComponent = (props = initialProps) => {
    return render(LanguagesEditor, {
      props,
      global: {
        provide: { generateUUID: mockGenerateUUID },
        stubs: {
          BaseSectionWrapper: {
            template: '<div><slot name="header"/><slot name="content"/></div>',
          },
          // InputField might need stubbing if its internal label logic interferes,
          // but likely okay here.
          // InputField: true,
        },
      },
    });
  };

  it("renders initial language item fields", () => {
    renderComponent();
    expect(screen.getByText("Languages Known")).toBeInTheDocument();
    // Check the first item label exists
    expect(screen.getByLabelText("Language")).toBeInTheDocument();
    // Check value by role
    expect(screen.getByRole("textbox")).toHaveValue("English");
    expect(screen.getByRole("combobox")).toHaveValue("Native"); // Select element
  });

  it("updates language name and emits update:modelValue", async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    // Use getByRole as only first item has label
    const nameInput = screen.getByRole("textbox");

    await user.clear(nameInput);
    await user.type(nameInput, "Spanish");

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items[0].name).toBe("Spanish");
    expect(lastEmittedValue.items[0].level).toBe("Native"); // Level preserved
  });

  it("updates language level and emits update:modelValue", async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const levelSelect = screen.getByRole("combobox"); // Select proficiency

    await user.selectOptions(levelSelect, "Fluent");

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items[0].level).toBe("Fluent");
    expect(lastEmittedValue.items[0].name).toBe("English"); // Name preserved
  });

  it('adds a new item when "Add Language" is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const addButton = screen.getByRole("button", { name: /add language/i });

    await user.click(addButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(2);
    expect(lastEmittedValue.items[1]).toEqual({
      id: expect.any(String),
      name: "",
      level: "",
    });
    // Find inputs by their role ('textbox' for text inputs)
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    // Keep the check for select boxes
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
  });

  it("removes an item when remove button is clicked (if more than one item)", async () => {
    const user = userEvent.setup();
    const propsWithTwoItems = {
      ...initialProps,
      modelValue: {
        ...initialProps.modelValue,
        items: [
          { id: "l1", name: "Lang 1", level: "Fluent" },
          { id: "l2", name: "Lang 2", level: "Basic" },
        ],
      },
    };
    const { emitted } = renderComponent(propsWithTwoItems);

    // Find remove button associated with the first language input
    const firstItemRemoveButton = screen
      .getByDisplayValue("Lang 1")
      .closest(".relative") // Go up to the item wrapper
      .querySelector('button[title="Remove Language"]');

    expect(firstItemRemoveButton).toBeInTheDocument();
    await user.click(firstItemRemoveButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(1);
    expect(lastEmittedValue.items[0].name).toBe("Lang 2"); // Second item should remain

    // Check DOM by querying for the remaining input's value
    expect(screen.queryByDisplayValue("Lang 1")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Lang 2")).toBeInTheDocument(); // Check value by display value
    expect(screen.getAllByRole("textbox")).toHaveLength(1); // Check only one text input remains
  });

  it("does NOT remove the last item", async () => {
    renderComponent(initialProps);
    // Find the wrapper for the single language item
    const itemContainer = screen.getByRole("textbox").closest(".relative"); // Adjust selector if needed
    const removeButton = itemContainer.querySelector(
      'button[title="Remove Language"]'
    );
    expect(removeButton).not.toBeInTheDocument(); // Button shouldn't exist due to v-if

    // Verify item still exists
    expect(screen.getByRole("textbox")).toHaveValue("English");
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });
});
