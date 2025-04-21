// src/components/sections/__tests__/CustomSectionEditor.spec.js
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import CustomSectionEditor from "../CustomSectionEditor.vue";

const mockGenerateUUID = vi.fn(() => `mock-uuid-${Math.random()}`);

describe("CustomSectionEditor.vue", () => {
  const initialProps = {
    modelValue: {
      id: "sec-custom",
      type: "custom",
      title: "Hobbies",
      items: [
        { id: "custom-1", title: "Hiking", description: "Exploring trails" },
      ],
    },
    isFirst: false,
    isLast: false,
  };

  const renderComponent = (props = initialProps) => {
    return render(CustomSectionEditor, {
      props,
      global: {
        provide: { generateUUID: mockGenerateUUID },
        stubs: {
          BaseSectionWrapper: {
            // Stub to access header slot directly
            template: '<div><slot name="header"/><slot name="content"/></div>',
          },
        },
      },
    });
  };

  it("renders initial custom title and item fields", () => {
    renderComponent();
    expect(screen.getByPlaceholderText("Custom Section Title")).toHaveValue(
      "Hobbies"
    );
    expect(screen.getByLabelText("Entry Title (Optional)")).toHaveValue(
      "Hiking"
    );
    expect(screen.getByLabelText("Description / Details")).toHaveValue(
      "Exploring trails"
    );
  });

  it("updates the main section title and emits update:modelValue", async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const titleInput = screen.getByPlaceholderText("Custom Section Title");

    await user.clear(titleInput);
    await user.type(titleInput, "Volunteering");
    // Simulate blur to ensure trimming logic (if any) is triggered
    await user.tab();

    expect(emitted()).toHaveProperty("update:modelValue");
    // Check the last emitted event corresponding to the blur or final input
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.title).toBe("Volunteering");
    // Ensure items are preserved
    expect(lastEmittedValue.items[0].title).toBe("Hiking");
  });

  it("updates an item field and emits update:modelValue", async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const itemTitleInput = screen.getByLabelText("Entry Title (Optional)");

    await user.clear(itemTitleInput);
    await user.type(itemTitleInput, "Reading");

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items[0].title).toBe("Reading");
    expect(lastEmittedValue.items[0].description).toBe("Exploring trails"); // Desc preserved
    expect(lastEmittedValue.title).toBe("Hobbies"); // Main title preserved
  });

  it('adds a new item when "Add Entry" is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const addButton = screen.getByRole("button", { name: /add entry/i });

    await user.click(addButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(2);
    expect(lastEmittedValue.items[1]).toEqual({
      id: expect.any(String),
      title: "",
      description: "",
    });
    expect(screen.getAllByLabelText("Entry Title (Optional)")).toHaveLength(2);
  });

  it("removes an item when remove button is clicked (if more than one item)", async () => {
    const user = userEvent.setup();
    const propsWithTwoItems = {
      ...initialProps,
      modelValue: {
        ...initialProps.modelValue,
        items: [
          { id: "c1", title: "Item 1", description: "Desc 1" },
          { id: "c2", title: "Item 2", description: "Desc 2" },
        ],
      },
    };
    const { emitted } = renderComponent(propsWithTwoItems);
    const firstItemRemoveButton = screen
      .getByDisplayValue("Item 1")
      .closest(".relative")
      .querySelector('button[title="Remove Custom Entry"]');
    expect(firstItemRemoveButton).toBeInTheDocument();
    await user.click(firstItemRemoveButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(1);
    expect(lastEmittedValue.items[0].title).toBe("Item 2");
    expect(screen.queryByDisplayValue("Item 1")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Item 2")).toBeInTheDocument();
  });

  it("does NOT remove the last item", async () => {
    renderComponent(initialProps);
    const itemContainer = screen
      .getByDisplayValue("Hiking")
      .closest(".relative");
    const removeButton = itemContainer.querySelector(
      'button[title="Remove Custom Entry"]'
    );
    expect(removeButton).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Hiking")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Entry Title (Optional)")).toHaveLength(1);
  });
});
