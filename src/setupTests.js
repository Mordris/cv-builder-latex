// src/setupTests.js
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { configureAxe } from "jest-axe";

// Configure axe-core rules if needed, or use defaults
const axe = configureAxe({
  // Example: Disable a rule if necessary (use sparingly)
  // rules: {
  //   'color-contrast': { enabled: false },
  // },
});

// Extend Vitest's expect with axe's matcher
expect.extend({
  async toHaveNoViolations(container) {
    const results = await axe(container);
    return {
      pass: results.violations.length === 0,
      message: () => {
        if (results.violations.length === 0) {
          return "Expected container not to have accessibility violations";
        }
        // Format violations for better readability
        const violationMessages = results.violations
          .map(
            ({ id, impact, description, helpUrl, nodes }) => `
Violation: ${id} (${impact})
Description: ${description}
Help: ${helpUrl}
Elements: ${nodes.map((n) => n.html).join(", ")}
                    `
          )
          .join("");
        return `Expected container not to have accessibility violations:\n${violationMessages}`;
      },
    };
  },
});
