<template>
  <div v-if="hasContent">
    <h3 class="preview-section-title">{{ section.title }}</h3>

    <!-- Work Experience -->
    <div v-if="section.type === 'workExperience'" class="space-y-4">
      <div v-for="item in validItems" :key="item.id">
        <div class="flex justify-between items-start mb-0.5 gap-4">
          <div class="flex-grow">
            <h4 class="font-semibold text-gray-900">{{ item.jobTitle }}</h4>
            <p v-if="item.company" class="text-gray-600">{{ item.company }}</p>
          </div>
          <p
            v-if="item.date"
            class="text-gray-500 text-xs flex-shrink-0 text-right whitespace-nowrap"
          >
            {{ item.date }}
          </p>
        </div>
        <p
          v-if="item.description"
          class="text-gray-700 mt-1 whitespace-pre-line"
        >
          {{ item.description }}
        </p>
      </div>
    </div>

    <!-- Education -->
    <div v-else-if="section.type === 'education'" class="space-y-4">
      <div v-for="item in validItems" :key="item.id">
        <div class="flex justify-between items-start mb-0.5 gap-4">
          <div class="flex-grow">
            <h4 class="font-semibold text-gray-900">{{ item.degree }}</h4>
            <p v-if="item.institution" class="text-gray-600">
              {{ item.institution }}
            </p>
          </div>
          <p
            v-if="item.date"
            class="text-gray-500 text-xs flex-shrink-0 text-right whitespace-nowrap"
          >
            {{ item.date }}
          </p>
        </div>
        <p
          v-if="item.description"
          class="text-gray-700 mt-1 whitespace-pre-line"
        >
          {{ item.description }}
        </p>
      </div>
    </div>

    <!-- Skills -->
    <div v-else-if="section.type === 'skills'">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in validItems"
          :key="item.id"
          class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
        >
          {{ item.name }}
        </span>
      </div>
    </div>

    <!-- Projects -->
    <div v-else-if="section.type === 'projects'" class="space-y-4">
      <div v-for="item in validItems" :key="item.id">
        <div class="flex justify-between items-start mb-0.5 gap-4">
          <div class="flex-grow">
            <h4 class="font-semibold text-gray-900">
              <a
                v-if="item.link"
                :href="formatLink(item.link)"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <span>{{ item.name }}</span>
                <i class="fas fa-external-link-alt text-xs opacity-60"></i>
              </a>
              <span v-else>{{ item.name }}</span>
            </h4>
          </div>
          <p
            v-if="item.date"
            class="text-gray-500 text-xs flex-shrink-0 text-right whitespace-nowrap"
          >
            {{ item.date }}
          </p>
        </div>
        <p
          v-if="item.description"
          class="text-gray-700 mt-1 whitespace-pre-line"
        >
          {{ item.description }}
        </p>
      </div>
    </div>

    <!-- Languages -->
    <div v-else-if="section.type === 'languages'">
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <span v-for="item in validItems" :key="item.id" class="text-gray-700">
          {{ item.name }}
          <span v-if="item.level" class="text-gray-500"
            >({{ item.level }})</span
          >
        </span>
      </div>
    </div>

    <!-- Certifications -->
    <div v-else-if="section.type === 'certifications'" class="space-y-4">
      <div v-for="item in validItems" :key="item.id">
        <div class="flex justify-between items-start mb-0.5 gap-4">
          <div class="flex-grow">
            <h4 class="font-semibold text-gray-900">{{ item.name }}</h4>
            <p v-if="item.issuer" class="text-gray-600">{{ item.issuer }}</p>
          </div>
          <p
            v-if="item.date"
            class="text-gray-500 text-xs flex-shrink-0 text-right whitespace-nowrap"
          >
            {{ item.date }}
          </p>
        </div>
        <p v-if="item.credentialId" class="text-gray-500 text-xs mt-1">
          Credential ID: {{ item.credentialId }}
        </p>
      </div>
    </div>

    <!-- Custom Section (Example Structure) -->
    <div v-else-if="section.type === 'custom'" class="space-y-3">
      <div v-for="item in validItems" :key="item.id">
        <h4 v-if="item.title" class="font-semibold text-gray-900 mb-0.5">
          {{ item.title }}
        </h4>
        <p v-if="item.description" class="text-gray-700 whitespace-pre-line">
          {{ item.description }}
        </p>
      </div>
    </div>

    <!-- Fallback for unknown types (won't render if hasContent is false) -->
    <div v-else>
      <!-- Optional: Log error if needed -->
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  section: { type: Object, required: true },
});

// Determine required fields for each section type to consider an item valid
const requiredFieldsMap = {
  workExperience: ["jobTitle", "company"],
  education: ["degree", "institution"],
  skills: ["name"],
  projects: ["name"],
  languages: ["name"],
  certifications: ["name", "issuer"],
  custom: ["title", "description"],
};

// Computed property to get only items that have at least one required field filled
const validItems = computed(() => {
  if (
    !props.section ||
    !props.section.items ||
    !Array.isArray(props.section.items)
  ) {
    return [];
  }
  const requiredFields = requiredFieldsMap[props.section.type] || [];
  if (requiredFields.length === 0 && props.section.type !== "custom") {
    // If no specific fields, require at least one non-empty value? Let's stick to defined fields.
    console.warn(
      `No required fields defined for preview filtering section type: ${props.section.type}`
    );
    // return props.section.items.filter(item => Object.values(item).some(val => String(val).trim() !== '')); // Generic check if needed
    return props.section.items; // Default to showing all if no fields defined
  }
  // For custom type, allow either title OR description
  if (props.section.type === "custom") {
    return props.section.items.filter(
      (item) =>
        (item.title && String(item.title).trim() !== "") ||
        (item.description && String(item.description).trim() !== "")
    );
  }
  // For other types, require at least one of the specified fields
  return props.section.items.filter((item) =>
    requiredFields.some(
      (field) => item[field] && String(item[field]).trim() !== ""
    )
  );
});

// Computed property to determine if the section should be rendered at all
const hasContent = computed(() => {
  return validItems.value.length > 0;
});

// Helper to ensure links have http/https
const formatLink = (link) => {
  if (!link) return "#";
  const trimmedLink = link.trim();
  if (trimmedLink.startsWith("http://") || trimmedLink.startsWith("https://")) {
    return trimmedLink;
  }
  if (trimmedLink.includes("@")) {
    // Basic check for email
    return `mailto:${trimmedLink}`;
  }
  return `https://${trimmedLink}`;
};
</script>

<style scoped>
/* Add component-specific styles if needed */
</style>
