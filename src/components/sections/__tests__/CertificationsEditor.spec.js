// src/components/sections/__tests__/CertificationsEditor.spec.js
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import CertificationsEditor from "../CertificationsEditor.vue";

const mockGenerateUUID = vi.fn(() => `mock-uuid-${Math.random()}`);

describe("CertificationsEditor.vue", () => {
  const initialProps = {
    modelValue: {
      id: "sec-cert",
      type: "certifications",
      title: "My Certifications",
      items: [
        {
          id: "cert-1",
          name: "Tester Pro",
          issuer: "Testing Org",
          date: "2023",
          credentialId: "TP-123",
        },
      ],
    },
    isFirst: false,
    isLast: false,
  };

  const renderComponent = (props = initialProps) => {
    return render(CertificationsEditor, {
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

  it("renders initial certification item fields", () => {
    renderComponent();
    expect(screen.getByText("My Certifications")).toBeInTheDocument();
    expect(screen.getByLabelText("Certification Name")).toHaveValue(
      "Tester Pro"
    );
    expect(screen.getByLabelText("Issuing Organization")).toHaveValue(
      "Testing Org"
    );
    expect(screen.getByLabelText("Date Earned (Optional)")).toHaveValue("2023");
    expect(screen.getByLabelText("Credential ID (Optional)")).toHaveValue(
      "TP-123"
    );
  });

  it("updates an item field and emits update:modelValue", async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const issuerInput = screen.getByLabelText("Issuing Organization");

    await user.clear(issuerInput);
    await user.type(issuerInput, "New Org");

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items[0].issuer).toBe("New Org");
    expect(lastEmittedValue.items[0].name).toBe("Tester Pro"); // Name preserved
  });

  it('adds a new item when "Add Certification" is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = renderComponent();
    const addButton = screen.getByRole("button", {
      name: /add certification/i,
    });

    await user.click(addButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(2);
    expect(lastEmittedValue.items[1]).toEqual({
      id: expect.any(String),
      name: "",
      issuer: "",
      date: "",
      credentialId: "",
    });
    expect(screen.getAllByLabelText("Certification Name")).toHaveLength(2);
  });

  it("removes an item when remove button is clicked (if more than one item)", async () => {
    const user = userEvent.setup();
    const propsWithTwoItems = {
      ...initialProps,
      modelValue: {
        ...initialProps.modelValue,
        items: [
          {
            id: "c1",
            name: "Cert 1",
            issuer: "I1",
            date: "d1",
            credentialId: "id1",
          },
          {
            id: "c2",
            name: "Cert 2",
            issuer: "I2",
            date: "d2",
            credentialId: "id2",
          },
        ],
      },
    };
    const { emitted } = renderComponent(propsWithTwoItems);
    const firstItemRemoveButton = screen
      .getByDisplayValue("Cert 1")
      .closest(".relative")
      .querySelector('button[title="Remove Certification Entry"]');
    expect(firstItemRemoveButton).toBeInTheDocument();
    await user.click(firstItemRemoveButton);

    expect(emitted()).toHaveProperty("update:modelValue");
    const lastEmittedValue = emitted()["update:modelValue"].pop()[0];
    expect(lastEmittedValue.items).toHaveLength(1);
    expect(lastEmittedValue.items[0].name).toBe("Cert 2");
    expect(screen.queryByDisplayValue("Cert 1")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Cert 2")).toBeInTheDocument();
  });

  it("does NOT remove the last item", async () => {
    renderComponent(initialProps);
    const itemContainer = screen
      .getByDisplayValue("Tester Pro")
      .closest(".relative");
    const removeButton = itemContainer.querySelector(
      'button[title="Remove Certification Entry"]'
    );
    expect(removeButton).not.toBeInTheDocument(); // Button shouldn't exist due to v-if
    expect(screen.getByDisplayValue("Tester Pro")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Certification Name")).toHaveLength(1);
  });
});
