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
const DATE_COLUMN_WIDTH = 65; // Width allocated for the date on the right
const RIGHT_ALIGN_X = PAGE_WIDTH - MARGIN; // Right edge for alignment
const MAIN_CONTENT_WIDTH = CONTENT_WIDTH - DATE_COLUMN_WIDTH - 10; // Width for left content when date is present

export function generatePdfFromData(cvData) {
  console.log("--- PDF GENERATOR START (Applying Contact Center Fix) ---");
  console.log("Received cvData:", JSON.stringify(cvData, null, 2));

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  let currentY = MARGIN;

  // --- Helper Functions ---

  function checkAddPage(neededHeight = FONT_SIZE_BODY * LINE_HEIGHT_NORMAL) {
    const checkHeight = Math.max(neededHeight, FONT_SIZE_BODY);
    if (currentY + checkHeight > PAGE_HEIGHT - MARGIN) {
      console.log(
        `%cADDING PAGE: currentY=${currentY.toFixed(
          2
        )}, needed=${neededHeight.toFixed(2)}, limit=${(
          PAGE_HEIGHT - MARGIN
        ).toFixed(2)}`,
        "color: orange; font-weight: bold;"
      );
      pdf.addPage();
      currentY = MARGIN;
      return true;
    }
    return false;
  }

  function drawWrappedText(text, x, y, maxWidth, options = {}) {
    const {
      fontSize = FONT_SIZE_BODY,
      fontStyle = "normal",
      color = COLOR_TEXT,
      lineHeightFactor = LINE_HEIGHT_NORMAL,
      align = "left",
    } = options;

    if (!text || String(text).trim() === "") {
      console.log(`  Skipping empty text block passed at Y=${y.toFixed(2)}`);
      return y;
    }

    pdf.setFont(FONT_FAMILY, fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color);
    const lines = pdf.splitTextToSize(String(text), maxWidth);
    if (lines.length === 0) {
      console.warn(
        `  splitTextToSize resulted in 0 lines for text: "${text.substring(
          0,
          30
        )}..."`
      );
      return y;
    }
    const singleLineHeight =
      pdf.getTextDimensions("M", { fontSize: fontSize }).h * lineHeightFactor;
    const neededHeight = lines.length * singleLineHeight;

    const pageAdded = checkAddPage(neededHeight);
    const drawY = pageAdded ? currentY : y;

    console.log(
      `  Drawing text "${lines[0].substring(0, 20)}..." (${
        lines.length
      } lines) at Y=${drawY.toFixed(2)} / X=${x.toFixed(
        2
      )} (passed Y=${y.toFixed(2)}, pageAdded=${pageAdded})`
    );

    pdf.text(lines, x, drawY, {
      align: align,
      lineHeightFactor: lineHeightFactor,
      maxWidth: maxWidth,
    });
    const endY = drawY + neededHeight;
    console.log(`  -> Text end Y=${endY.toFixed(2)}`);
    return endY;
  }

  function drawLine(y, color = COLOR_LIGHT_GRAY, thickness = LINE_THICKNESS) {
    const needed = thickness + 4;
    const pageAdded = checkAddPage(needed);
    const drawY = pageAdded ? currentY : y;
    console.log(
      `  Drawing line at Y=${drawY.toFixed(2)} (passed Y=${y.toFixed(
        2
      )}, pageAdded=${pageAdded})`
    );
    pdf.setLineWidth(thickness);
    pdf.setDrawColor(color);
    pdf.line(MARGIN, drawY, PAGE_WIDTH - MARGIN, drawY);
    const endY = drawY + thickness;
    console.log(`  -> Line end Y=${endY.toFixed(2)}`);
    return endY;
  }

  // --- Draw Content ---

  // 1. Header Section - Using pdf.text for Name/Title, drawWrappedText for Contact
  console.log(
    `%c--- Drawing Header --- START Y: ${currentY.toFixed(2)}`,
    "color: blue; font-weight: bold;"
  );

  const estHeaderHeight =
    (FONT_SIZE_H1 + FONT_SIZE_H2 + FONT_SIZE_SMALL) * LINE_HEIGHT_TIGHT + 20;
  checkAddPage(estHeaderHeight);
  currentY = checkAddPage(0) ? MARGIN : currentY;

  // Draw Full Name using pdf.text
  if (cvData.personalInfo?.fullName) {
    checkAddPage(FONT_SIZE_H1 * LINE_HEIGHT_TIGHT);
    currentY = checkAddPage(0) ? MARGIN : currentY;

    console.log(`  Drawing Name (pdf.text) - Before Y: ${currentY.toFixed(2)}`);
    pdf.setFont(FONT_FAMILY, "bold");
    pdf.setFontSize(FONT_SIZE_H1);
    pdf.setTextColor(COLOR_TEXT);
    pdf.text(cvData.personalInfo.fullName, PAGE_WIDTH / 2, currentY, {
      align: "center",
    });
    currentY +=
      pdf.getTextDimensions("M", { fontSize: FONT_SIZE_H1 }).h *
      LINE_HEIGHT_TIGHT;
    currentY += 3; // Small gap after name
    console.log(`  Drawing Name - After Y (+gap): ${currentY.toFixed(2)}`);
  }

  // Draw Job Title using pdf.text
  if (cvData.personalInfo?.jobTitle) {
    checkAddPage(FONT_SIZE_H2 * LINE_HEIGHT_TIGHT);
    currentY = checkAddPage(0) ? MARGIN : currentY;

    console.log(
      `  Drawing Title (pdf.text) - Before Y: ${currentY.toFixed(2)}`
    );
    pdf.setFont(FONT_FAMILY, "normal");
    pdf.setFontSize(FONT_SIZE_H2);
    pdf.setTextColor(COLOR_TEXT);
    pdf.text(cvData.personalInfo.jobTitle, PAGE_WIDTH / 2, currentY, {
      align: "center",
    });
    currentY +=
      pdf.getTextDimensions("M", { fontSize: FONT_SIZE_H2 }).h *
      LINE_HEIGHT_TIGHT;
    currentY += 6; // Adjusted space after Job Title
    console.log(`  Drawing Title - After Y (+gap): ${currentY.toFixed(2)}`);
  }

  // Draw Contact Info using drawWrappedText with centered X coordinate
  const contactInfoParts = [
    cvData.personalInfo?.phone,
    cvData.personalInfo?.address,
    cvData.personalInfo?.email,
  ].filter(Boolean);

  if (contactInfoParts.length > 0) {
    const contactInfo = contactInfoParts.join("  \u2022  ");
    console.log(
      `  Drawing Contact (drawWrappedText) - Before Y: ${currentY.toFixed(2)}`
    );
    const estContactHeight =
      pdf.splitTextToSize(contactInfo, CONTENT_WIDTH).length *
      FONT_SIZE_SMALL *
      LINE_HEIGHT_TIGHT;
    checkAddPage(estContactHeight);
    currentY = checkAddPage(0) ? MARGIN : currentY;

    // *** Use PAGE_WIDTH / 2 for the x coordinate to center ***
    currentY = drawWrappedText(
      contactInfo,
      PAGE_WIDTH / 2,
      currentY,
      CONTENT_WIDTH,
      {
        fontSize: FONT_SIZE_SMALL,
        color: COLOR_GRAY,
        align: "center",
        lineHeightFactor: LINE_HEIGHT_TIGHT,
      }
    );
    // *** END CHANGE ***

    currentY += 8; // Adjusted space AFTER contact block for balance
    console.log(`  Drawing Contact - After Y (+gap): ${currentY.toFixed(2)}`);
  } else {
    currentY += 10; // Fallback spacing if contact info is missing
    console.log(
      `  No Contact Info - Added fallback space. Y: ${currentY.toFixed(2)}`
    );
  }
  console.log(
    `%c--- Drawing Header --- END Y: ${currentY.toFixed(2)}`,
    "color: blue; font-weight: bold;"
  );

  // 2. Profile Section
  if (cvData.personalInfo?.summary) {
    console.log(
      `%c--- Drawing Profile --- START Y: ${currentY.toFixed(2)}`,
      "color: green; font-weight: bold;"
    );

    checkAddPage(
      FONT_SIZE_H3 +
        SECTION_TITLE_MARGIN_BOTTOM +
        LINE_THICKNESS +
        SECTION_LINE_MARGIN_BOTTOM +
        FONT_SIZE_BODY * 2
    );
    currentY = checkAddPage(0) ? MARGIN : currentY;

    console.log(`  Drawing Profile Title - Before Y: ${currentY.toFixed(2)}`);
    pdf.setFont(FONT_FAMILY, "bold");
    pdf.setFontSize(FONT_SIZE_H3);
    pdf.setTextColor(COLOR_TEXT);
    pdf.text("PROFILE", MARGIN, currentY);
    currentY += FONT_SIZE_H3 + SECTION_TITLE_MARGIN_BOTTOM;
    console.log(
      `  Drawing Profile Title - After Y (+gap): ${currentY.toFixed(2)}`
    );

    console.log(`  Drawing Profile Line - Before Y: ${currentY.toFixed(2)}`);
    currentY = drawLine(currentY);
    currentY += SECTION_LINE_MARGIN_BOTTOM;
    console.log(
      `  Drawing Profile Line - After Y (+gap): ${currentY.toFixed(2)}`
    );

    console.log(`  Drawing Profile Summary - Before Y: ${currentY.toFixed(2)}`);
    currentY = drawWrappedText(
      cvData.personalInfo.summary,
      MARGIN,
      currentY,
      CONTENT_WIDTH,
      { fontSize: FONT_SIZE_BODY, lineHeightFactor: LINE_HEIGHT_NORMAL }
    );
    currentY += PARAGRAPH_SPACING;
    console.log(
      `  Drawing Profile Summary - After Y (+gap): ${currentY.toFixed(2)}`
    );
    console.log(
      `%c--- Drawing Profile --- END Y: ${currentY.toFixed(2)}`,
      "color: green; font-weight: bold;"
    );
  }

  // 3. Dynamic Sections
  console.log(
    `%c--- Processing Dynamic Sections --- START Y: ${currentY.toFixed(2)}`,
    "color: purple; font-weight: bold;"
  );
  if (cvData.sections && Array.isArray(cvData.sections)) {
    cvData.sections.forEach((section, sectionIndex) => {
      console.log(
        `%c Processing Section ${sectionIndex}: ${section.title} (Type: ${
          section.type
        }) - START Y: ${currentY.toFixed(2)}`,
        "color: purple;"
      );
      const validItems = (section.items || []).filter((item) => {
        if (section.type === "workExperience" && !item.jobTitle) return false;
        if (section.type === "education" && !item.degree) return false;
        if (
          section.type === "skills" &&
          (!item.name || String(item.name).trim() === "")
        )
          return false;
        if (
          section.type === "languages" &&
          (!item.name || String(item.name).trim() === "")
        )
          return false;
        if (section.type === "projects" && !item.name) return false;
        if (section.type === "certifications" && !item.name) return false;
        if (section.type === "custom" && !item.title && !item.description)
          return false;
        return true;
      });
      console.log(
        `   Section "${section.title}" - Valid items count: ${validItems.length}`
      );

      if (validItems.length === 0) {
        console.log(`  Skipping empty or invalid section: ${section.title}`);
        return;
      }

      currentY += SECTION_SPACING;
      checkAddPage(
        FONT_SIZE_H3 +
          SECTION_TITLE_MARGIN_BOTTOM +
          LINE_THICKNESS +
          SECTION_LINE_MARGIN_BOTTOM +
          FONT_SIZE_BODY * LINE_HEIGHT_NORMAL * 2
      );
      currentY = checkAddPage(0) ? MARGIN : currentY;

      console.log(
        `   Drawing Section Title - Before Y: ${currentY.toFixed(2)}`
      );
      pdf.setFont(FONT_FAMILY, "bold");
      pdf.setFontSize(FONT_SIZE_H3);
      pdf.setTextColor(COLOR_TEXT);
      pdf.text(section.title.toUpperCase(), MARGIN, currentY);
      currentY += FONT_SIZE_H3 + SECTION_TITLE_MARGIN_BOTTOM;
      console.log(
        `   Drawing Section Title - After Y (+gap): ${currentY.toFixed(2)}`
      );

      console.log(`   Drawing Section Line - Before Y: ${currentY.toFixed(2)}`);
      currentY = drawLine(currentY);
      currentY += SECTION_LINE_MARGIN_BOTTOM;
      console.log(
        `   Drawing Section Line - After Y (+gap): ${currentY.toFixed(2)}`
      );

      // --- Render Items ---
      switch (section.type) {
        case "workExperience":
        case "education":
        case "projects":
        case "certifications":
        case "custom":
          validItems.forEach((item, index) => {
            console.log(
              `    Drawing Item ${index} (Type: ${
                section.type
              }) - Before Y: ${currentY.toFixed(2)}`
            );
            if (index > 0) {
              currentY += ITEM_SPACING;
            }
            const estItemHeight = FONT_SIZE_BODY * LINE_HEIGHT_NORMAL * 4;
            checkAddPage(estItemHeight);
            currentY = checkAddPage(0) ? MARGIN : currentY;

            const itemStartY = currentY;
            let leftContentEndY = itemStartY;
            let dateText = "";
            if (
              section.type === "workExperience" ||
              section.type === "projects"
            )
              dateText = item.dateRange || item.date || "";
            else if (section.type === "education")
              dateText =
                item.graduationDate || item.dateRange || item.date || "";
            else if (section.type === "certifications")
              dateText =
                item.dateIssued || item.expirationDate || item.date || "";
            const hasDate = !!dateText;
            const itemContentMaxWidth = hasDate
              ? MAIN_CONTENT_WIDTH
              : CONTENT_WIDTH;

            const primaryTitle =
              item.jobTitle || item.degree || item.name || item.title || "";
            if (primaryTitle) {
              console.log(
                `      Drawing Primary Title - Before Y: ${leftContentEndY.toFixed(
                  2
                )}`
              );
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
              console.log(
                `      Drawing Primary Title - After Y: ${leftContentEndY.toFixed(
                  2
                )}`
              );
            }

            const secondaryTitle =
              item.company || item.institution || item.issuer || "";
            if (secondaryTitle && section.type !== "custom") {
              if (primaryTitle) leftContentEndY += SUB_ITEM_SPACING;
              console.log(
                `      Drawing Secondary Title - Before Y: ${leftContentEndY.toFixed(
                  2
                )}`
              );
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
              console.log(
                `      Drawing Secondary Title - After Y: ${leftContentEndY.toFixed(
                  2
                )}`
              );
            }

            const description = item.description || item.details || "";
            if (description) {
              if (primaryTitle || secondaryTitle)
                leftContentEndY += DESCRIPTION_TOP_MARGIN;
              console.log(
                `      Drawing Description - Before Y: ${leftContentEndY.toFixed(
                  2
                )}`
              );
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
              console.log(
                `      Drawing Description - After Y: ${leftContentEndY.toFixed(
                  2
                )}`
              );
            }

            if (section.type === "certifications" && item.credentialId) {
              leftContentEndY += SUB_ITEM_SPACING;
              console.log(
                `      Drawing Credential ID - Before Y: ${leftContentEndY.toFixed(
                  2
                )}`
              );
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
              console.log(
                `      Drawing Credential ID - After Y: ${leftContentEndY.toFixed(
                  2
                )}`
              );
            }

            if (hasDate) {
              console.log(
                `      Drawing Date - Aligning to Y: ${itemStartY.toFixed(2)}`
              );
              checkAddPage(FONT_SIZE_SMALL);
              const dateDrawY = checkAddPage(0)
                ? currentY === MARGIN
                  ? MARGIN
                  : itemStartY
                : itemStartY;
              pdf.setFont(FONT_FAMILY, "normal");
              pdf.setFontSize(FONT_SIZE_SMALL);
              pdf.setTextColor(COLOR_GRAY);
              pdf.text(dateText, RIGHT_ALIGN_X, dateDrawY, { align: "right" });
              console.log(
                `      Drawing Date - Drawn at Y: ${dateDrawY.toFixed(2)}`
              );
            }
            currentY = leftContentEndY;
            console.log(
              `    Drawing Item ${index} - End Y: ${currentY.toFixed(2)}`
            );
          });
          break;

        case "skills":
        case "languages":
          console.log(
            `    Processing Skills/Languages Section - Items:`,
            validItems
          );
          const itemTexts = validItems
            .map((item) => {
              const name = String(item.name || "").trim();
              const level =
                section.type === "languages" && item.level
                  ? String(item.level).trim()
                  : "";
              return name ? name + (level ? ` (${level})` : "") : null;
            })
            .filter(Boolean);

          console.log(`    -> Mapped Texts: [${itemTexts.join(", ")}]`);

          if (itemTexts.length > 0) {
            const joinedText = itemTexts.join("  \u2022  ");
            console.log(`    -> Joined Text: "${joinedText}"`);
            const estListHeight =
              pdf.splitTextToSize(joinedText, CONTENT_WIDTH).length *
              FONT_SIZE_BODY *
              LINE_HEIGHT_NORMAL;
            checkAddPage(estListHeight);
            currentY = checkAddPage(0) ? MARGIN : currentY;

            console.log(
              `    Drawing Skills/Lang List - Before Y: ${currentY.toFixed(2)}`
            );
            currentY = drawWrappedText(
              joinedText,
              MARGIN,
              currentY,
              CONTENT_WIDTH,
              { fontSize: FONT_SIZE_BODY, lineHeightFactor: LINE_HEIGHT_NORMAL }
            );
            currentY += PARAGRAPH_SPACING / 2;
            console.log(
              `    Drawing Skills/Lang List - After Y (+gap): ${currentY.toFixed(
                2
              )}`
            );
          } else {
            console.warn(
              `    Skipping Skills/Languages drawing - no valid item texts generated.`
            );
          }
          break;

        default:
          console.warn(
            `PDF generator: Section type "${section.type}" rendering might be basic.`
          );
          validItems.forEach((item, index) => {
            console.log(
              `    Drawing Fallback Item ${index} - Before Y: ${currentY.toFixed(
                2
              )}`
            );
            if (index > 0) currentY += ITEM_SPACING;
            checkAddPage(FONT_SIZE_BODY * 3);
            currentY = checkAddPage(0) ? MARGIN : currentY;

            let tempY = currentY;
            const itemTitle = item.title || item.name || "[Untitled Item]";
            tempY = drawWrappedText(itemTitle, MARGIN, tempY, CONTENT_WIDTH, {
              fontStyle: "bold",
            });

            const itemDesc =
              item.description || item.details || "[No Description]";
            if (itemTitle) tempY += SUB_ITEM_SPACING;
            tempY = drawWrappedText(itemDesc, MARGIN, tempY, CONTENT_WIDTH);

            currentY = tempY + PARAGRAPH_SPACING / 2;
            console.log(
              `    Drawing Fallback Item ${index} - After Y (+gap): ${currentY.toFixed(
                2
              )}`
            );
          });
      } // End switch
      console.log(
        `%c Processing Section ${sectionIndex}: ${
          section.title
        } - END Y: ${currentY.toFixed(2)}`,
        "color: purple;"
      );
    }); // End sections.forEach
  } else {
    console.warn("cvData.sections is missing or not an array.");
  }

  console.log("--- PDF Generation Complete --- Final Y:", currentY.toFixed(2));
  return pdf;
}
