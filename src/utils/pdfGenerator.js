// src/utils/pdfGenerator.js
import jsPDF from "jspdf";

// --- Constants ---
const FONT_FAMILY = "helvetica"; // Standard PDF Font
const MARGIN = 40; // points
const PAGE_WIDTH = 595.28; // A4 width in points
const PAGE_HEIGHT = 841.89; // A4 height in points

// Spacing
const LINE_SPACING = 1.5; // General paragraph line spacing
const SECTION_TITLE_MARGIN_BOTTOM = 4; // Space after section title text
const SECTION_LINE_MARGIN_BOTTOM = 8; // Space after the divider line
const SECTION_SPACING = 16; // Space *before* a new section title/line
const ITEM_SPACING = 12; // Space between items (like work experiences or education entries)
const SUB_ITEM_SPACING = 2; // Space within an item (e.g., between job title and company)
const DESCRIPTION_TOP_MARGIN = 5; // Space before the description text
const PARAGRAPH_SPACING = 8; // Space added after longer text blocks like summary or skills list

// Font Sizes
const FONT_SIZE_H1 = 18; // Name
const FONT_SIZE_H2 = 12; // Job Title
const FONT_SIZE_H3 = 11; // Section Title
const FONT_SIZE_BODY = 10; // Main text, item titles
const FONT_SIZE_SMALL = 9; // Contact Info, Company, Dates
const FONT_SIZE_XSMALL = 8; // Credential ID

// Line Heights
const LINE_HEIGHT_NORMAL = 1.3; // For multi-line text like descriptions
const LINE_HEIGHT_TIGHT = 1.15; // For single lines like titles, headings

// Line Style
const LINE_THICKNESS = 0.5;

// Colors
const COLOR_TEXT = "#1f2937"; // Dark Gray (Tailwind gray-800)
const COLOR_GRAY = "#6b7280"; // Gray-500 (For Company, Dates, Sub-info)
const COLOR_LIGHT_GRAY = "#cbd5e1"; // Gray-300 (For divider lines)

// Layout
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const DATE_COLUMN_WIDTH = 65; // Width allocated for the date on the right - Adjusted
const RIGHT_ALIGN_X = PAGE_WIDTH - MARGIN; // Right edge for alignment
const MAIN_CONTENT_WIDTH = CONTENT_WIDTH - DATE_COLUMN_WIDTH - 10; // Width for left content when date is present

