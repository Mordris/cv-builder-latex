// src/components/sections/__tests__/ProjectsEditor.spec.js
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import ProjectsEditor from "../ProjectsEditor.vue";

const mockGenerateUUID = vi.fn(() => `mock-uuid-${Math.random()}`);

describe("ProjectsEditor.vue", () => {
  const initialProps = {
    modelValue: {
      id: "sec-proj",
      type: "projects",
      title: "My Projects",
      items: [
        {
          id: "proj-1",
          name: "CV Builder",
          link: "github.com",
          date: "2024",
          description: "Built this thing",
        },
      ],
    },
    isFirst: false,
    isLast: false,
  };

  const renderComponent = (props = initialProps) => {
    return render(ProjectsEditor, {
      props,
      global: {
        provide: { generateUUID: mockGenerateUUID },
        stubs: {
          BaseSectionWrapper: {
            template: '<div><slot name="header"/><slot name="content"/></div>',
          },
        },
      },
    });
  };

  it("renders initial project item fields", () => {
    renderComponent();
    expect(screen.getByText("My Projects")).toBeInTheDocument();
    expect(screen.getByLabelText("Project Name")).toHaveValue("CV Builder");
    expect(screen.getByLabelText("Link (Optional)")).toHaveValue("github.com");
    expect(screen.getByLabelText("Date (Optional)")).toHaveValue("2024");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Built this thing"
    );
  });

  it("updates an item field and emits update:modelValue", async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const nameInput = screen.getByLabelText("Project Name");

    await user.clear(nameInput);
    await user.type(nameInput, "Project X");

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items[0].name).toBe("Project X");
    expect(lastEmittedValue.items[0].link).toBe("github.com"); // Other fields preserved
  });

  it('adds a new item when "Add Project" is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const addButton = screen.getByRole("button", { name: /add project/i });

    await user.click(addButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(2);
    expect(lastEmittedValue.items[1]).toEqual({
      id: expect.any(String),
      name: "",
      link: "",
      date: "",
      description: "",
    });
    expect(screen.getAllByLabelText("Project Name")).toHaveLength(2);
  });

  it("removes an item when remove button is clicked (if more than one item)", async () => {
    const user = userEvent.setup();
    const propsWithTwoItems = {
      ...initialProps,
      modelValue: {
        ...initialProps.modelValue,
        items: [
          {
            id: "p1",
            name: "Proj 1",
            link: "l1",
            date: "d1",
            description: "desc 1",
          },
          {
            id: "p2",
            name: "Proj 2",
            link: "l2",
            date: "d2",
            description: "desc 2",
          },
        ],
      },
    };
    const { emitted } = renderComponent(propsWithTwoItems);
    const firstItemRemoveButton = screen
      .getByDisplayValue("Proj 1")
      .closest(".relative")
      .querySelector('button[title="Remove Project Entry"]');
    expect(firstItemRemoveButton).toBeInTheDocument();
    await user.click(firstItemRemoveButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(1);
    expect(lastEmittedValue.items[0].name).toBe("Proj 2");
    expect(screen.queryByDisplayValue("Proj 1")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Proj 2")).toBeInTheDocument();
  });

  it("does NOT remove the last item", async () => {
    renderComponent(initialProps);
    const itemContainer = screen
      .getByDisplayValue("CV Builder")
      .closest(".relative");
    const removeButton = itemContainer.querySelector(
      'button[title="Remove Project Entry"]'
    );
    expect(removeButton).not.toBeInTheDocument(); // Button shouldn't exist due to v-if
    expect(screen.getByDisplayValue("CV Builder")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Project Name")).toHaveLength(1);
  });
});
