// src/components/sections/__tests__/SkillsEditor.spec.js
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import SkillsEditor from "../SkillsEditor.vue";

// Mock BaseSectionWrapper or test it separately
// For simplicity here, we assume BaseSectionWrapper works or stub it.
// A shallow mount might be useful if BaseSectionWrapper is complex.
// Let's mock the generateUUID injection
const mockGenerateUUID = vi.fn(() => `mock-uuid-${Math.random()}`);

describe("SkillsEditor.vue", () => {
  const initialProps = {
    modelValue: {
      id: "sec-skills",
      type: "skills",
      title: "My Skills",
      items: [{ id: "skill-1", name: "Vue.js" }],
    },
    isFirst: false,
    isLast: false,
  };

  const renderComponent = (props = initialProps) => {
    return render(SkillsEditor, {
      props,
      global: {
        // Provide the mocked function for injection
        provide: {
          generateUUID: mockGenerateUUID,
        },
        // Stub child components if needed (e.g., BaseSectionWrapper if it interferes)
        stubs: {
          BaseSectionWrapper: {
            // Simple stub
            template: '<div><slot name="header"/><slot name="content"/></div>',
          },
        },
      },
    });
  };

  it("renders initial skills", () => {
    renderComponent();
    expect(screen.getByDisplayValue("Vue.js")).toBeInTheDocument();
    expect(screen.getByText("My Skills")).toBeInTheDocument(); // Title from stubbed header slot
  });

  it('adds a new skill when "Add Skill" button is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();

    const addButton = screen.getByRole("button", { name: /add skill/i });
    await user.click(addButton);

    // Check emitted event
    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0]; // Get last payload [[payload]]

    // Expect two items now, the original and a new empty one
    expect(lastEmittedValue.items).toHaveLength(2);
    expect(lastEmittedValue.items[0].name).toBe("Vue.js");
    expect(lastEmittedValue.items[1].name).toBe("");
    expect(lastEmittedValue.items[1].id).toBeDefined(); // Ensure new item has an ID

    // Check if a new input field appeared (might need a more specific selector)
    expect(screen.getAllByPlaceholderText("e.g., JavaScript")).toHaveLength(2);
  });

  it("removes a skill when its remove button is clicked", async () => {
    const user = userEvent.setup();
    const propsWithTwoSkills = {
      ...initialProps,
      modelValue: {
        ...initialProps.modelValue,
        items: [
          { id: "skill-1", name: "Vue.js" },
          { id: "skill-2", name: "Testing" },
        ],
      },
    };
    const { emitted } = renderComponent(propsWithTwoSkills);

    // Find the remove button associated with 'Vue.js'
    const vueInput = screen.getByDisplayValue("Vue.js");
    const removeButton = vueInput
      .closest(".relative")
      .querySelector("button.remove-skill"); // Find button within parent
    expect(removeButton).toBeInTheDocument();

    await user.click(removeButton);

    // Check emitted event
    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];

    // Expect only one item left
    expect(lastEmittedValue.items).toHaveLength(1);
    expect(lastEmittedValue.items[0].name).toBe("Testing");

    // Check DOM
    expect(screen.queryByDisplayValue("Vue.js")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Testing")).toBeInTheDocument();
  });

  it("updates model value when typing in a skill input", async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();

    const input = screen.getByDisplayValue("Vue.js");
    await user.clear(input); // Clear existing value
    await user.type(input, "React");

    expect(emitted()["update:modelValue"].pop()[0].items[0].name).toBe("React");
  });

  it("removes item if empty on blur (and not the last item)", async () => {
    const user = userEvent.setup();
    const propsWithTwoSkills = {
      ...initialProps,
      modelValue: {
        ...initialProps.modelValue,
        items: [
          { id: "skill-1", name: "Vue.js" },
          { id: "skill-2", name: "" }, // Start with an empty one
        ],
      },
    };
    const { emitted } = renderComponent(propsWithTwoSkills);

    const emptyInput = screen.getByDisplayValue(""); // Find the empty input
    await user.click(emptyInput); // Focus it
    await user.tab(); // Tab away to trigger blur

    // Check emitted event
    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];

    expect(lastEmittedValue.items).toHaveLength(1);
    expect(lastEmittedValue.items[0].name).toBe("Vue.js");
  });

  it("does NOT remove the item if empty on blur but IS the last item", async () => {
    const user = userEvent.setup();
    const propsWithOneEmptySkill = {
      ...initialProps,
      modelValue: {
        ...initialProps.modelValue,
        items: [{ id: "skill-1", name: "" }], // Only one, and it's empty
      },
    };
    const { emitted } = renderComponent(propsWithOneEmptySkill);

    const emptyInput = screen.getByDisplayValue("");
    await user.click(emptyInput);
    await user.tab(); // Blur

    // update:modelValue might still be emitted by the input's blur handler,
    // but the number of items should remain 1
    const lastEmittedValue = emitted()["update:modelValue"]?.pop()?.[0];
    expect(
      lastEmittedValue?.items ?? propsWithOneEmptySkill.modelValue.items
    ).toHaveLength(1); // Check it's still 1
  });
});
