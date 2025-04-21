// src/components/sections/__tests__/EducationEditor.spec.js
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import EducationEditor from "../EducationEditor.vue";

const mockGenerateUUID = vi.fn(() => `mock-uuid-${Math.random()}`);

describe("EducationEditor.vue", () => {
  const initialProps = {
    modelValue: {
      id: "sec-edu",
      type: "education",
      title: "Education History",
      items: [
        {
          id: "edu-1",
          degree: "BSc Testology",
          institution: "Test University",
          date: "2018",
          description: "Minor in Stubs",
        },
      ],
    },
    isFirst: false,
    isLast: false,
  };

  const renderComponent = (props = initialProps) => {
    return render(EducationEditor, {
      props,
      global: {
        provide: { generateUUID: mockGenerateUUID },
        stubs: {
          BaseSectionWrapper: {
            // Simple stub
            template: '<div><slot name="header"/><slot name="content"/></div>',
          },
        },
      },
    });
  };

  it("renders initial education item fields", () => {
    renderComponent();
    expect(screen.getByText("Education History")).toBeInTheDocument();
    expect(screen.getByLabelText("Degree / Qualification")).toHaveValue(
      "BSc Testology"
    );
    expect(screen.getByLabelText("Institution")).toHaveValue("Test University");
    expect(screen.getByLabelText("Date Range")).toHaveValue("2018");
    expect(screen.getByLabelText(/details \/ description/i)).toHaveValue(
      "Minor in Stubs"
    );
  });

  it("updates an item field and emits update:modelValue", async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const degreeInput = screen.getByLabelText("Degree / Qualification");

    await user.clear(degreeInput);
    await user.type(degreeInput, "MSc Mocking");

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items[0].degree).toBe("MSc Mocking");
    expect(lastEmittedValue.items[0].institution).toBe("Test University"); // Other fields preserved
  });

  it('adds a new item when "Add Education" is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const addButton = screen.getByRole("button", { name: /add education/i });

    await user.click(addButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(2);
    expect(lastEmittedValue.items[1]).toEqual({
      id: expect.any(String),
      degree: "",
      institution: "",
      date: "",
      description: "",
    });

    // Check DOM
    expect(screen.getAllByLabelText("Degree / Qualification")).toHaveLength(2);
  });

  it("removes an item when remove button is clicked (if more than one item)", async () => {
    const user = userEvent.setup();
    const propsWithTwoItems = {
      ...initialProps,
      modelValue: {
        ...initialProps.modelValue,
        items: [
          {
            id: "edu-1",
            degree: "Degree 1",
            institution: "Inst 1",
            date: "D1",
            description: "Desc 1",
          },
          {
            id: "edu-2",
            degree: "Degree 2",
            institution: "Inst 2",
            date: "D2",
            description: "Desc 2",
          },
        ],
      },
    };
    const { emitted } = renderComponent(propsWithTwoItems);

    const firstItemRemoveButton = screen
      .getByDisplayValue("Degree 1")
      .closest(".relative")
      .querySelector('button[title="Remove Education Entry"]');
    expect(firstItemRemoveButton).toBeInTheDocument();

    await user.click(firstItemRemoveButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(1);
    expect(lastEmittedValue.items[0].degree).toBe("Degree 2"); // Second item should remain

    // Check DOM
    expect(screen.queryByDisplayValue("Degree 1")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Degree 2")).toBeInTheDocument();
  });

  it("does NOT remove the last item", async () => {
    renderComponent(initialProps);
    const itemContainer = screen
      .getByDisplayValue("BSc Testology")
      .closest(".relative");
    const removeButton = itemContainer.querySelector(
      'button[title="Remove Education Entry"]'
    );
    // Because of v-if, the button shouldn't be in the DOM
    expect(removeButton).not.toBeInTheDocument();
    // Verify item still exists
    expect(screen.getByDisplayValue("BSc Testology")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Degree / Qualification")).toHaveLength(1);
  });
});
