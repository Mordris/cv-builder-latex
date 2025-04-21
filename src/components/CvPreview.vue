<template>
  <div class="bg-white rounded-xl shadow-lg p-2 md:p-4">
    <!-- Less padding on container -->
    <h2
      class="text-xl md:text-2xl font-semibold text-gray-800 mb-4 px-2 md:px-4 text-center lg:text-left"
    >
      CV Preview
    </h2>
    <!-- This inner div is what we'll capture for PDF. Apply padding here. -->
    <div
      id="cvPreviewContent"
      ref="previewContentRef"
      class="preview-render-area p-6 border border-gray-200 rounded-lg bg-white shadow-inner overflow-hidden"
    >
      <!-- Personal Info Preview -->
      <div class="text-center mb-6 border-b border-gray-200 pb-4">
        <h1
          v-if="personalInfo.fullName"
          class="text-3xl font-bold text-gray-900 mb-1"
        >
          {{ personalInfo.fullName }}
        </h1>
        <h1 v-else class="text-3xl font-bold text-gray-400 mb-1 italic">
          Full Name
        </h1>

        <h2
          v-if="personalInfo.jobTitle"
          class="text-xl text-indigo-600 font-medium mb-2"
        >
          {{ personalInfo.jobTitle }}
        </h2>
        <h2 v-else class="text-xl text-indigo-400 font-medium mb-2 italic">
          Job Title
        </h2>

        <div
          class="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-2"
        >
          <span v-if="personalInfo.email" class="inline-flex items-center">
            <i class="fas fa-envelope mr-1.5 opacity-70 fa-fw"></i
            >{{ personalInfo.email }}
          </span>
          <span v-if="personalInfo.phone" class="inline-flex items-center">
            <i class="fas fa-phone mr-1.5 opacity-70 fa-fw"></i
            >{{ personalInfo.phone }}
          </span>
          <span
            v-if="personalInfo.address"
            class="w-full text-center mt-1.5 inline-flex items-center justify-center"
          >
            <i class="fas fa-map-marker-alt mr-1.5 opacity-70 fa-fw"></i
            >{{ personalInfo.address }}
          </span>
        </div>
      </div>

      <!-- Profile Summary -->
      <div v-if="personalInfo.summary" class="mb-6">
        <h3 class="preview-section-title">Profile</h3>
        <p class="text-gray-700 whitespace-pre-line">
          {{ personalInfo.summary }}
        </p>
      </div>

      <!-- Dynamic Sections Preview -->
      <div v-for="section in sections" :key="section.id" class="mb-6">
        <CvPreviewRenderer :section="section" />
      </div>

      <p
        v-if="
          sections.length === 0 &&
          !personalInfo.summary &&
          !personalInfo.fullName
        "
        class="text-center text-gray-400 italic mt-8 py-4"
      >
        Your CV preview will appear here as you fill in the details.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CvPreviewRenderer from "./CvPreviewRenderer.vue";

defineProps({
  personalInfo: { type: Object, required: true },
  sections: { type: Array, required: true },
});

const previewContentRef = ref(null);

// Expose the function to get the DOM element for PDF generation
const getPreviewDomElement = () => {
  return previewContentRef.value;
};

defineExpose({ getPreviewDomElement });
</script>

<style scoped>
/* Add component-specific styles if needed */
/* Ensure the preview area has a defined width for consistent PDF output */
#cvPreviewContent {
  width: 100%; /* Or a fixed width like 210mm if preferred */
  box-sizing: border-box;
}
</style>
