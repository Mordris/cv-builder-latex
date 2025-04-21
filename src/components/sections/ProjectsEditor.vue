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
            title="Remove Project Entry"
          >
            <i class="fas fa-times fa-fw text-base"></i>
          </button>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Project Name"
              :modelValue="item.name"
              @update:modelValue="updateItem(index, 'name', $event)"
              placeholder="e.g., Personal Portfolio Website"
            />
            <InputField
              label="Link (Optional)"
              :modelValue="item.link"
              @update:modelValue="updateItem(index, 'link', $event)"
              placeholder="e.g., github.com/user/repo or project-url.com"
            />
            <InputField
              label="Date (Optional)"
              :modelValue="item.date"
              @update:modelValue="updateItem(index, 'date', $event)"
              placeholder="e.g., 2023"
            />
            <div class="hidden md:block"></div>
            <!-- Spacer -->
            <TextareaField
              label="Description"
              :modelValue="item.description"
              @update:modelValue="updateItem(index, 'description', $event)"
              placeholder="Describe the project, your role, technologies used, and key features or outcomes."
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
        <i class="fas fa-plus mr-1"></i> Add Project
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
  modelValue: { type: Object, required: true },
  isFirst: Boolean,
  isLast: Boolean,
});
const emit = defineEmits([
  "update:modelValue",
  "delete-section",
  "move-section",
]);
const generateUUID = inject("generateUUID");

const localSectionData = ref(JSON.parse(JSON.stringify(props.modelValue)));

watch(
  () => props.modelValue,
  (newValue) => {
    localSectionData.value = JSON.parse(JSON.stringify(newValue));
  },
  { deep: true }
);

const updateItem = (index, key, value) => {
  localSectionData.value.items[index][key] = value;
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};

const addItem = () => {
  localSectionData.value.items.push({
    id: generateUUID(),
    name: "",
    link: "",
    date: "",
    description: "",
  });
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};

const removeItem = (index) => {
  if (localSectionData.value.items.length <= 1) return;
  localSectionData.value.items.splice(index, 1);
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};
</script>
