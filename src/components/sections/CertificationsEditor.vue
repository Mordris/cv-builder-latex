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
            title="Remove Certification Entry"
          >
            <i class="fas fa-times fa-fw text-base"></i>
          </button>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Certification Name"
              :modelValue="item.name"
              @update:modelValue="updateItem(index, 'name', $event)"
              placeholder="e.g., Certified Cloud Practitioner"
            />
            <InputField
              label="Issuing Organization"
              :modelValue="item.issuer"
              @update:modelValue="updateItem(index, 'issuer', $event)"
              placeholder="e.g., Amazon Web Services (AWS)"
            />
            <InputField
              label="Date Earned (Optional)"
              :modelValue="item.date"
              @update:modelValue="updateItem(index, 'date', $event)"
              placeholder="e.g., June 2022"
            />
            <InputField
              label="Credential ID (Optional)"
              :modelValue="item.credentialId"
              @update:modelValue="updateItem(index, 'credentialId', $event)"
              placeholder="e.g., ABC-123-XYZ"
            />
            <!-- Optional: Add a URL field if needed -->
            <!-- <InputField label="Credential URL (Optional)" :modelValue="item.url" @update:modelValue="updateItem(index, 'url', $event)" placeholder="Link to verify credential" class="md:col-span-2"/> -->
          </div>
        </div>
      </div>
      <button
        @click="addItem"
        class="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm font-medium"
      >
        <i class="fas fa-plus mr-1"></i> Add Certification
      </button>
    </template>
  </BaseSectionWrapper>
</template>

<script setup>
import { ref, computed, inject, watch } from "vue";
import BaseSectionWrapper from "./BaseSectionWrapper.vue";
import InputField from "../controls/InputField.vue";

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
    issuer: "",
    date: "",
    credentialId: "",
    // url: '' // If URL field is added
  });
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};

const removeItem = (index) => {
  if (localSectionData.value.items.length <= 1) return;
  localSectionData.value.items.splice(index, 1);
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};
</script>
