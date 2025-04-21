<template>
  <BaseSectionWrapper
    :is-first="isFirst"
    :is-last="isLast"
    @delete-section="$emit('delete-section')"
    @move-section="(direction) => $emit('move-section', direction)"
  >
    <template #header>
      <h3 class="text-xl font-medium text-gray-700">
        {{ localSectionData.title }}
      </h3>
    </template>

    <template #content>
      <div class="space-y-5">
        <div
          v-for="(item, index) in localSectionData.items"
          :key="item.id"
          class="p-4 border rounded-md bg-white relative shadow-sm"
        >
          <button
            @click="removeItem(index)"
            v-if="localSectionData.items.length > 1"
            class="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-xs p-1 rounded-full hover:bg-red-50 transition-colors"
            title="Remove Experience Entry"
          >
            <i class="fas fa-times fa-fw text-base"></i>
          </button>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Job Title"
              :modelValue="item.jobTitle"
              @update:modelValue="updateItem(index, 'jobTitle', $event)"
              placeholder="e.g., Senior Developer"
            />
            <InputField
              label="Company"
              :modelValue="item.company"
              @update:modelValue="updateItem(index, 'company', $event)"
              placeholder="e.g., Awesome Tech Inc."
            />
            <InputField
              label="Date Range"
              :modelValue="item.date"
              @update:modelValue="updateItem(index, 'date', $event)"
              placeholder="e.g., Jan 2020 - Present or 2019-2021"
            />
            <!-- Empty div for grid layout consistency if needed, or span description -->
            <div class="hidden md:block"></div>
            <TextareaField
              label="Description / Achievements"
              :modelValue="item.description"
              @update:modelValue="updateItem(index, 'description', $event)"
              placeholder="Describe responsibilities, key projects, and measurable achievements (e.g., Increased performance by 15%)"
              rows="4"
              class="md:col-span-2"
            />
          </div>
        </div>
      </div>
      <button
        @click="addItem"
        class="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm font-medium"
      >
        <i class="fas fa-plus mr-1"></i> Add Experience
      </button>
    </template>
  </BaseSectionWrapper>
</template>

<script setup>
import { ref, computed, inject, watch } from "vue";
import BaseSectionWrapper from "./BaseSectionWrapper.vue";
import InputField from "../controls/InputField.vue";
import TextareaField from "../controls/TextareaField.vue";

const props = defineProps({
  modelValue: { type: Object, required: true }, // The section data object from parent
  isFirst: Boolean,
  isLast: Boolean,
});
const emit = defineEmits([
  "update:modelValue",
  "delete-section",
  "move-section",
]);

const generateUUID = inject("generateUUID");

// Local copy to prevent direct mutation of prop
const localSectionData = ref(JSON.parse(JSON.stringify(props.modelValue)));

// Watch for prop changes to update local copy (e.g., if loaded from storage later)
watch(
  () => props.modelValue,
  (newValue) => {
    localSectionData.value = JSON.parse(JSON.stringify(newValue));
  },
  { deep: true }
);

const updateItem = (index, key, value) => {
  localSectionData.value.items[index][key] = value;
  // Emit the entire updated section data object
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};

const addItem = () => {
  localSectionData.value.items.push({
    id: generateUUID(),
    jobTitle: "",
    company: "",
    date: "",
    description: "",
  });
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};

const removeItem = (index) => {
  if (localSectionData.value.items.length <= 1) return; // Don't remove the last item
  localSectionData.value.items.splice(index, 1);
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};
</script>
