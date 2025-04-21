// src/utils/pdfGenerator.js
import jsPDF from "jspdf";

// --- Constants ---
const FONT_FAMILY = "helvetica"; // Standard PDF Font
const MARGIN = 40; // points
const LINE_SPACING = 5; // Extra space between lines/elements

const FONT_SIZE_H1 = 20; // Name
const FONT_SIZE_H2 = 14; // Job Title
const FONT_SIZE_H3 = 12; // Section Title
const FONT_SIZE_BODY = 10;
const FONT_SIZE_SMALL = 9;
const FONT_SIZE_XSMALL = 8;

const LINE_HEIGHT_NORMAL = 1.3; // Adjusted line height
const LINE_HEIGHT_TIGHT = 1.1;

const SECTION_SPACING = 18; // Space *before* section title/line
const ITEM_SPACING = 10; // Space between items (like work experiences)
const SUB_ITEM_SPACING = 3; // Space within an item (e.g., between job title and company)
const TITLE_BOTTOM_MARGIN = 6; // Space after section title text
const LINE_THICKNESS = 0.75;

const COLOR_TEXT = "#111827"; // Darker Gray (like text-gray-900)
const COLOR_PRIMARY = "#4f46e5"; // Indigo-600 (approximated)
const COLOR_GRAY = "#6b7280"; // Gray-500
const COLOR_LIGHT_GRAY = "#d1d5db"; // Gray-300 for lines

