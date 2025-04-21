<template>
  <div>
    <label
      v-if="label && showLabel"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-1"
      >{{ label }}</label
    >
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm disabled:bg-gray-100"
      :required="required"
      :disabled="disabled"
    />
    <!-- Optional: Add slot for errors or hints -->
    <!-- <div v-if="$slots.hint" class="mt-1 text-xs text-gray-500"><slot name="hint"/></div> -->
  </div>
</template>

<script setup>
import { computed, inject } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: "text" },
  placeholder: String,
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: true }, // Control label visibility
  id: String, // Optional explicit ID
});
defineEmits(["update:modelValue"]);

// Generate a unique ID if not provided, useful for label 'for' attribute
const generateUUID = inject(
  "generateUUID",
  () => `input-${Math.random().toString(36).substring(2, 9)}`
); // Provide fallback if not injected
const inputId = computed(() => props.id || generateUUID());
</script>
