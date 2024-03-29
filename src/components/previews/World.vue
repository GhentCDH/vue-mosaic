<template>
  <div>Hello World!! '{{ label }}'</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
}>();
</script>
