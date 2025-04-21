// src/components/__tests__/CvEditor.spec.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils"; // Import flushPromises
import CvEditor from "../CvEditor.vue";
import { generatePdfFromData } from "../../utils/pdfGenerator";

// --- Mock the utility function module ---
vi.mock("../../utils/pdfGenerator");

// --- Define Stubs ---
const AddSectionModalStub = {
  name: "AddSectionModal",
  props: ["show"],
  emits: ["close", "select-section"],
  template: `
    <div v-if="show" data-testid="add-section-modal">
      Mock Modal
      <button data-testid="select-workexp-btn" @click="$emit('select-section', 'workExperience')">Select WorkExp</button>
      <button @click="$emit('close')">Close</button>
    </div>
  `,
};

const InputFieldStub = {
  name: "InputField",
  props: ["modelValue", "label", "type", "placeholder", "disabled"],
  emits: ["update:modelValue"],
  template: `
    <div>
      <label :for="label">{{ label }}</label>
      <input :id="label" :aria-label="label" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :placeholder="placeholder" :disabled="disabled" />
    </div>
  `,
};

const TextareaFieldStub = {
  name: "TextareaField",
  props: ["modelValue", "label", "placeholder", "disabled", "rows"],
  emits: ["update:modelValue"],
  template: `
      <div>
        <label :for="label">{{ label }}</label>
        <textarea :id="label" :aria-label="label" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :placeholder="placeholder" :disabled="disabled" :rows="rows"></textarea>
      </div>
    `,
};

