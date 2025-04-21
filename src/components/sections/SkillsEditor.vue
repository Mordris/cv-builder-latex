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
      <p class="text-sm text-gray-500 mb-3">
        Enter skills one by one. Press Enter or click "Add Skill" to add more.
      </p>
      <div class="flex flex-wrap gap-3 items-center">
        <div
          v-for="(item, index) in localSectionData.items"
          :key="item.id"
          class="relative"
        >
          <input
            type="text"
            :value="item.name"
            @input="updateItem(index, 'name', $event.target.value)"
            @keydown.enter.prevent="addItemOnEnter($event, index)"
            @blur="removeItemIfEmpty(index)"
            :ref="
              (el) => {
                if (el) itemRefs[item.id] = el;
              }
            "
            placeholder="e.g., JavaScript"
            class="skill-input pl-3 pr-6 py-1 bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-sm shadow-sm"
          />
          <button
            @click="removeItem(index)"
            v-if="localSectionData.items.length > 0"
            class="remove-skill absolute top-1/2 right-1 transform -translate-y-1/2 text-indigo-400 hover:text-red-500 text-xs p-1 rounded-full hover:bg-red-50 transition-colors"
            title="Remove Skill"
          >
            <i class="fas fa-times fa-fw"></i>
          </button>
        </div>
        <button
          @click="addItem"
          class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition text-sm font-medium border border-indigo-200 shadow-sm"
        >
          <i class="fas fa-plus mr-1 text-xs"></i> Add Skill
        </button>
      </div>
    </template>
  </BaseSectionWrapper>
</template>

<script setup>
import { ref, computed, inject, watch, nextTick } from "vue";
import BaseSectionWrapper from "./BaseSectionWrapper.vue";

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
const itemRefs = ref({}); // To focus new items

// Ensure there's always at least one item if the array is empty initially or after deletion
const ensureOneItem = () => {
  if (localSectionData.value.items.length === 0) {
    localSectionData.value.items.push({ id: generateUUID(), name: "" });
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    localSectionData.value = JSON.parse(JSON.stringify(newValue));
    ensureOneItem(); // Ensure one item exists when loaded
  },
  { deep: true, immediate: true }
); // Immediate ensures it runs on initial load

const updateItem = (index, key, value) => {
  localSectionData.value.items[index][key] = value;
  // Don't emit immediately on input, wait for blur or Enter maybe?
  // Or emit, which is simpler:
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};

const addItem = async () => {
  const newItem = { id: generateUUID(), name: "" };
  localSectionData.value.items.push(newItem);
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));

  // Focus the new input field after the DOM updates
  await nextTick();
  const newRef = itemRefs.value[newItem.id];
  if (newRef) {
    newRef.focus();
  }
};

// Add new item when Enter is pressed in an existing input
const addItemOnEnter = (event, index) => {
  if (event.target.value.trim() !== "") {
    addItem();
  }
};

// Remove item if it's empty when the user clicks away (on blur)
// Only remove if it's not the very last item in the list
const removeItemIfEmpty = (index) => {
  const item = localSectionData.value.items[index];
  if (
    item &&
    item.name.trim() === "" &&
    localSectionData.value.items.length > 1
  ) {
    removeItem(index);
  }
};

const removeItem = (index) => {
  localSectionData.value.items.splice(index, 1);
  ensureOneItem(); // Ensure at least one item remains
  emit("update:modelValue", JSON.parse(JSON.stringify(localSectionData.value)));
};
</script>

<style scoped>
.skill-input {
  min-width: 80px;
}
.remove-skill {
  opacity: 0.3;
  transition: opacity 0.2s;
}
.relative:hover .remove-skill {
  opacity: 1;
}
</style>
