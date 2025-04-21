<template>
  <Transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <!-- Make modal content part of the transition -->
      <div
        class="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl modal-content"
      >
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-semibold text-gray-800">Add New Section</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <button
            v-for="option in sectionOptions"
            :key="option.type"
            @click="selectSection(option.type)"
            class="add-section-option px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-left w-full text-sm font-medium flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            <i
              :class="['fas', option.icon, 'w-5 text-center text-indigo-500']"
            ></i>
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  show: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "select-section"]);

const sectionOptions = ref([
  { type: "workExperience", label: "Work Experience", icon: "fa-briefcase" },
  { type: "education", label: "Education", icon: "fa-graduation-cap" },
  { type: "skills", label: "Skills", icon: "fa-star" }, // Using fa-star for skills
  { type: "projects", label: "Projects", icon: "fa-lightbulb" }, // Using fa-lightbulb
  { type: "languages", label: "Languages", icon: "fa-language" },
  { type: "certifications", label: "Certifications", icon: "fa-certificate" },
  { type: "custom", label: "Custom Section", icon: "fa-plus-circle" },
]);

const closeModal = () => {
  emit("close");
};

const selectSection = (sectionType) => {
  emit("select-section", sectionType);
};
</script>

<style scoped>
/* Styles for modal-fade transition are in main.css */
</style>
