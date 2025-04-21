# Modern CV Builder (Vue) ✨

A web application built with Vue 3 and Tailwind CSS to help users create professional-looking CVs/Resumes with a live preview and PDF download functionality.

## Features

- **Live Preview:** See changes to your CV reflected instantly.
- **Personal Information Editor:** Edit name, job title, contact details, and summary.
- **Dynamic Sections:** Add, remove, and reorder various CV sections:
  - Work Experience
  - Education
  - Skills (Tag-like input)
  - Projects (with optional links)
  - Languages (with proficiency levels)
  - Certifications
  - Custom Sections (with editable titles)
- **PDF Download:** Generate and download the created CV as a PDF document using jsPDF.
- **Responsive Design:** Usable across different screen sizes.

## Technologies Used

- **Frontend Framework:** [Vue 3](https://vuejs.org/) (with Composition API `<script setup>`)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)
- **Testing:** [Vitest](https://vitest.dev/), [Vue Test Utils](https://test-utils.vuejs.org/), [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- **Icons:** [Font Awesome](https://fontawesome.com/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Package Manager:** [Yarn](https://yarnpkg.com/)

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd cv-builder
    ```
2.  **Install dependencies:**
    ```bash
    yarn install
    ```

## Usage

1.  **Run the development server:**
    ```bash
    yarn dev
    ```
2.  Open your browser and navigate to the local URL provided (usually `http://localhost:5173`).
3.  Edit the CV content using the editor panel on the left.
4.  See the live preview update on the right.
5.  Click "Download PDF" to generate and save the CV.

## Testing

- **Run all unit/component tests:**
  ```bash
  yarn test
  ```
- **Run tests in watch mode:**
  ```bash
  yarn test:watch
  ```
- **Run tests with UI:**
  ```bash
  yarn test:ui
  ```

## ❗ Current Status & Known Issues

The application is functional, allowing users to build a CV and download a PDF that visually matches the preview based on the `pdfGenerator.js` logic.

However, there are **known issues with the automated tests** (`CvEditor.spec.js`) that need further investigation and resolution:

1.  **Stub Rendering/Finding Tests:**

    - Tests like `renders the correct section editor stubs based on props`, `emits "delete-section"...`, and `emits "move-section"...` are failing because they cannot find the dynamically rendered `SectionEditorStub` components immediately after mounting.
    - **Likely Cause:** This often happens with components rendered using `<component :is="...">` or `defineAsyncComponent`, combined with `<TransitionGroup>`. Even with `await flushPromises()`, the stubs might not be fully rendered or attached in the test environment when the assertions run.
    - **Next Steps:** Requires deeper investigation into waiting mechanisms for dynamic/async components in `@vue/test-utils` or potentially adjusting the stubbing strategy.

2.  **Async PDF Spinner Test Failure:**
    - The test `disables download button and shows spinner during PDF generation` fails its final assertion (`expect(mockPdfDoc.save).toHaveBeenCalled();`).
    - The `stderr` logs during the test run (`TypeError: pdfDoc.save is not a function`) indicate that while the promise _mock_ likely resolves, the object it resolves with (`pdfDoc`) doesn't have the expected `.save` method _within the context of this specific test execution_, despite the mock setup intending to return `mockPdfDoc` (which _does_ have `.save`).
    - **Likely Cause:** This points to a subtle interaction between the Promise mock setup, `vi.useFakeTimers()`, `flushPromises()`, and how the mocked `generatePdfFromData` function's return value is handled within the component's `async downloadPdf` method during the test lifecycle. The mock might be resolving with `undefined` in this specific test scenario despite working correctly in others.
    - **Next Steps:** Refine the promise mock setup within this test, potentially simplifying the async flow or adjusting how timers/promises are flushed after the resolution step.

Despite these test failures, the core PDF generation logic in `src/utils/pdfGenerator.js` appears to be creating the desired visual output based on manual testing. The test suite needs refinement to accurately reflect the component's behavior, especially concerning asynchronous operations and dynamic rendering.

## Future Improvements (Roadmap)

- Implement loading/saving CV data (e.g., to local storage or a backend).
- Add more CV templates and styling options.
- Support different export formats (e.g., DOCX).
- Improve accessibility (A11y) based on automated checks and manual review.
- Refactor PDF generation logic for potentially better testability.
- Add unit tests for `pdfGenerator.js`.
- Fix the outstanding component test issues.
