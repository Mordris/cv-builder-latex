<template>
  <div class="container mx-auto px-4 py-8 max-w-screen-xl">
    <header class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-indigo-700 mb-2">Modern CV Builder</h1>
      <p class="text-gray-600">Create a professional resume in minutes</p>
    </header>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Editor Panel -->
      <CvEditor
        v-model:personalInfo="cvData.personalInfo"
        v-model:sections="cvData.sections"
        @add-section="addSection"
        @delete-section="deleteSection"
        @move-section="moveSection"
        class="w-full lg:w-2/3"
      />

      <!-- Preview Panel -->
      <CvPreview
        :personalInfo="cvData.personalInfo"
        :sections="cvData.sections"
        class="w-full lg:w-1/3 lg:sticky top-8 h-fit"
        ref="cvPreviewRef"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, provide } from "vue";
import CvEditor from "./components/CvEditor.vue";
import CvPreview from "./components/CvPreview.vue";
import { useUUID } from "./composables/useUUID";

const { generateUUID } = useUUID();
const cvPreviewRef = ref(null); // Ref for accessing preview DOM for PDF

// --- Central CV State ---
const cvData = reactive({
  personalInfo: {
    fullName: "Alice Wonderland",
    jobTitle: "Lead Dream Interpreter",
    email: "alice@example.com",
    phone: "+1 (555) 123-4567",
    address: "12 Rabbit Hole Lane, Looking Glass City",
    summary:
      "Highly imaginative professional with extensive experience navigating surreal landscapes and interpreting complex narratives. Proven ability to maintain composure during unexpected transformations and logical paradoxes.",
  },
  sections: [
    {
      id: generateUUID(),
      type: "workExperience",
      title: "Work Experience",
      items: [
        {
          id: generateUUID(),
          jobTitle: "Tea Party Host",
          company: "Mad Hatter Inc.",
          date: "2020 - Present",
          description:
            "Organized and hosted daily high-energy tea parties. Managed unpredictable guests and ensured continuous supply of refreshments. Developed innovative solutions for time loop issues.",
        },
        {
          id: generateUUID(),
          jobTitle: "Croquet Player",
          company: "Queen of Hearts Royal Court",
          date: "2018 - 2020",
          description:
            "Played croquet using flamingo mallets and hedgehog balls. Navigated complex court politics and arbitrary rule changes. Occasionally avoided decapitation.",
        },
      ],
    },
    {
      id: generateUUID(),
      type: "education",
      title: "Education",
      items: [
        {
          id: generateUUID(),
          degree: "Advanced Nonsense",
          institution: "Wonderland Academy",
          date: "Graduated 2018",
          description:
            'Focus on logic puzzles, riddles, and dream analysis. Thesis: "The Fluidity of Reality in Subterranean Environments".',
        },
      ],
    },
    {
      id: generateUUID(),
      type: "skills",
      title: "Skills",
      items: [
        { id: generateUUID(), name: "Problem Solving" },
        { id: generateUUID(), name: "Adaptability" },
        { id: generateUUID(), name: "Size Alteration" },
        { id: generateUUID(), name: "Riddle Comprehension" },
        { id: generateUUID(), name: "Flamingo Handling" },
        { id: generateUUID(), name: "Existential Querying" },
      ],
    },
  ],
});

// --- Section Management Logic ---
const getSectionTemplate = (type) => {
  const common = { id: generateUUID(), type, items: [] };
  switch (type) {
    case "workExperience":
      return {
        ...common,
        title: "Work Experience",
        items: [
          {
            id: generateUUID(),
            jobTitle: "",
            company: "",
            date: "",
            description: "",
          },
        ],
      };
    case "education":
      return {
        ...common,
        title: "Education",
        items: [
          {
            id: generateUUID(),
            degree: "",
            institution: "",
            date: "",
            description: "",
          },
        ],
      };
    case "skills":
      return {
        ...common,
        title: "Skills",
        items: [{ id: generateUUID(), name: "" }],
      };
    case "projects":
      return {
        ...common,
        title: "Projects",
        items: [
          { id: generateUUID(), name: "", link: "", date: "", description: "" },
        ],
      };
    case "languages":
      return {
        ...common,
        title: "Languages",
        items: [{ id: generateUUID(), name: "", level: "" }],
      };
    case "certifications":
      return {
        ...common,
        title: "Certifications",
        items: [
          {
            id: generateUUID(),
            name: "",
            issuer: "",
            date: "",
            credentialId: "",
          },
        ],
      };
    case "custom":
      return {
        ...common,
        title: "Custom Section",
        isTitleEditable: true,
        items: [{ id: generateUUID(), title: "", description: "" }],
      }; // Example custom structure
    default:
      console.warn(`Unknown section type requested: ${type}`);
      return null;
  }
};

const addSection = (sectionType) => {
  const newSection = getSectionTemplate(sectionType);
  if (newSection) {
    cvData.sections.push(newSection);
  }
};

const deleteSection = (sectionId) => {
  const index = cvData.sections.findIndex(
    (section) => section.id === sectionId
  );
  if (index !== -1) {
    cvData.sections.splice(index, 1);
  }
};

const moveSection = (sectionId, direction) => {
  const index = cvData.sections.findIndex((s) => s.id === sectionId);
  if (index === -1) return;

  const newIndex = index + direction; // direction is -1 for up, 1 for down
  if (newIndex < 0 || newIndex >= cvData.sections.length) return; // Check bounds

  // Simple swap using splice
  const sectionToMove = cvData.sections.splice(index, 1)[0]; // Remove from old position
  cvData.sections.splice(newIndex, 0, sectionToMove); // Insert at new position
};

// --- Provide UUID generator and PDF function to children ---
provide("generateUUID", generateUUID);
provide("getPreviewElement", () => cvPreviewRef.value?.getPreviewDomElement());
</script>

<style scoped>
/* Add any App-specific styles here if needed */
</style>