export function generatePdfFromData(cvData) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;
  let currentY = MARGIN; // Start drawing below top margin

  // --- Helper Functions ---

  // Checks if content fits, adds page if not. Returns true if page added.
  function checkAddPage(neededHeight = FONT_SIZE_BODY * LINE_HEIGHT_NORMAL) {
    // Add a small buffer to prevent drawing exactly at the margin
    if (currentY + neededHeight >= pageHeight - MARGIN) {
      pdf.addPage();
      currentY = MARGIN; // Reset Y for new page
      return true; // Page added
    }
    return false; // No page added
  }

  // Draws wrapped text at specified x, y. Updates and returns the new Y position below the text.
  function drawWrappedText(text, x, y, maxWidth, options = {}) {
    const {
      fontSize = FONT_SIZE_BODY,
      fontStyle = "normal", // 'normal', 'bold', 'italic'
      color = COLOR_TEXT,
      lineHeightFactor = LINE_HEIGHT_NORMAL,
      align = "left",
    } = options;

    if (!text || String(text).trim() === "") return y; // Return current Y if no text

    pdf.setFont(FONT_FAMILY, fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color);

    const lines = pdf.splitTextToSize(String(text), maxWidth);
    const singleLineHeight = fontSize * lineHeightFactor;
    const neededHeight = lines.length * singleLineHeight;

    // Check if the *whole block* fits BEFORE drawing
    const pageAdded = checkAddPage(neededHeight);
    // If page was added, reset the effective Y coordinate for drawing this block
    const drawY = pageAdded ? MARGIN : y;

    // Use jsPDF's alignment and line height factor directly
    pdf.text(lines, x, drawY, {
      align: align,
      lineHeightFactor: lineHeightFactor,
    });

    // Return new Y position below the drawn text block
    return drawY + neededHeight;
  }

  // Draws a horizontal line at y. Updates and returns the new Y position below the line.
  // Takes checkAddPage function as argument because it needs to check space *before* drawing.
  function drawLine(
    y,
    checkPageFn,
    color = COLOR_LIGHT_GRAY,
    thickness = LINE_THICKNESS
  ) {
    checkPageFn(thickness + 4); // Check space needed for line + buffer
    pdf.setLineWidth(thickness);
    pdf.setDrawColor(color);
    pdf.line(MARGIN, y, pageWidth - MARGIN, y); // Draw line at current y
    return y + thickness + 2; // Return Y below line
  }

  // --- Draw Content ---

  // Personal Info - Centered
  if (cvData.personalInfo.fullName) {
    currentY = drawWrappedText(
      cvData.personalInfo.fullName,
      MARGIN,
      currentY,
      contentWidth,
      {
        fontSize: FONT_SIZE_H1,
        fontStyle: "bold",
        align: "center",
        lineHeightFactor: LINE_HEIGHT_TIGHT,
      }
    );
    currentY += 5; // Space after name
  }
  if (cvData.personalInfo.jobTitle) {
    currentY = drawWrappedText(
      cvData.personalInfo.jobTitle,
      MARGIN,
      currentY,
      contentWidth,
      {
        fontSize: FONT_SIZE_H2,
        color: COLOR_PRIMARY,
        align: "center",
        lineHeightFactor: LINE_HEIGHT_TIGHT,
      }
    );
    currentY += 8; // Space after job title
  }
  const contactInfo = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.address,
  ]
    .filter(Boolean)
    .join("  \u2022  "); // Use bullet separator
  if (contactInfo) {
    currentY = drawWrappedText(contactInfo, MARGIN, currentY, contentWidth, {
      fontSize: FONT_SIZE_SMALL,
      color: COLOR_GRAY,
      align: "center",
      lineHeightFactor: LINE_HEIGHT_TIGHT,
    });
    currentY += 15; // More space after contact block
  }

  // Profile Section
  if (cvData.personalInfo.summary) {
    currentY += SECTION_SPACING / 2;
    // --- Pass checkAddPage to drawLine ---
    currentY = drawLine(currentY, checkAddPage);
    currentY += 2; // Space between line and title

    checkAddPage(FONT_SIZE_H3 + TITLE_BOTTOM_MARGIN); // Check space for title itself
    pdf.setFont(FONT_FAMILY, "bold");
    pdf.setFontSize(FONT_SIZE_H3);
    pdf.setTextColor(COLOR_TEXT);
    pdf.text("PROFILE", MARGIN, currentY);
    currentY += FONT_SIZE_H3 + TITLE_BOTTOM_MARGIN; // Advance Y past title text

    currentY = drawWrappedText(
      cvData.personalInfo.summary,
      MARGIN,
      currentY,
      contentWidth,
      { fontSize: FONT_SIZE_BODY }
    );
  }

  // Dynamic Sections
  cvData.sections.forEach((section) => {
    // No need for sectionIndex here now
    // Filter out empty items
    const requiredFieldsMap = {
      workExperience: ["jobTitle"],
      education: ["degree"],
      skills: ["name"],
      projects: ["name"],
      languages: ["name"],
      certifications: ["name"],
      custom: ["title", "description"], // Allow title OR desc for custom
    };
    const requiredFields = requiredFieldsMap[section.type] || [
      "title",
      "description",
    ];
    const validItems = section.items.filter((item) => {
      return requiredFields.some(
        (field) => item[field] && String(item[field]).trim() !== ""
      );
    });
    if (validItems.length === 0) return; // Skip section if no valid items

    // Add space before section title/line
    currentY += SECTION_SPACING;
    // Pass checkAddPage to drawLine
    currentY = drawLine(currentY, checkAddPage);
    currentY += 2; // Space between line and title

    checkAddPage(FONT_SIZE_H3 + TITLE_BOTTOM_MARGIN); // Check space for title
    pdf.setFont(FONT_FAMILY, "bold");
    pdf.setFontSize(FONT_SIZE_H3);
    pdf.setTextColor(COLOR_TEXT);
    pdf.text(section.title.toUpperCase(), MARGIN, currentY);
    currentY += FONT_SIZE_H3 + TITLE_BOTTOM_MARGIN; // Advance Y past title text

    // --- Render Items based on Type ---
    switch (section.type) {
      case "workExperience":
      case "education":
      case "projects":
      case "certifications":
      case "custom":
        validItems.forEach((item, index) => {
          // Add space *between* items
          if (index > 0) currentY += ITEM_SPACING;

          const itemStartY = currentY; // Y position at the start of this item
          const dateText = item.date || "";
          // Estimate width needed for date column. If no date, use full width for main content.
          const dateWidth = dateText ? pdf.getTextWidth(dateText) + 10 : 0;
          const mainContentWidth = contentWidth - dateWidth;

          // Use a temporary Y to calculate height of left column content
          let tempY = currentY;
          let primaryTitle =
            item.jobTitle || item.degree || item.name || item.title || "";
          let secondaryTitle =
            item.company || item.institution || item.issuer || "";
          if (section.type === "custom") secondaryTitle = ""; // Custom uses only item title/desc

          // Draw left column content
          if (primaryTitle) {
            tempY = drawWrappedText(
              primaryTitle,
              MARGIN,
              tempY,
              mainContentWidth,
              {
                fontSize: FONT_SIZE_BODY,
                fontStyle: "bold",
                lineHeightFactor: LINE_HEIGHT_TIGHT,
              }
            );
          }
          if (secondaryTitle) {
            if (primaryTitle) tempY += SUB_ITEM_SPACING;
            tempY = drawWrappedText(
              secondaryTitle,
              MARGIN,
              tempY,
              mainContentWidth,
              {
                fontSize: FONT_SIZE_SMALL,
                color: COLOR_GRAY,
                lineHeightFactor: LINE_HEIGHT_TIGHT,
              }
            );
          }

          // Add gap before description only if there was a title/subtitle
          if (primaryTitle || secondaryTitle) tempY += SUB_ITEM_SPACING * 1.5;

          if (item.description) {
            // Use full width for description
            tempY = drawWrappedText(
              item.description,
              MARGIN,
              tempY,
              contentWidth,
              { fontSize: FONT_SIZE_BODY }
            );
          }
          if (item.credentialId) {
            tempY += SUB_ITEM_SPACING;
            tempY = drawWrappedText(
              `Credential ID: ${item.credentialId}`,
              MARGIN,
              tempY,
              contentWidth,
              { fontSize: FONT_SIZE_XSMALL, color: COLOR_GRAY }
            );
          }

          // Draw Date (Right Side), aligned vertically with itemStartY
          if (dateText) {
            const dateLines = pdf.splitTextToSize(
              dateText,
              dateWidth > 0 ? dateWidth - 5 : contentWidth
            ); // Prevent zero width
            const dateNeededHeight =
              dateLines.length * FONT_SIZE_SMALL * LINE_HEIGHT_NORMAL;
            // Use checkAddPage directly here, ensuring date fits from itemStartY
            checkAddPage(dateNeededHeight);
            pdf.setFont(FONT_FAMILY, "normal");
            pdf.setFontSize(FONT_SIZE_SMALL);
            pdf.setTextColor(COLOR_GRAY);
            pdf.text(dateText, pageWidth - MARGIN, itemStartY, {
              align: "right",
            });
            // Date Y position doesn't affect main flow's currentY
          }

          // Update main Y position to be below the drawn content
          currentY = tempY;
        });
        break; // End of list-like sections

      case "skills":
      case "languages": // Combine logic slightly
        const itemTexts = validItems
          .map((item) => {
            const name = String(item.name).trim();
            const level =
              section.type === "languages" && item.level
                ? String(item.level).trim()
                : "";
            return name + (level ? ` (${level})` : "");
          })
          .filter(Boolean);

        if (itemTexts.length > 0) {
          // Draw as a single wrapped line with separators
          currentY = drawWrappedText(
            itemTexts.join("  \u2022  "), // Use bullet separator
            MARGIN,
            currentY,
            contentWidth,
            { fontSize: FONT_SIZE_BODY }
          );
        }
        break; // End skills/languages

      default:
        console.warn(`PDF generator: Unknown section type "${section.type}"`);
    }
    // Spacing after the entire section is handled by SECTION_SPACING before the next one
  });

  return pdf; // Return the generated PDF object
}
