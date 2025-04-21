<template>
  <div
    class="p-5 bg-slate-50 rounded-lg border border-slate-200 relative section-wrapper shadow-sm"
  >
    <div class="flex justify-between items-start mb-4 gap-4">
      <!-- Slot for the section title/header content -->
      <div class="flex-grow">
        <slot name="header">
          <!-- Default Title (should be overridden by parent) -->
          <h3 class="text-xl font-medium text-gray-700">Section Title</h3>
        </slot>
      </div>
      <!-- Controls -->
      <div class="flex gap-1 section-controls flex-shrink-0 mt-1">
        <button
          @click.stop="$emit('move-section', -1)"
          :disabled="isFirst"
          class="px-2 py-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          title="Move Up"
        >
          <i class="fas fa-arrow-up fa-fw"></i>
        </button>
        <button
          @click.stop="$emit('move-section', 1)"
          :disabled="isLast"
          class="px-2 py-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          title="Move Down"
        >
          <i class="fas fa-arrow-down fa-fw"></i>
        </button>
        <button
          @click.stop="$emit('delete-section')"
          class="px-2 py-1 text-gray-400 hover:text-red-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-red-300"
          title="Delete Section"
        >
          <i class="fas fa-trash fa-fw"></i>
        </button>
      </div>
    </div>
    <!-- Slot for the main section content/form -->
    <div class="section-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
});
// Emits are automatically passed through from the component usage in CvEditor
defineEmits(["delete-section", "move-section"]);
</script>

<style scoped>
/* Optionally hide controls until hover for cleaner look */
.section-wrapper .section-controls {
  opacity: 0; /* Hidden by default */
  transition: opacity 0.2s ease-in-out;
}
.section-wrapper:hover .section-controls {
  opacity: 1; /* Show on hover */
}
/* Ensure controls are visible when focused */
.section-wrapper .section-controls button:focus {
  opacity: 1;
}
</style>
