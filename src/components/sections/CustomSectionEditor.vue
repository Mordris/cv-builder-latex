<template>
  <BaseSectionWrapper
    :is-first="isFirst"
    :is-last="isLast"
    @delete-section="$emit('delete-section')"
    @move-section="(direction) => $emit('move-section', direction)"
  >
    <template #header>
      <!-- Editable Section Title -->
      <input
        type="text"
        :value="localSectionData.title"
        @input="updateTitle($event.target.value)"
        @blur="updateTitle($event.target.value.trim())"
        placeholder="Custom Section Title"
        class="text-xl font-medium text-gray-700 border-b-2 border-transparent focus:border-indigo-300 outline-none bg-transparent w-full hover:border-gray-300 transition-colors"
      />
    </template>

    <template #content>
      <div class="space-y-5">
        <!-- Loop through items -->
        <div
          v-for="(item, index) in localSectionData.items"
          :key="item.id"
          class="p-4 border rounded-md bg-white relative shadow-sm"
        >
          <button
            @click="removeItem(index)"
            v-if="localSectionData.items.length > 1"
            class="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-xs p-1 rounded-full hover:bg-red-50 transition-colors"
            title="Remove Custom Entry"
          >
            <i class="fas fa-times fa-fw text-base"></i>
          </button>
          <div class="grid grid-cols-1 gap-4">
            <!-- Default Custom Item Structure: Title and Description -->
            <InputField
              label="Entry Title (Optional)"
              :modelValue="item.title"
              @update:modelValue="updateItem(index, 'title', $event)"
              placeholder="e.g., Volunteering Experience"
            />
            <TextareaField
              label="Description / Details"
              :modelValue="item.description"
              @update:modelValue="updateItem(index, 'description', $event)"
              placeholder="Add relevant details for this entry..."
              rows="3"
            />
          </div>
        </div>
      </div>
      <!-- Add Item Button -->
      <button
        @click="addItem"
        class="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm font-medium"
      >
        <i class="fas fa-plus mr-1"></i> Add Entry
      </button>
    </template>
  </BaseSectionWrapper>
</template>

<script setup>
import { ref, inject, watch } from "vue";
import BaseSectionWrapper from "./BaseSectionWrapper.vue";
import InputField from "../controls/InputField.vue";
import TextareaField from "../controls/TextareaField.vue";

const props = defineProps({
  modelValue: { type: Object, required: true }, // Section data (including title and items)
  isFirst: Boolean,
  isLast: Boolean,
});
const emit = defineEmits([
  "update:modelValue",
  "delete-section",
  "move-section",
]);
const generateUUID = inject("generateUUID");

// Local reactive copy of the section data
const localSectionData = ref(JSON.parse(JSON.stringify(props.modelValue)));

// Watch for external changes to the modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    localSectionData.value = JSON.parse(JSON.stringify(newValue));
  },
  { deep: true }
);

// --- Methods ---

// Update the main title of the custom section
const updateTitle = (newTitle) => {
  // Avoid emitting on every keystroke if desired, maybe only on blur?
  // For simplicity, emitting on input is fine here.
  localSectionData.value.title = newTitle;
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};

// Update a specific field within a specific item
const updateItem = (index, key, value) => {
  if (localSectionData.value.items[index]) {
    localSectionData.value.items[index][key] = value;
    emit(
      "update:modelValue",
      JSON.parse(JSON.stringify(localSectionData.value))
    );
  }
};

// Add a new blank item to the custom section
const addItem = () => {
  localSectionData.value.items.push({
    id: generateUUID(),
    title: "", // Default structure for custom item
    description: "",
  });
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};

// Remove an item from the custom section
const removeItem = (index) => {
  // Prevent removing the last item to avoid an empty state if undesired
  if (localSectionData.value.items.length <= 1) {
    // Optionally clear the fields instead of removing
    // localSectionData.value.items[index] = { id: generateUUID(), title: '', description: '' };
    // Or just do nothing
    return;
  }
  localSectionData.value.items.splice(index, 1);
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};
</script>

<style scoped>
/* Style the editable title input to blend in */
input[type="text"].text-xl {
  padding-bottom: 2px; /* Align baseline */
  line-height: 1.25; /* Match h3 line-height roughly */
}
input[type="text"].text-xl::placeholder {
  color: #9ca3af; /* gray-400 */
  font-weight: 500; /* medium */
}
</style>
