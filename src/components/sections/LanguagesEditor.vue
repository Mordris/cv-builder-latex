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
      <div class="space-y-4">
        <div
          v-for="(item, index) in localSectionData.items"
          :key="item.id"
          class="flex items-center gap-3 bg-white p-3 border rounded-md shadow-sm relative"
        >
          <div class="flex-grow grid grid-cols-2 gap-3">
            <InputField
              label="Language"
              :modelValue="item.name"
              @update:modelValue="updateItem(index, 'name', $event)"
              placeholder="e.g., English"
              :show-label="index === 0"
            />
            <div>
              <label
                v-if="index === 0"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Proficiency</label
              >
              <select
                :value="item.level"
                @change="updateItem(index, 'level', $event.target.value)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Level</option>
                <option value="Native">Native / Bilingual</option>
                <option value="Fluent">Fluent</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Basic">Basic / Conversational</option>
              </select>
            </div>
          </div>
          <button
            @click="removeItem(index)"
            v-if="localSectionData.items.length > 1"
            class="text-gray-300 hover:text-red-500 text-xs p-1 rounded-full hover:bg-red-50 transition-colors flex-shrink-0 ml-1"
            title="Remove Language"
          >
            <i class="fas fa-times fa-fw text-base"></i>
          </button>
        </div>
      </div>
      <button
        @click="addItem"
        class="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm font-medium"
      >
        <i class="fas fa-plus mr-1"></i> Add Language
      </button>
    </template>
  </BaseSectionWrapper>
</template>

<script setup>
import { ref, computed, inject, watch } from "vue";
import BaseSectionWrapper from "./BaseSectionWrapper.vue";
import InputField from "../controls/InputField.vue"; // Reusing InputField

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
    level: "",
  });
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};

const removeItem = (index) => {
  if (localSectionData.value.items.length <= 1) return;
  localSectionData.value.items.splice(index, 1);
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};
</script>

<style scoped>
/* Add specific styles if needed */
</style>