const SectionEditorStub = {
  name: "SectionEditorStub",
  props: ["modelValue", "isFirst", "isLast"],
  emits: ["update:modelValue", "delete-section", "move-section"],
  template: `
    <div :data-testid="'section-' + modelValue.id">
      Mock Section: {{ modelValue.title }}
      <button data-testid="delete-btn" @click="$emit('delete-section', modelValue.id)">Del</button>
      <button data-testid="move-up-btn" :disabled="isFirst" @click="$emit('move-section', -1)">Up</button>
      <button data-testid="move-down-btn" :disabled="isLast" @click="$emit('move-section', 1)">Down</button>
      <input v-if="modelValue.items && modelValue.items[0]" :value="modelValue.items[0]?.jobTitle || modelValue.items[0]?.degree || modelValue.items[0]?.name || ''" @input="$emit('update:modelValue', {...modelValue, items: [{...modelValue.items[0], jobTitle: $event.target.value}]})"/>
    </div>
  `,
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
      {
        id: "s1",
        type: "workExperience",
        title: "Work",
        items: [{ id: "i1", jobTitle: "Job1" }],
      },
      {
        id: "s2",
        type: "education",
        title: "Edu",
        items: [{ id: "i2", degree: "Degree1" }],
      },
    ],
  };

  const mockPdfSave = vi.fn();
  const mockPdfDoc = { save: mockPdfSave };

  const mountEditor = (props = defaultProps) => {
    return mount(CvEditor, {
      props,
      global: {
        stubs: {
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
          TransitionGroup: {
            template: '<div class="transition-group-stub"><slot/></div>',
            props: ["tag", "name"],
          },
        },
      },
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(generatePdfFromData).mockReturnValue(mockPdfDoc);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders personal info fields with correct initial values", () => {
    const wrapper = mountEditor();
    const inputFields = wrapper.findAllComponents(InputFieldStub);
    const textareaFields = wrapper.findAllComponents(TextareaFieldStub);

    expect(
      inputFields
        .find((c) => c.props("label") === "Full Name")
        ?.props("modelValue")
    ).toBe(defaultProps.personalInfo.fullName);
    expect(
      inputFields
        .find((c) => c.props("label") === "Job Title")
        ?.props("modelValue")
    ).toBe(defaultProps.personalInfo.jobTitle);
    expect(
      inputFields.find((c) => c.props("label") === "Email")?.props("modelValue")
    ).toBe(defaultProps.personalInfo.email);
    expect(
      inputFields.find((c) => c.props("label") === "Phone")?.props("modelValue")
    ).toBe(defaultProps.personalInfo.phone);
    expect(
      inputFields
        .find((c) => c.props("label") === "Address")
        ?.props("modelValue")
    ).toBe(defaultProps.personalInfo.address);
    expect(
      textareaFields
        .find((c) => c.props("label") === "Profile Summary")
        ?.props("modelValue")
    ).toBe(defaultProps.personalInfo.summary);
  });

  it('emits "update:personalInfo" when a field changes', async () => {
    const wrapper = mountEditor();
    const nameInputStub = wrapper
      .findAllComponents(InputFieldStub)
      .find((c) => c.props("label") === "Full Name");
    await nameInputStub.vm.$emit("update:modelValue", "Updated Name");

    expect(wrapper.emitted()).toHaveProperty("update:personalInfo");
    const lastEmit = wrapper.emitted("update:personalInfo").pop()[0];
    expect(lastEmit.fullName).toBe("Updated Name");
  });

  // FIX 1: Add await flushPromises()
  it("renders the correct section editor stubs based on props", async () => {
    const wrapper = mountEditor();
    await flushPromises(); // Wait for potential async component rendering
    expect(wrapper.find('[data-testid="section-s1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="section-s2"]').exists()).toBe(true);
  });

  it('opens AddSectionModal when "Add Section" button is clicked', async () => {
    const wrapper = mountEditor();
    const modalStub = wrapper.findComponent(AddSectionModalStub);
    expect(modalStub.find('[data-testid="add-section-modal"]').exists()).toBe(
      false
    );

    const addButton = wrapper.find("button.bg-indigo-600");
    await addButton.trigger("click");

    expect(modalStub.find('[data-testid="add-section-modal"]').exists()).toBe(
      true
    );
  });

  it('emits "add-section" when modal mock emits "select-section"', async () => {
    const wrapper = mountEditor();
    const addButton = wrapper.find("button.bg-indigo-600");
    await addButton.trigger("click");

    const modalStub = wrapper.findComponent(AddSectionModalStub);
    const selectButton = modalStub.find('[data-testid="select-workexp-btn"]');
    await selectButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("add-section");
    expect(wrapper.emitted("add-section")[0]).toEqual(["workExperience"]);
  });

  // FIX 1: Add await flushPromises()
  it('emits "delete-section" when a section editor mock emits delete', async () => {
    const wrapper = mountEditor();
    await flushPromises(); // Wait for sections to render

    const sectionStubWrapper = wrapper.find('[data-testid="section-s1"]');
    // Add assertion to ensure the wrapper is found before interacting
    expect(
      sectionStubWrapper.exists(),
      "Section s1 stub wrapper should exist"
    ).toBe(true);

    const deleteButton = sectionStubWrapper.find('[data-testid="delete-btn"]');
    // Add assertion to ensure the button is found
    expect(
      deleteButton.exists(),
      "Delete button within stub should exist"
    ).toBe(true);
    await deleteButton.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("delete-section");
    expect(wrapper.emitted("delete-section")[0]).toEqual(["s1"]);
  });

  // FIX 1: Add await flushPromises()
  it('emits "move-section" when a section editor mock emits move', async () => {
    const wrapper = mountEditor();
    await flushPromises(); // Wait for sections to render

    const sectionStubWrapper = wrapper.find('[data-testid="section-s1"]');
    expect(
      sectionStubWrapper.exists(),
      "Section s1 stub wrapper should exist"
    ).toBe(true);

    const moveUpButton = sectionStubWrapper.find('[data-testid="move-up-btn"]');
    expect(
      moveUpButton.exists(),
      "Move Up button within stub should exist"
    ).toBe(true);
    await moveUpButton.trigger("click");
    expect(wrapper.emitted()).toHaveProperty("move-section");
    expect(wrapper.emitted("move-section")[0]).toEqual(["s1", -1]);

    const moveDownButton = sectionStubWrapper.find(
      '[data-testid="move-down-btn"]'
    );
    expect(
      moveDownButton.exists(),
      "Move Down button within stub should exist"
    ).toBe(true);
    await moveDownButton.trigger("click");
    expect(wrapper.emitted("move-section")[1]).toEqual(["s1", 1]);
  });

  // --- PDF Download Tests ---
  it("calls generatePdfFromData and saves the result on download click", async () => {
    const wrapper = mountEditor();
    const downloadButton = wrapper.find("button.bg-green-600");
    await downloadButton.trigger("click");

    vi.advanceTimersByTime(100);
    await flushPromises();

    expect(vi.mocked(generatePdfFromData)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(generatePdfFromData)).toHaveBeenCalledWith(
      expect.objectContaining({
        personalInfo: expect.objectContaining(defaultProps.personalInfo),
        sections: expect.arrayContaining([
          expect.objectContaining({ id: "s1", type: "workExperience" }),
          expect.objectContaining({ id: "s2", type: "education" }),
        ]),
      })
    );
    expect(mockPdfDoc.save).toHaveBeenCalledTimes(1); // Check mockPdfDoc was used
    expect(mockPdfDoc.save).toHaveBeenCalledWith(
      expect.stringMatching(/Proto User_.*\.pdf/)
    );
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

    vi.advanceTimersByTime(100);
    await flushPromises();

    expect(vi.mocked(generatePdfFromData)).toHaveBeenCalled();
    expect(mockPdfDoc.save).not.toHaveBeenCalled(); // Check mockPdfDoc was NOT used
    expect(errorSpy).toHaveBeenCalledWith(
      "Error during PDF generation or saving:",
      generationError
    );
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining("An error occurred")
    );
    expect(
      wrapper.find("button.bg-green-600").attributes("disabled")
    ).toBeUndefined();

    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("disables download button and shows spinner during PDF generation", async () => {
    let resolveGeneration;
    // Ensure the mock returns a promise THAT RESOLVES WITH mockPdfDoc
    const promiseMock = new Promise((res) => {
      resolveGeneration = () => res(mockPdfDoc); // Store resolver
    });
    vi.mocked(generatePdfFromData).mockImplementationOnce(() => promiseMock);

    const wrapper = mountEditor();
    const downloadButton = wrapper.find("button.bg-green-600");
    expect(downloadButton.attributes("disabled")).toBeUndefined();

    // Trigger async operation - Don't await click
    downloadButton.trigger("click");

    // Advance timers slightly and wait for Vue's reactivity
    vi.advanceTimersByTime(1);
    await wrapper.vm.$nextTick();

    // Check intermediate loading state
    const loadingButton = wrapper.find("button.bg-green-600");
    expect(loadingButton.attributes("disabled")).toBeDefined();
    expect(loadingButton.text()).toContain("Generating...");
    expect(wrapper.find(".fa-spinner.fa-spin").exists()).toBe(true);

    // Now that the mock *should* have been called and the promise started, resolveGeneration should be set.
    // If this still fails, the timing is very tricky. Alternative: don't check resolver directly.
    expect(
      resolveGeneration,
      "resolveGeneration function should be defined after mock is called"
    ).toBeInstanceOf(Function);
    resolveGeneration(); // Call the stored resolver to resolve the promise

    // Advance timers and flush promises AFTER resolving
    vi.advanceTimersByTime(100);
    await flushPromises(); // Ensure promise resolution and subsequent updates complete

    // Check final state
    const finalButton = wrapper.find("button.bg-green-600");
    expect(finalButton.attributes("disabled")).toBeUndefined();
    expect(finalButton.text()).not.toContain("Generating...");
    expect(wrapper.find(".fa-spinner.fa-spin").exists()).toBe(false);
    expect(mockPdfDoc.save).toHaveBeenCalled(); // Check save on the resolved mock doc
  });
});
