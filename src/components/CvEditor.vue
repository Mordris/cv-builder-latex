<template>
  <div class="bg-white rounded-xl shadow-lg p-6 space-y-6">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-2">
      <h2 class="text-2xl font-semibold text-gray-800">Build Your CV</h2>
      <div class="flex gap-2 flex-wrap">
        <button
          @click="toggleModal"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center text-sm shadow-sm"
        >
          <i class="fas fa-plus mr-2"></i> Add Section
        </button>
        <button
          @click="downloadPdf"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center text-sm shadow-sm"
          :disabled="isGeneratingPdf"
        >
          <i
            :class="[
              'mr-2',
              isGeneratingPdf ? 'fas fa-spinner fa-spin' : 'fas fa-download',
            ]"
          ></i>
          {{ isGeneratingPdf ? "Generating..." : "Download PDF" }}
        </button>
      </div>
    </div>

    <!-- Personal Info Section -->
    <div class="p-6 bg-slate-50 rounded-lg border border-slate-200">
      <h3 class="text-xl font-medium text-gray-700 mb-5">
        Personal Information
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField
          label="Full Name"
          :modelValue="editablePersonalInfo.fullName"
          @update:modelValue="updatePersonalInfo('fullName', $event)"
          placeholder="Your Full Name"
        />
        <InputField
          label="Job Title"
          :modelValue="editablePersonalInfo.jobTitle"
          @update:modelValue="updatePersonalInfo('jobTitle', $event)"
          placeholder="e.g., Software Engineer"
        />
        <InputField
          label="Email"
          type="email"
          :modelValue="editablePersonalInfo.email"
          @update:modelValue="updatePersonalInfo('email', $event)"
          placeholder="your.email@example.com"
        />
        <InputField
          label="Phone"
          type="tel"
          :modelValue="editablePersonalInfo.phone"
          @update:modelValue="updatePersonalInfo('phone', $event)"
          placeholder="(123) 456-7890"
        />
        <InputField
          label="Address"
          :modelValue="editablePersonalInfo.address"
          @update:modelValue="updatePersonalInfo('address', $event)"
          placeholder="City, Country (Optional)"
          class="md:col-span-2"
        />
        <TextareaField
          label="Profile Summary"
          :modelValue="editablePersonalInfo.summary"
          @update:modelValue="updatePersonalInfo('summary', $event)"
          placeholder="Briefly introduce yourself and highlight key skills or experience..."
          rows="4"
          class="md:col-span-2"
        />
      </div>
    </div>

    <!-- Dynamic Sections Container -->
    <TransitionGroup name="section-list" tag="div" class="space-y-6 relative">
      <component
        v-for="(section, index) in editableSections"
        :key="section.id"
        :is="getSectionComponent(section.type)"
        :modelValue="section"
        @update:modelValue="updateSection(index, $event)"
        @delete-section="$emit('delete-section', section.id)"
        @move-section="
          (direction) => $emit('move-section', section.id, direction)
        "
        :is-first="index === 0"
        :is-last="index === editableSections.length - 1"
        class="transition-all duration-300 ease-out"
      />
    </TransitionGroup>

    <p
      v-if="editableSections.length === 0"
      class="text-center text-gray-500 italic pt-4"
    >
      Click "Add Section" to start building your CV content.
    </p>

    <!-- Add Section Modal -->
    <AddSectionModal
      :show="showModal"
      @close="toggleModal"
      @select-section="handleAddSection"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, defineAsyncComponent, inject } from "vue";
import AddSectionModal from "./AddSectionModal.vue";
import InputField from "./controls/InputField.vue";
import TextareaField from "./controls/TextareaField.vue";
// Removed direct jsPDF/html2canvas imports

// Import the new generator function
import { generatePdfFromData } from "../utils/pdfGenerator";

// --- Props and Emits ---
const props = defineProps({
  personalInfo: { type: Object, required: true },
  sections: { type: Array, required: true },
});
const emit = defineEmits([
  "update:personalInfo",
  "update:sections",
  "add-section",
  "delete-section",
  "move-section",
]);

// --- PDF Generation State ---
const isGeneratingPdf = ref(false);
// We no longer need getPreviewElement inject for PDF generation
// const getPreviewElement = inject("getPreviewElement");

// --- Local Editable Copies ---
const editablePersonalInfo = computed(() => props.personalInfo);
const editableSections = computed(() => props.sections);

// --- Update Methods ---
const updatePersonalInfo = (key, value) => {
  emit("update:personalInfo", { ...props.personalInfo, [key]: value });
};
const updateSection = (index, updatedSectionData) => {
  const newSections = [...props.sections];
  newSections[index] = updatedSectionData;
  emit("update:sections", newSections);
};

// --- Modal State ---
const showModal = ref(false);
const toggleModal = () => (showModal.value = !showModal.value);
const handleAddSection = (sectionType) => {
  emit("add-section", sectionType);
  toggleModal();
};

// --- Section Component Mapping ---
const sectionComponents = {
  workExperience: defineAsyncComponent(() =>
    import("./sections/WorkExperienceEditor.vue")
  ),
  education: defineAsyncComponent(() =>
    import("./sections/EducationEditor.vue")
  ),
  skills: defineAsyncComponent(() => import("./sections/SkillsEditor.vue")),
  projects: defineAsyncComponent(() => import("./sections/ProjectsEditor.vue")),
  languages: defineAsyncComponent(() =>
    import("./sections/LanguagesEditor.vue")
  ),
  certifications: defineAsyncComponent(() =>
    import("./sections/CertificationsEditor.vue")
  ),
  custom: defineAsyncComponent(() =>
    import("./sections/CustomSectionEditor.vue")
  ),
};
const getSectionComponent = (type) => {
  return sectionComponents[type] || null;
};

// --- *** REVISED PDF Download Function *** ---
const downloadPdf = async () => {
  isGeneratingPdf.value = true;
  console.log("Starting PDF generation using jsPDF manual API...");

  // Use a try...finally block to ensure loading state is reset
  try {
    // Give UI a moment to update to "Generating..." state if needed
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Create a deep copy of the CV data to pass to the generator
    // This prevents any potential modification of the original reactive data
    const cvData = {
      personalInfo: JSON.parse(JSON.stringify(props.personalInfo)),
      sections: JSON.parse(JSON.stringify(props.sections)),
    };

    // Call the generator function (defined in src/utils/pdfGenerator.js)
    const pdfDoc = generatePdfFromData(cvData);

    // Define filename
    const filename = `${props.personalInfo.fullName || "CV"}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    console.log(`Saving PDF as ${filename}...`);

    // Save the generated document
    pdfDoc.save(filename);

    console.log("PDF generation process finished successfully.");
  } catch (error) {
    console.error("Error during PDF generation or saving:", error);
    alert(
      "An error occurred while generating the PDF. Please check the console for details."
    );
  } finally {
    isGeneratingPdf.value = false; // Ensure loading state is always reset
  }
};
</script>
