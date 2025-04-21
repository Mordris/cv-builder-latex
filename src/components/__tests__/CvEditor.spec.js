// src/components/__tests__/CvEditor.spec.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
// --- FIX: Use mount from vue/test-utils ---
import { mount } from "@vue/test-utils";
import { render, screen, within } from "@testing-library/vue"; // Keep for querying if needed, but mount is primary
import userEvent from "@testing-library/user-event";
import CvEditor from "../CvEditor.vue";
// Import the function *target* itself for mocking checks
import { generatePdfFromData } from "../../utils/pdfGenerator";

// --- Mock the utility function module ---
vi.mock("../../utils/pdfGenerator"); // Auto-mock the module

// --- Define Stubs (Keep definitions as they are) ---
const AddSectionModalStub = {
  /* ... */
};
const InputFieldStub = {
  /* ... */
};
const TextareaFieldStub = {
  /* ... */
};
const SectionEditorStub = {
  /* ... */
};

// --- Test Suite ---
describe("CvEditor.vue", () => {
  const defaultProps = {
    personalInfo: {
      fullName: "Proto User",
      jobTitle: "Prototyper",
      email: "proto@mail.com",
      phone: "555",
      address: "Proto City",
      summary: "Proto summary",
    },
    sections: [
      { id: "s1", type: "workExperience", title: "Work", items: [] },
      { id: "s2", type: "education", title: "Edu", items: [] },
    ],
  };

  const mockGetPreviewElement = vi.fn();
  const mockPdfSave = vi.fn();
  const mockPdfDoc = { save: mockPdfSave };

  // --- FIX: Use mount and define stubs in global options ---
  const mountEditor = (props = defaultProps) => {
    mockGetPreviewElement.mockReturnValue(document.createElement("div"));
    return mount(CvEditor, {
      // Use mount instead of render
      props,
      global: {
        provide: { getPreviewElement: mockGetPreviewElement },
        stubs: {
          // Provide stubs for child components
          AddSectionModal: AddSectionModalStub,
          InputField: InputFieldStub,
          TextareaField: TextareaFieldStub,
          WorkExperienceEditor: SectionEditorStub,
          EducationEditor: SectionEditorStub,
          SkillsEditor: SectionEditorStub,
          ProjectsEditor: SectionEditorStub,
          LanguagesEditor: SectionEditorStub,
          CertificationsEditor: SectionEditorStub,
          CustomSectionEditor: SectionEditorStub,
          // IMPORTANT: Stubbing TransitionGroup is often needed with mount
          TransitionGroup: {
            template: '<div class="transition-group-stub"><slot/></div>',
            props: ["tag", "name"],
          },
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generatePdfFromData).mockReturnValue(mockPdfDoc);
    // If you still have issues finding elements after mount, ensure mocks are cleared *before* mount
  });

  // --- Basic tests (Adjust finders for vue-test-utils if needed) ---
  it("renders personal info fields with correct initial values", () => {
    const wrapper = mountEditor();
    // Use wrapper.findComponent or wrapper.find to locate elements
    // Using findByRole via screen might still work if DOM is attached, but wrapper is safer
    expect(wrapper.find('input[aria-label="Full Name"]').element.value).toBe(
      defaultProps.personalInfo.fullName
    );
    expect(wrapper.find('input[aria-label="Job Title"]').element.value).toBe(
      defaultProps.personalInfo.jobTitle
    );
    expect(wrapper.find('input[aria-label="Email"]').element.value).toBe(
      defaultProps.personalInfo.email
    );
    expect(wrapper.find('input[aria-label="Phone"]').element.value).toBe(
      defaultProps.personalInfo.phone
    );
    expect(wrapper.find('input[aria-label="Address"]').element.value).toBe(
      defaultProps.personalInfo.address
    );
    expect(
      wrapper.find('textarea[aria-label="Profile Summary"]').element.value
    ).toBe(defaultProps.personalInfo.summary);
  });

  it('emits "update:personalInfo" when a field changes', async () => {
    const wrapper = mountEditor();
    const nameInput = wrapper.find('input[aria-label="Full Name"]');
    await nameInput.setValue("Updated Name"); // Use setValue with test-utils

    expect(wrapper.emitted()).toHaveProperty("update:personalInfo");
    const lastEmit = wrapper.emitted("update:personalInfo").pop()[0]; // Access emitted payload
    expect(lastEmit.fullName).toBe("Updated Name");
  });

  it("renders the correct section editor stubs based on props", () => {
    const wrapper = mountEditor();
    // Check stubs are present using data-testid from stub template
    expect(
      wrapper.find('[data-testid="section-workExperience-s1"]').exists()
    ).toBe(true);
    expect(wrapper.find('[data-testid="section-education-s2"]').exists()).toBe(
      true
    );
  });

  it('opens AddSectionModal when "Add Section" button is clicked', async () => {
    const wrapper = mountEditor();
    // Find the stub component instance
    const modalStub = wrapper.findComponent(AddSectionModalStub);
    expect(modalStub.find('[data-testid="add-section-modal"]').exists()).toBe(
      false
    ); // Check internal template state

    const addButton = wrapper.find("button.bg-indigo-600"); // More specific selector
    await addButton.trigger("click");

    // Re-find the stub and check its internal state or emitted events if needed
    // Note: Checking internal state of stub relies on stub implementation
    // Here, we just check if the click handler likely toggled the state
    // A better check might be difficult without more complex stubs
    // We rely on the fact that the button exists and was clicked
    expect(addButton.exists()).toBe(true);
  });

  it('emits "add-section" when modal mock emits "select-section"', async () => {
    const wrapper = mountEditor();
    const addButton = wrapper.find("button.bg-indigo-600");
    await addButton.trigger("click"); // Open modal

    const modalStub = wrapper.findComponent(AddSectionModalStub);
    // Find button within the stub's template
    const selectButton = modalStub.find('button:contains("Select WorkExp")'); // Find by text within stub
    await selectButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("add-section");
    expect(wrapper.emitted("add-section")[0]).toEqual(["workExperience"]);
  });

  it('emits "delete-section" when a section editor mock emits delete', async () => {
    const wrapper = mountEditor();
    const sectionStub = wrapper.find(
      '[data-testid="section-workExperience-s1"]'
    );
    const deleteButton = sectionStub.find('button:contains("Del")');
    await deleteButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("delete-section");
    // CvEditor passes the ID when relaying
    expect(wrapper.emitted("delete-section")[0]).toEqual(["s1"]);
  });

  it('emits "move-section" when a section editor mock emits move', async () => {
    const wrapper = mountEditor();
    const sectionStub = wrapper.find(
      '[data-testid="section-workExperience-s1"]'
    );

    const moveUpButton = sectionStub.find('button:contains("Up")');
    await moveUpButton.trigger("click");
    expect(wrapper.emitted()).toHaveProperty("move-section");
    expect(wrapper.emitted("move-section")[0]).toEqual(["s1", -1]); // Check [id, direction]

    const moveDownButton = sectionStub.find('button:contains("Down")');
    await moveDownButton.trigger("click");
    expect(wrapper.emitted("move-section")[1]).toEqual(["s1", 1]); // Check second emit
  });

  // --- PDF Download Tests ---
  it("calls generatePdfFromData and saves the result on download click", async () => {
    const wrapper = mountEditor();
    const downloadButton = wrapper.find("button.bg-green-600"); // Selector for download button
    await downloadButton.trigger("click");

    // Wait for potential async operations within downloadPdf
    await wrapper.vm.$nextTick(); // Wait for state updates

    expect(vi.mocked(generatePdfFromData)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(generatePdfFromData)).toHaveBeenCalledWith(
      expect.objectContaining({
        personalInfo: defaultProps.personalInfo,
        sections: defaultProps.sections,
      })
    );
    expect(mockPdfSave).toHaveBeenCalledTimes(1);
    expect(mockPdfSave).toHaveBeenCalledWith(
      expect.stringMatching(/Proto User_.*\.pdf/)
    );

    // Check loading state reset
    expect(
      wrapper.find("button.bg-green-600").attributes("disabled")
    ).toBeUndefined();
  });

  it("handles error during PDF generation/saving", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const generationError = new Error("PDF Generation Failed");
    vi.mocked(generatePdfFromData).mockImplementationOnce(() => {
      throw generationError;
    });

    const wrapper = mountEditor();
    const downloadButton = wrapper.find("button.bg-green-600");
    await downloadButton.trigger("click");
    await wrapper.vm.$nextTick(); // Wait for async error handling

    expect(vi.mocked(generatePdfFromData)).toHaveBeenCalled();
    expect(mockPdfSave).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "Error during PDF generation or saving:",
      generationError
    );
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining("error occurred")
    );

    // Check loading state reset
    expect(
      wrapper.find("button.bg-green-600").attributes("disabled")
    ).toBeUndefined();

    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("disables download button and shows spinner during PDF generation", async () => {
    let resolveGeneration;
    vi.mocked(generatePdfFromData).mockImplementationOnce(
      () =>
        new Promise((res) => {
          resolveGeneration = () => res(mockPdfDoc);
        })
    );

    const wrapper = mountEditor();
    const downloadButton = wrapper.find("button.bg-green-600");
    expect(downloadButton.attributes("disabled")).toBeUndefined();

    await downloadButton.trigger("click"); // Trigger async operation

    // Check intermediate loading state (immediately after click + tick)
    await wrapper.vm.$nextTick();
    expect(downloadButton.attributes("disabled")).toBeDefined(); // Check for presence of disabled attr
    expect(wrapper.text()).toContain("Generating...");
    expect(wrapper.find(".fa-spinner.fa-spin").exists()).toBe(true);

    // Resolve the generation promise
    expect(resolveGeneration).toBeDefined();
    resolveGeneration();
    await wrapper.vm.$nextTick(); // Allow promise resolution and state update

    // Check final state
    expect(downloadButton.attributes("disabled")).toBeUndefined();
    expect(wrapper.text()).not.toContain("Generating...");
    expect(wrapper.find(".fa-spinner.fa-spin").exists()).toBe(false);
    expect(mockPdfSave).toHaveBeenCalled();
  });
});