export function generatePdfFromData(cvData) {
  console.log("Generating PDF with data:", JSON.stringify(cvData, null, 2)); // Log incoming data

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  let currentY = MARGIN;

  // --- Helper Functions ---

  function checkAddPage(neededHeight = FONT_SIZE_BODY * LINE_HEIGHT_NORMAL) {
    if (currentY + neededHeight > PAGE_HEIGHT - MARGIN) {
      console.log(
        `Adding Page: currentY=${currentY}, neededHeight=${neededHeight}, limit=${
          PAGE_HEIGHT - MARGIN
        }`
      );
      pdf.addPage();
      currentY = MARGIN; // Reset Y after adding page
      return true; // Page was added
    }
    return false; // Page was not added
  }

  // drawWrappedText: Returns the Y coordinate *after* the drawn text block
  function drawWrappedText(text, x, y, maxWidth, options = {}) {
    const {
      fontSize = FONT_SIZE_BODY,
      fontStyle = "normal",
      color = COLOR_TEXT,
      lineHeightFactor = LINE_HEIGHT_NORMAL,
      align = "left",
    } = options;

    if (!text || String(text).trim() === "") {
      return y;
    }

    // Set font for accurate splitting and drawing
    pdf.setFont(FONT_FAMILY, fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color);

    const lines = pdf.splitTextToSize(String(text), maxWidth);
    const singleLineHeight =
      pdf.getTextDimensions("M", { fontSize: fontSize }).h * lineHeightFactor;
    const neededHeight = lines.length * singleLineHeight;

    // Check if the *entire block* fits
    const pageAdded = checkAddPage(neededHeight);
    const drawY = pageAdded ? MARGIN : y; // Use MARGIN if new page started

    pdf.text(lines, x, drawY, {
      align: align,
      lineHeightFactor: lineHeightFactor,
      maxWidth: maxWidth,
    });

    // Return Y position below the drawn text
    return drawY + neededHeight; // Simpler calculation: start Y + total height
  }

  function drawLine(y, color = COLOR_LIGHT_GRAY, thickness = LINE_THICKNESS) {
    const needed = thickness + 4; // Include buffer
    checkAddPage(needed); // Check space BEFORE drawing
    // If page added, currentY is reset, use THAT for drawing
    const drawY = checkAddPage(0) ? MARGIN : y; // Re-check doesn't add page, just gets currentY status
    pdf.setLineWidth(thickness);
    pdf.setDrawColor(color);
    pdf.line(MARGIN, drawY, PAGE_WIDTH - MARGIN, drawY);
    return drawY + thickness; // Return Y position *after* the line
  }

  // --- Draw Content ---

  // 1. Header Section (Name, Title, Contact) - Final Balanced Spacing
  console.log("Drawing Header - Start Y:", currentY);
  let headerEndY = currentY; // Track Y position *within* the header drawing

  const estHeaderHeight = FONT_SIZE_H1 + FONT_SIZE_H2 + FONT_SIZE_SMALL + 20; // Rough estimate
  checkAddPage(estHeaderHeight);
  headerEndY = checkAddPage(0) ? MARGIN : currentY; // Use potentially updated Y if page added

  // Draw Full Name
  if (cvData.personalInfo?.fullName) {
    checkAddPage(FONT_SIZE_H1 * LINE_HEIGHT_TIGHT); // Check for this element
    headerEndY = checkAddPage(0) ? MARGIN : headerEndY; // Use potentially updated Y

    pdf.setFont(FONT_FAMILY, "bold");
    pdf.setFontSize(FONT_SIZE_H1);
    pdf.setTextColor(COLOR_TEXT);
    pdf.text(cvData.personalInfo.fullName, PAGE_WIDTH / 2, headerEndY, {
      align: "center",
    });
    headerEndY +=
      pdf.getTextDimensions("M", { fontSize: FONT_SIZE_H1 }).h *
      LINE_HEIGHT_TIGHT;
    headerEndY += 3; // Small gap after name
    console.log("  After Name Y:", headerEndY);
  }

  // Draw Job Title
  if (cvData.personalInfo?.jobTitle) {
    checkAddPage(FONT_SIZE_H2 * LINE_HEIGHT_TIGHT); // Check for this element
    headerEndY = checkAddPage(0) ? MARGIN : headerEndY; // Use potentially updated Y

    pdf.setFont(FONT_FAMILY, "normal");
    pdf.setFontSize(FONT_SIZE_H2);
    pdf.setTextColor(COLOR_TEXT);
    pdf.text(cvData.personalInfo.jobTitle, PAGE_WIDTH / 2, headerEndY, {
      align: "center",
    });
    headerEndY +=
      pdf.getTextDimensions("M", { fontSize: FONT_SIZE_H2 }).h *
      LINE_HEIGHT_TIGHT;
    headerEndY += 6; // Adjusted space after Job Title
    console.log("  After Title Y:", headerEndY);
  }

  // Draw Contact Info
  const contactInfoParts = [
    cvData.personalInfo?.phone,
    cvData.personalInfo?.address,
    cvData.personalInfo?.email,
  ].filter(Boolean); // Filter out null/empty strings

  if (contactInfoParts.length > 0) {
    const contactInfo = contactInfoParts.join("  \u2022  ");
    const estContactHeight =
      pdf.splitTextToSize(contactInfo, CONTENT_WIDTH).length *
      FONT_SIZE_SMALL *
      LINE_HEIGHT_TIGHT;
    checkAddPage(estContactHeight); // Check for this element
    headerEndY = checkAddPage(0) ? MARGIN : headerEndY; // Use potentially updated Y

    pdf.setFont(FONT_FAMILY, "normal");
    pdf.setFontSize(FONT_SIZE_SMALL);
    pdf.setTextColor(COLOR_GRAY);

    // Use drawWrappedText for centering AND potential wrapping
    headerEndY = drawWrappedText(
      contactInfo,
      MARGIN,
      headerEndY,
      CONTENT_WIDTH,
      {
        fontSize: FONT_SIZE_SMALL,
        color: COLOR_GRAY,
        align: "center",
        lineHeightFactor: LINE_HEIGHT_TIGHT, // Use tight for single line feel
      }
    );

    headerEndY += 8; // Adjusted space AFTER contact block
    console.log("  After Contact Y:", headerEndY);
  } else {
    // If NO contact info, add some space after Title before Profile starts
    headerEndY += 10; // Fallback spacing if contact info is missing
  }

  // Update the main currentY *after* the entire header block is drawn
  currentY = headerEndY;
  console.log("Drawing Header - End Y:", currentY);

  // 2. Profile Section
  if (cvData.personalInfo?.summary) {
    console.log("Drawing Profile Section - Start Y:", currentY);
    // No extra vertical space added here - controlled by header spacing above

    checkAddPage(
      FONT_SIZE_H3 +
        SECTION_TITLE_MARGIN_BOTTOM +
        LINE_THICKNESS +
        SECTION_LINE_MARGIN_BOTTOM +
        FONT_SIZE_BODY * 2
    );
    currentY = checkAddPage(0) ? MARGIN : currentY; // Use potentially updated Y

    // Draw Profile Title
    pdf.setFont(FONT_FAMILY, "bold");
    pdf.setFontSize(FONT_SIZE_H3);
    pdf.setTextColor(COLOR_TEXT);
    pdf.text("PROFILE", MARGIN, currentY);
    currentY += FONT_SIZE_H3 + SECTION_TITLE_MARGIN_BOTTOM; // Add space below text

    // Draw Line
    currentY = drawLine(currentY); // Draw line updates Y
    currentY += SECTION_LINE_MARGIN_BOTTOM; // Space after line

    // Draw Summary Text
    currentY = drawWrappedText(
      cvData.personalInfo.summary,
      MARGIN,
      currentY,
      CONTENT_WIDTH,
      { fontSize: FONT_SIZE_BODY, lineHeightFactor: LINE_HEIGHT_NORMAL }
    );
    currentY += PARAGRAPH_SPACING; // Space after paragraph
    console.log("Drawing Profile Section - End Y:", currentY);
  }

  // 3. Dynamic Sections (Work Experience, Education, Skills, etc.)
  console.log("Processing Dynamic Sections - Start Y:", currentY);
  if (cvData.sections && Array.isArray(cvData.sections)) {
    cvData.sections.forEach((section, sectionIndex) => {
      console.log(
        ` Processing Section ${sectionIndex}: ${section.title} (Type: ${section.type})`
      );
      const validItems = (section.items || []).filter((item) => {
        if (section.type === "workExperience" && !item.jobTitle) return false;
        if (section.type === "education" && !item.degree) return false;
        if (section.type === "skills" && !item.name) return false;
        if (section.type === "languages" && !item.name) return false;
        if (section.type === "projects" && !item.name) return false;
        if (section.type === "certifications" && !item.name) return false;
        if (section.type === "custom" && !item.title && !item.description)
          return false;
        return true; // Assume valid if required fields seem present
      });

      if (validItems.length === 0) {
        console.log(`  Skipping empty or invalid section: ${section.title}`);
        return; // Skip sections with no valid items
      }

      currentY += SECTION_SPACING; // Space before section title

      checkAddPage(
        FONT_SIZE_H3 +
          SECTION_TITLE_MARGIN_BOTTOM +
          LINE_THICKNESS +
          SECTION_LINE_MARGIN_BOTTOM +
          FONT_SIZE_BODY * LINE_HEIGHT_NORMAL * 2
      );
      currentY = checkAddPage(0) ? MARGIN : currentY; // Use potentially updated Y

      // Draw Section Title
      pdf.setFont(FONT_FAMILY, "bold");
      pdf.setFontSize(FONT_SIZE_H3);
      pdf.setTextColor(COLOR_TEXT);
      pdf.text(section.title.toUpperCase(), MARGIN, currentY);
      currentY += FONT_SIZE_H3 + SECTION_TITLE_MARGIN_BOTTOM;

      // Draw Divider Line
      currentY = drawLine(currentY);
      currentY += SECTION_LINE_MARGIN_BOTTOM;

      // --- Render Items ---
      switch (section.type) {
        case "workExperience":
        case "education":
        case "projects":
        case "certifications":
        case "custom":
          validItems.forEach((item, index) => {
            if (index > 0) {
              currentY += ITEM_SPACING; // Space between items
            }
            const estItemHeight = FONT_SIZE_BODY * LINE_HEIGHT_NORMAL * 4; // Estimate item height
            checkAddPage(estItemHeight);
            currentY = checkAddPage(0) ? MARGIN : currentY; // Use potentially updated Y

            const itemStartY = currentY;
            let leftContentEndY = itemStartY;

            // Determine date text
            let dateText = "";
            if (
              section.type === "workExperience" ||
              section.type === "projects"
            ) {
              dateText = item.dateRange || item.date || "";
            } else if (section.type === "education") {
              dateText =
                item.graduationDate || item.dateRange || item.date || "";
            } else if (section.type === "certifications") {
              // Combine issued/expiration if available? Or just pick one.
              dateText =
                item.dateIssued || item.expirationDate || item.date || "";
            }
            const hasDate = !!dateText;
            const itemContentMaxWidth = hasDate
              ? MAIN_CONTENT_WIDTH
              : CONTENT_WIDTH;

            // Primary Title (Job Title, Degree, Project Name, etc.)
            const primaryTitle =
              item.jobTitle || item.degree || item.name || item.title || "";
            if (primaryTitle) {
              leftContentEndY = drawWrappedText(
                primaryTitle,
                MARGIN,
                leftContentEndY,
                itemContentMaxWidth,
                {
                  fontSize: FONT_SIZE_BODY,
                  fontStyle: "bold",
                  lineHeightFactor: LINE_HEIGHT_TIGHT,
                }
              );
            }

            // Secondary Title (Company, Institution, Issuer etc.)
            const secondaryTitle =
              item.company || item.institution || item.issuer || "";
            if (secondaryTitle && section.type !== "custom") {
              // Example: Don't show for custom sections
              if (primaryTitle) leftContentEndY += SUB_ITEM_SPACING;
              leftContentEndY = drawWrappedText(
                secondaryTitle,
                MARGIN,
                leftContentEndY,
                itemContentMaxWidth,
                {
                  fontSize: FONT_SIZE_SMALL,
                  color: COLOR_GRAY,
                  lineHeightFactor: LINE_HEIGHT_TIGHT,
                }
              );
            }

            // Description / Details / Thesis / etc.
            const description = item.description || item.details || "";
            if (description) {
              if (primaryTitle || secondaryTitle)
                leftContentEndY += DESCRIPTION_TOP_MARGIN;
              leftContentEndY = drawWrappedText(
                description,
                MARGIN,
                leftContentEndY,
                CONTENT_WIDTH,
                {
                  fontSize: FONT_SIZE_BODY,
                  lineHeightFactor: LINE_HEIGHT_NORMAL,
                }
              );
            }

            // Credential ID (Certifications specific)
            if (section.type === "certifications" && item.credentialId) {
              leftContentEndY += SUB_ITEM_SPACING;
              leftContentEndY = drawWrappedText(
                `Credential ID: ${item.credentialId}`,
                MARGIN,
                leftContentEndY,
                CONTENT_WIDTH,
                {
                  fontSize: FONT_SIZE_XSMALL,
                  color: COLOR_GRAY,
                  lineHeightFactor: LINE_HEIGHT_TIGHT,
                }
              );
            }

            // Right Column Date
            if (hasDate) {
              checkAddPage(FONT_SIZE_SMALL); // Check space for date itself
              const dateDrawY = checkAddPage(0) ? MARGIN : itemStartY; // Use itemStartY unless page break happened
              pdf.setFont(FONT_FAMILY, "normal");
              pdf.setFontSize(FONT_SIZE_SMALL);
              pdf.setTextColor(COLOR_GRAY);
              pdf.text(dateText, RIGHT_ALIGN_X, dateDrawY, { align: "right" });
            }

            // Update main Y position
            currentY = leftContentEndY;
          });
          break; // End case for item-based sections

        case "skills":
        case "languages":
          const itemTexts = validItems
            .map((item) => {
              const name = String(item.name || "").trim();
              const level =
                section.type === "languages" && item.level
                  ? String(item.level).trim()
                  : "";
              return name + (level ? ` (${level})` : "");
            })
            .filter(Boolean);

          if (itemTexts.length > 0) {
            const joinedText = itemTexts.join("  \u2022  ");
            const estSkillHeight =
              pdf.splitTextToSize(joinedText, CONTENT_WIDTH).length *
              FONT_SIZE_BODY *
              LINE_HEIGHT_NORMAL;
            checkAddPage(estSkillHeight);
            currentY = checkAddPage(0) ? MARGIN : currentY; // Use potentially updated Y

            currentY = drawWrappedText(
              joinedText,
              MARGIN,
              currentY,
              CONTENT_WIDTH,
              { fontSize: FONT_SIZE_BODY, lineHeightFactor: LINE_HEIGHT_NORMAL }
            );
            currentY += PARAGRAPH_SPACING / 2; // Smaller gap after bullet list
          }
          break; // End Skills/Languages case

        default:
          console.warn(
            `PDF generator: Section type "${section.type}" rendering might be basic.`
          );
          validItems.forEach((item, index) => {
            if (index > 0) currentY += ITEM_SPACING;
            checkAddPage(FONT_SIZE_BODY * 3); // Estimate fallback item height
            currentY = checkAddPage(0) ? MARGIN : currentY;
            let tempY = currentY;
            // Try to find a title-like field
            const itemTitle = item.title || item.name || "[Untitled Item]";
            tempY = drawWrappedText(itemTitle, MARGIN, tempY, CONTENT_WIDTH, {
              fontStyle: "bold",
            });

            // Try to find a description-like field
            const itemDesc =
              item.description || item.details || "[No Description]";
            if (itemTitle) tempY += SUB_ITEM_SPACING;
            tempY = drawWrappedText(itemDesc, MARGIN, tempY, CONTENT_WIDTH);

            currentY = tempY + PARAGRAPH_SPACING / 2;
          });
      } // End switch
    }); // End sections.forEach
  } else {
    console.warn("cvData.sections is missing or not an array.");
  }

  console.log("PDF Generation Complete. Final Y:", currentY);
  return pdf;
}
