// src/components/__tests__/CvPreviewRenderer.spec.js
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import CvPreviewRenderer from "../CvPreviewRenderer.vue";

describe("CvPreviewRenderer.vue", () => {
  const renderComponent = (section) => {
    return render(CvPreviewRenderer, { props: { section } });
  };

  it("renders nothing if section has no valid items (workExperience)", () => {
    renderComponent({
      id: "s1",
      type: "workExperience",
      title: "Experience",
      items: [
        { id: "i1", jobTitle: "", company: "", date: "", description: "" },
      ],
    });
    expect(screen.queryByText("Experience")).not.toBeInTheDocument();
  });

  it("renders work experience section correctly", () => {
    renderComponent({
      id: "s1",
      type: "workExperience",
      title: "Experience",
      items: [
        {
          id: "i1",
          jobTitle: "Dev",
          company: "Comp A",
          date: "2022",
          description: "Did stuff",
        },
        {
          id: "i2",
          jobTitle: "Tester",
          company: "Comp B",
          date: "2021",
          description: "",
        }, // No desc
        { id: "i3", jobTitle: "", company: "", date: "", description: "" }, // Empty item
      ],
    });
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Dev")).toBeInTheDocument();
    expect(screen.getByText("Comp A")).toBeInTheDocument();
    expect(screen.getByText("2022")).toBeInTheDocument();
    expect(screen.getByText("Did stuff")).toBeInTheDocument();
    expect(screen.getByText("Tester")).toBeInTheDocument();
    expect(screen.getByText("Comp B")).toBeInTheDocument();
    expect(screen.getByText("2021")).toBeInTheDocument();
    expect(screen.queryByText("Did stuff").nextElementSibling).toBeNull(); // Ensure empty description isn't rendered for item 2

    // Ensure the empty item i3 is not rendered
    expect(screen.queryAllByRole("heading", { level: 4 })).toHaveLength(2); // Only two h4s expected
  });

  it("renders education section correctly", () => {
    renderComponent({
      id: "s2",
      type: "education",
      title: "Studies",
      items: [
        {
          id: "i1",
          degree: "BSc",
          institution: "Uni A",
          date: "2020",
          description: "Thesis A",
        },
        {
          id: "i2",
          degree: "MSc",
          institution: "Uni B",
          date: "2022",
          description: "",
        }, // No desc
      ],
    });
    expect(screen.getByText("Studies")).toBeInTheDocument();
    expect(screen.getByText("BSc")).toBeInTheDocument();
    expect(screen.getByText("Uni A")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText("Thesis A")).toBeInTheDocument();
    expect(screen.getByText("MSc")).toBeInTheDocument();
    expect(screen.getByText("Uni B")).toBeInTheDocument();
    expect(screen.getByText("2022")).toBeInTheDocument();
  });

  it("renders skills section correctly", () => {
    renderComponent({
      id: "s3",
      type: "skills",
      title: "Abilities",
      items: [
        { id: "i1", name: "JS" },
        { id: "i2", name: "CSS" },
        { id: "i3", name: "" }, // Empty
      ],
    });
    expect(screen.getByText("Abilities")).toBeInTheDocument();
    expect(screen.getByText("JS")).toBeInTheDocument();
    expect(screen.getByText("CSS")).toBeInTheDocument();
    // Check correct number of skill spans are rendered, avoiding ambiguous empty string check
    const skillSpans = screen
      .getAllByText(/.+/)
      .filter(
        (el) => el.tagName === "SPAN" && el.classList.contains("bg-indigo-100")
      );
    expect(skillSpans).toHaveLength(2); // Only expect JS and CSS spans
  });

  it("renders projects section correctly with links", () => {
    renderComponent({
      id: "s4",
      type: "projects",
      title: "Creations",
      items: [
        {
          id: "i1",
          name: "Project X",
          link: "example.com",
          date: "2023",
          description: "Desc X",
        },
        {
          id: "i2",
          name: "Project Y",
          link: "",
          date: "",
          description: "Desc Y",
        }, // No link/date
      ],
    });
    expect(screen.getByText("Creations")).toBeInTheDocument();
    // Project X
    const linkX = screen.getByRole("link", { name: /project x/i });
    expect(linkX).toBeInTheDocument();
    expect(linkX).toHaveAttribute("href", "https://example.com"); // Check formatted link
    expect(linkX).toHaveAttribute("target", "_blank");
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("Desc X")).toBeInTheDocument();
    // Project Y
    expect(screen.getByText("Project Y")).toBeInTheDocument(); // Rendered as span, not link
    expect(
      screen.queryByRole("link", { name: /project y/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Desc Y")).toBeInTheDocument();
  });

  it("renders languages section correctly", () => {
    renderComponent({
      id: "s5",
      type: "languages",
      title: "Tongues",
      items: [
        { id: "i1", name: "English", level: "Native" },
        { id: "i2", name: "Spanish", level: "Basic" },
        { id: "i3", name: "German", level: "" }, // No level
      ],
    });
    expect(screen.getByText("Tongues")).toBeInTheDocument();
    // Query the parent element to check combined text content
    const englishSpan = screen.getByText("English").closest("span");
    expect(englishSpan).toHaveTextContent(/English.*\(Native\)/);

    const spanishSpan = screen.getByText("Spanish").closest("span");
    expect(spanishSpan).toHaveTextContent(/Spanish.*\(Basic\)/);

    const germanSpan = screen.getByText("German").closest("span");
    expect(germanSpan).toHaveTextContent(/^German$/); // Should not contain parentheses

    // Verify only 2 levels are rendered
    const levelSpans = screen.getAllByText(/\(.*\)/);
    expect(levelSpans).toHaveLength(2);
  });

  it("renders certifications section correctly", () => {
    renderComponent({
      id: "s6",
      type: "certifications",
      title: "Badges",
      items: [
        {
          id: "i1",
          name: "Cert A",
          issuer: "Org A",
          date: "2024",
          credentialId: "123",
        },
        {
          id: "i2",
          name: "Cert B",
          issuer: "Org B",
          date: "",
          credentialId: "",
        }, // Only name/issuer
      ],
    });
    expect(screen.getByText("Badges")).toBeInTheDocument();
    expect(screen.getByText("Cert A")).toBeInTheDocument();
    expect(screen.getByText("Org A")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText(/Credential ID: 123/)).toBeInTheDocument();
    expect(screen.getByText("Cert B")).toBeInTheDocument();
    expect(screen.getByText("Org B")).toBeInTheDocument();
  });

  it("renders custom section correctly", () => {
    renderComponent({
      id: "s7",
      type: "custom",
      title: "Extra Curriculars",
      items: [
        { id: "i1", title: "Volunteering", description: "Desc 1" },
        { id: "i2", title: "", description: "Desc 2 Only" }, // Only desc
        { id: "i3", title: "Award", description: "" }, // Only title
      ],
    });
    expect(screen.getByText("Extra Curriculars")).toBeInTheDocument();
    expect(screen.getByText("Volunteering")).toBeInTheDocument();
    expect(screen.getByText("Desc 1")).toBeInTheDocument();
    expect(screen.getByText("Desc 2 Only")).toBeInTheDocument();
    expect(screen.getByText("Award")).toBeInTheDocument();
    // Use queryAllByRole to correctly check the count
    expect(screen.queryAllByRole("heading", { level: 4 })).toHaveLength(2);
  });
});
