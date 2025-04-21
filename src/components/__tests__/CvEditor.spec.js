// src/components/__tests__/CvEditor.spec.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import CvEditor from "../CvEditor.vue";
// Import the function *target* itself for mocking checks
import { generatePdfFromData } from "../../utils/pdfGenerator";

// --- Mock the utility function module ---
// This MUST come before any imports that might trigger its use (like CvEditor itself)
vi.mock("../../utils/pdfGenerator"); // Just mock the path

// --- Define Stubs ---
const AddSectionModalStub = {
  name: "AddSectionModal",
  props: ["show"],
  emits: ["close", "select-section"],
  template:
    '<div v-if="show" data-testid="add-section-modal">Modal Mock <button @click="$emit(\'close\')">Close</button><button @click="$emit(\'select-section\', \'workExperience\')">Select WorkExp</button></div>',
};
// ... Define other stubs (InputFieldStub, TextareaFieldStub, SectionEditorStub) exactly as before ...
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
      /* ... keep as is ... */
    },
    sections: [
      /* ... keep as is ... */
    ],
  };

  const mockGetPreviewElement = vi.fn();

  // Setup jsPDF save mock for testing the return value of the GENERATOR mock
  const mockPdfSave = vi.fn();
  const mockPdfDoc = { save: mockPdfSave }; // Mock PDF Document object

  const renderEditor = (props = defaultProps) => {
    // Setup inject mock *before* render
    mockGetPreviewElement.mockReturnValue(document.createElement("div"));
    return render(CvEditor, {
      props,
      global: {
        provide: { getPreviewElement: mockGetPreviewElement },
        stubs: {
          /* ... provide all stubs ... */ AddSectionModal: AddSectionModalStub,
          InputField: InputFieldStub,
          TextareaField: TextareaFieldStub,
          WorkExperienceEditor: SectionEditorStub,
          EducationEditor: SectionEditorStub,
          SkillsEditor: SectionEditorStub,
          ProjectsEditor: SectionEditorStub,
          LanguagesEditor: SectionEditorStub,
          CertificationsEditor: SectionEditorStub,
          CustomSectionEditor: SectionEditorStub,
          TransitionGroup: {
            template: "<div><slot/></div>",
            props: ["tag", "name"],
          },
        },
      },
    });
  };

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    // Reset the implementation of the *mocked imported function*
    vi.mocked(generatePdfFromData).mockReturnValue(mockPdfDoc);
  });

  // --- Basic tests (Keep assertions as they were) ---
  it("renders personal info fields with correct initial values", () => {
    renderEditor(); /* assertions */
  });
  it('emits "update:personalInfo" when a field changes', async () => {
    renderEditor(); /* interactions & assertions */
  });
  it("renders the correct section editor mocks based on props", () => {
    renderEditor(); /* assertions */
  });
  it('opens AddSectionModal when "Add Section" button is clicked', async () => {
    renderEditor(); /* interactions & assertions */
  });
  it('emits "add-section" when modal mock emits "select-section"', async () => {
    renderEditor(); /* interactions & assertions */
  });
  it('emits "delete-section" when a section editor mock emits delete', async () => {
    renderEditor(); /* interactions & assertions */
  });
  it('emits "move-section" when a section editor mock emits move', async () => {
    renderEditor(); /* interactions & assertions */
  });

  // --- PDF Download Tests ---
  it("calls generatePdfFromData and saves the result on download click", async () => {
    const user = userEvent.setup();
    renderEditor();
    const downloadButton = screen.getByRole("button", {
      name: /download pdf/i,
    });
    await user.click(downloadButton);

    // Check the *mocked import* was called
    expect(vi.mocked(generatePdfFromData)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(generatePdfFromData)).toHaveBeenCalledWith(
      expect.objectContaining({
        personalInfo: defaultProps.personalInfo,
        sections: defaultProps.sections,
      })
    );
    // Check save was called on the object *returned* by the mock
    expect(mockPdfSave).toHaveBeenCalledTimes(1);
    expect(mockPdfSave).toHaveBeenCalledWith(
      expect.stringMatching(/Proto User_.*\.pdf/)
    );
    await screen.findByRole("button", {
      name: /download pdf/i,
      disabled: false,
    });
  });

  it("handles error during PDF generation/saving", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const generationError = new Error("PDF Generation Failed");
    // Make the *mocked import* throw
    vi.mocked(generatePdfFromData).mockImplementationOnce(() => {
      throw generationError;
    });

    renderEditor();
    const downloadButton = screen.getByRole("button", {
      name: /download pdf/i,
    });
    await user.click(downloadButton);
    await screen.findByRole("button", {
      name: /download pdf/i,
      disabled: false,
    });

    expect(vi.mocked(generatePdfFromData)).toHaveBeenCalled();
    expect(mockPdfSave).not.toHaveBeenCalled(); // Save should not be called
    expect(errorSpy).toHaveBeenCalledWith(
      "Error during PDF generation or saving:",
      generationError
    );
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining("error occurred")
    );
    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("disables download button and shows spinner during PDF generation", async () => {
    const user = userEvent.setup();
    let resolveGeneration;
    // Make the *mocked import* slow
    vi.mocked(generatePdfFromData).mockImplementationOnce(
      () =>
        new Promise((res) => {
          resolveGeneration = () => res(mockPdfDoc);
        })
    );

    renderEditor();
    const downloadButton = screen.getByRole("button", {
      name: /download pdf/i,
    });
    expect(downloadButton).not.toBeDisabled();
    user.click(downloadButton);

    await vi.waitFor(() => {
      expect(downloadButton).toBeDisabled();
    });
    expect(screen.getByText("Generating...")).toBeInTheDocument();
    expect(
      downloadButton.querySelector(".fa-spinner.fa-spin")
    ).toBeInTheDocument();

    expect(resolveGeneration).toBeDefined();
    resolveGeneration(); // Allow async op to complete

    await screen.findByRole("button", {
      name: /download pdf/i,
      disabled: false,
    });
    expect(downloadButton).not.toBeDisabled();
    expect(screen.queryByText("Generating...")).not.toBeInTheDocument();
    expect(downloadButton.querySelector(".fa-spinner")).toBeNull();
    expect(mockPdfSave).toHaveBeenCalled();
  });
});
