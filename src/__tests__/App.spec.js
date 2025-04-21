// src/__tests__/App.spec.js
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils"; // Use mount for integration
import App from "../App.vue";

// Define simple stub components
const CvEditorStub = {
  name: "CvEditor",
  props: ["personalInfo", "sections"],
  emits: [
    "update:personalInfo",
    "update:sections",
    "add-section",
    "delete-section",
    "move-section",
  ],
  template: '<div class="mock-cv-editor">Editor Mock</div>', // Keep the class for finding
};

const CvPreviewStub = {
  name: "CvPreview",
  props: ["personalInfo", "sections"],
  template: '<div class="mock-cv-preview">Preview Mock</div>', // Keep the class
  setup() {
    const getPreviewDomElement = () => document.createElement("div"); // Simple mock DOM element
    return { getPreviewDomElement };
  },
  // Need to define expose for setup components in stubs
  expose: ["getPreviewDomElement"],
};

describe("App.vue", () => {
  const createAppWrapper = () => {
    return mount(App, {
      global: {
        // Provide stubs directly
        stubs: {
          CvEditor: CvEditorStub,
          CvPreview: CvPreviewStub,
          // Add Transition/TransitionGroup stubs if they cause issues
          // Transition: true,
          // TransitionGroup: { template: '<div><slot/></div>', props: ['tag', 'name']}
        },
        // Provide mocks for inject if needed
        // provide: { ... }
      },
    });
  };

  it("renders editor and preview mocks", () => {
    const wrapper = createAppWrapper();
    // Use class selectors matching the stub templates
    expect(wrapper.find(".mock-cv-editor").exists()).toBe(true);
    expect(wrapper.find(".mock-cv-preview").exists()).toBe(true);
  });

  it("updates personalInfo when editor emits update", async () => {
    const wrapper = createAppWrapper();
    // Find the stub component instance
    const editorStub = wrapper.findComponent(CvEditorStub);

    // Simulate event emission from the stub instance
    await editorStub.vm.$emit("update:personalInfo", {
      fullName: "New Name",
      jobTitle: "New Title",
    });
    await wrapper.vm.$nextTick(); // Allow App component to react

    // Check props passed back down to the stub
    expect(editorStub.props("personalInfo").fullName).toBe("New Name");
    expect(editorStub.props("personalInfo").jobTitle).toBe("New Title");

    // Also check props passed to preview stub
    const previewStub = wrapper.findComponent(CvPreviewStub);
    expect(previewStub.props("personalInfo").fullName).toBe("New Name");
  });

  it("adds a section when editor emits add-section", async () => {
    const wrapper = createAppWrapper();
    const editorStub = wrapper.findComponent(CvEditorStub);
    const initialSectionCount = editorStub.props("sections").length;

    // Simulate adding a 'skills' section
    await editorStub.vm.$emit("add-section", "skills");
    await wrapper.vm.$nextTick();

    const updatedSections = editorStub.props("sections");
    expect(updatedSections).toHaveLength(initialSectionCount + 1);
    const newSection = updatedSections[updatedSections.length - 1];
    expect(newSection.type).toBe("skills");
    expect(newSection.title).toBe("Skills");
    expect(newSection.id).toBeDefined(); // Provided by App's logic
    expect(newSection.items).toBeDefined();

    // Check props passed to preview stub
    const previewStub = wrapper.findComponent(CvPreviewStub);
    expect(previewStub.props("sections")).toHaveLength(initialSectionCount + 1);
    expect(previewStub.props("sections")[initialSectionCount].type).toBe(
      "skills"
    );
  });

  it("deletes a section when editor emits delete-section", async () => {
    const wrapper = createAppWrapper();
    const editorStub = wrapper.findComponent(CvEditorStub);
    // Use App's initial state to get sections before passing down
    const initialSections = [...wrapper.vm.cvData.sections];
    const sectionToDelete = initialSections[0]; // Target the first section (workExperience)
    const initialCount = initialSections.length;

    expect(initialCount).toBeGreaterThan(0); // Ensure there's something to delete

    await editorStub.vm.$emit("delete-section", sectionToDelete.id);
    await wrapper.vm.$nextTick();

    const updatedSections = editorStub.props("sections");
    expect(updatedSections).toHaveLength(initialCount - 1);
    // Check that the deleted section is actually gone
    expect(
      updatedSections.find((s) => s.id === sectionToDelete.id)
    ).toBeUndefined();
    // Check that another section remains (e.g., the original education section)
    expect(updatedSections.find((s) => s.type === "education")).toBeDefined();
  });

  it("moves a section up/down when editor emits move-section", async () => {
    const wrapper = createAppWrapper();
    const editorStub = wrapper.findComponent(CvEditorStub);
    // Use App's initial state
    const initialSections = [...wrapper.vm.cvData.sections];
    const initialFirstId = initialSections[0].id; // workExperience
    const initialSecondId = initialSections[1].id; // education

    // Move the second section (education) up
    await editorStub.vm.$emit("move-section", initialSecondId, -1); // id, direction
    await wrapper.vm.$nextTick();

    let updatedSections = editorStub.props("sections");
    expect(updatedSections[0].id).toBe(initialSecondId); // Education should now be first
    expect(updatedSections[1].id).toBe(initialFirstId); // WorkExperience should now be second

    // Move it back down
    await editorStub.vm.$emit("move-section", initialSecondId, 1); // Move education (now at index 0) down
    await wrapper.vm.$nextTick();

    updatedSections = editorStub.props("sections");
    expect(updatedSections[0].id).toBe(initialFirstId); // Back to original order
    expect(updatedSections[1].id).toBe(initialSecondId);
  });
});
