// src/components/__tests__/CvPreview.spec.js
import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils"; // Use shallowMount to isolate CvPreview
import { render, screen, within } from "@testing-library/vue";
import CvPreview from "../CvPreview.vue";
// Import CvPreviewRenderer if NOT using shallowMount and you want to test its rendering via CvPreview
// import CvPreviewRenderer from '../CvPreviewRenderer.vue';

describe("CvPreview.vue", () => {
  const defaultPersonalInfo = {
    fullName: "Test User",
    jobTitle: "Tester",
    email: "test@example.com",
    phone: "123-456",
    address: "Test City",
    summary: "Test Summary",
  };

  const defaultSections = [
    {
      id: "s1",
      type: "workExperience",
      title: "Experience",
      items: [{ id: "i1", jobTitle: "Job A", company: "Comp A" }],
    },
    {
      id: "s2",
      type: "skills",
      title: "Skills",
      items: [{ id: "i2", name: "Skill A" }],
    },
  ];

  // Option 1: Using testing-library (more integrated, less isolated)
  const renderComponent = (
    personalInfo = defaultPersonalInfo,
    sections = defaultSections
  ) => {
    return render(CvPreview, {
      props: { personalInfo, sections },
      // If CvPreviewRenderer is complex, you might stub it here too
      // global: { stubs: { CvPreviewRenderer: true }}
    });
  };

  it("renders personal information correctly", () => {
    renderComponent();
    expect(
      screen.getByRole("heading", { level: 1, name: "Test User" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Tester" })
    ).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("123-456")).toBeInTheDocument();
    expect(screen.getByText("Test City")).toBeInTheDocument();
    expect(screen.getByText("Test Summary")).toBeInTheDocument();
  });

  it("renders section titles passed to CvPreviewRenderer", () => {
    renderComponent();
    // Assuming CvPreviewRenderer renders the titles correctly based on its own tests
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });

  it("renders placeholder text when no data is provided", () => {
    renderComponent(
      {
        // Empty personal info
        fullName: "",
        jobTitle: "",
        email: "",
        phone: "",
        address: "",
        summary: "",
      },
      []
    ); // Empty sections array
    // Check for placeholders or specific empty-state text defined in CvPreview template
    expect(
      screen.getByRole("heading", { level: 1, name: "Full Name" })
    ).toBeInTheDocument(); // Check for placeholder H1
    expect(
      screen.getByRole("heading", { level: 2, name: "Job Title" })
    ).toBeInTheDocument(); // Check for placeholder H2
    expect(
      screen.getByText(/Your CV preview will appear here/i)
    ).toBeInTheDocument();
  });

  // Option 2: Using shallowMount (more isolated)
  it("passes sections correctly to CvPreviewRenderer (using shallowMount)", () => {
    const wrapper = shallowMount(CvPreview, {
      props: {
        personalInfo: defaultPersonalInfo,
        sections: defaultSections,
      },
      // Stubs are automatic with shallowMount, but explicitly for clarity
      global: {
        stubs: {
          CvPreviewRenderer: true, // Ensure it's treated as a stub
        },
      },
    });

    // Find all instances of the stubbed CvPreviewRenderer
    const rendererStubs = wrapper.findAllComponents({
      name: "CvPreviewRenderer",
    }); // Or use the actual component import
    expect(rendererStubs).toHaveLength(2);

    // Check the props passed to each stub
    expect(rendererStubs[0].props("section")).toEqual(defaultSections[0]);
    expect(rendererStubs[1].props("section")).toEqual(defaultSections[1]);
  });

  // Test the exposed function (requires mounting, not shallow)
  it("exposes getPreviewDomElement function which returns the content element", () => {
    const wrapper = shallowMount(CvPreview, {
      // Use full mount for refs
      props: { personalInfo: defaultPersonalInfo, sections: defaultSections },
    });
    // Access the component instance
    const instance = wrapper.vm;
    const previewElement = instance.getPreviewDomElement();

    // Check if the returned element matches the ref
    expect(previewElement).toBeDefined();
    expect(previewElement).toBeInstanceOf(HTMLElement);
    expect(previewElement.id).toBe("cvPreviewContent"); // Check the ID from the template
  });
});
