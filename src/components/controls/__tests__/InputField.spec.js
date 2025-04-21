// src/components/controls/__tests__/InputField.spec.js
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import InputField from "../InputField.vue";

// Mock the UUID generator if needed, although InputField provides fallback
// vi.mock('@/composables/useUUID', () => ({
//   useUUID: () => ({
//     generateUUID: () => 'test-uuid'
//   })
// }));

describe("InputField.vue", () => {
  it("renders label and input", () => {
    render(InputField, {
      props: {
        label: "Test Label",
        modelValue: "",
      },
    });

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("renders placeholder", () => {
    render(InputField, {
      props: {
        label: "Test Label",
        modelValue: "",
        placeholder: "Enter text here",
      },
    });

    expect(screen.getByPlaceholderText("Enter text here")).toBeInTheDocument();
  });

  it("emits update:modelValue on input", async () => {
    const user = userEvent.setup();
    const { emitted } = render(InputField, {
      props: {
        label: "Test Label",
        modelValue: "",
      },
    });

    const input = screen.getByLabelText("Test Label");
    await user.type(input, "Hello");

    // Check if event was emitted
    expect(emitted()).toHaveProperty("update:modelValue");
    // Check the payload of the last emitted event
    expect(emitted()["update:modelValue"].length).toBe(5); // Emits on each keystroke
    expect(emitted()["update:modelValue"][4]).toEqual(["Hello"]); // Payload is always an array
  });

  it("applies disabled attribute", () => {
    render(InputField, {
      props: {
        label: "Test Label",
        modelValue: "",
        disabled: true,
      },
    });

    expect(screen.getByLabelText("Test Label")).toBeDisabled();
  });

  it("hides label when showLabel is false", () => {
    render(InputField, {
      props: {
        label: "Test Label",
        modelValue: "",
        showLabel: false,
      },
    });

    expect(screen.queryByText("Test Label")).not.toBeInTheDocument(); // Label text shouldn't be found
    expect(screen.getByRole("textbox")).toBeInTheDocument(); // Input should still be there
  });
});
