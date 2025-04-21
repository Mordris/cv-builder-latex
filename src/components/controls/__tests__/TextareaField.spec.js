// src/components/controls/__tests__/TextareaField.spec.js
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import TextareaField from "../TextareaField.vue";

describe("TextareaField.vue", () => {
  it("renders label and textarea", () => {
    render(TextareaField, {
      props: {
        label: "Description",
        modelValue: "",
      },
    });
    // Textareas don't always have implicit labels like inputs, query by role or text
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders placeholder", () => {
    render(TextareaField, {
      props: {
        label: "Description",
        modelValue: "",
        placeholder: "Enter description...",
      },
    });
    expect(
      screen.getByPlaceholderText("Enter description...")
    ).toBeInTheDocument();
  });

  it("emits update:modelValue on input", async () => {
    const user = userEvent.setup();
    const { emitted } = render(TextareaField, {
      props: {
        label: "Description",
        modelValue: "Initial",
      },
    });

    const textarea = screen.getByRole("textbox");
    await user.clear(textarea); // Clear initial value
    await user.type(textarea, "New text");

    expect(emitted()).toHaveProperty("update:modelValue");
    expect(emitted()["update:modelValue"].length).toBe(9); // Emits on each keystroke + clear
    expect(emitted()["update:modelValue"][8]).toEqual(["New text"]);
  });

  it("applies disabled attribute", () => {
    render(TextareaField, {
      props: {
        label: "Description",
        modelValue: "",
        disabled: true,
      },
    });
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("respects rows attribute", () => {
    render(TextareaField, {
      props: {
        label: "Description",
        modelValue: "",
        rows: 5,
      },
    });
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
  });

  it("hides label when showLabel is false", () => {
    render(TextareaField, {
      props: {
        label: "Test Label",
        modelValue: "",
        showLabel: false,
      },
    });
    expect(screen.queryByText("Test Label")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
