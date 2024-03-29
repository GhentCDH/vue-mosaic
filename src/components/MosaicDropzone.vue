<template>
  <div class="bg-gray-700 w-64 h-full p-1 flex flex-col gap-2 relative">
    <div
      class="hover:bg-slate-500 p-1 rounded-md overflow-hidden cursor-pointer hover:after:content-['+'] after:font-bold flex items-center gap-4 hover:underline"
      @click="handleAddNew"
    >
      Add new
    </div>
    <div>
      <MosaicDraggable v-for="item in items" :key="item.id" :title="item.name" :id="item.id" @delete="handleDelete(item)">
        <slot name="item" :item="item"> </slot>
      </MosaicDraggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import MosaicDraggable from "./MosaicDraggable.vue";

const props = defineProps<{
  items: {
    id: string;
    name: string;
  }[];
}>();

const emit = defineEmits<{
  (event: "add"): void;
}>();

const handleAddNew = () => {
  emit("add");
};

const handleDelete = (item: (typeof props.items)[number]) => {
  const foundIndex = props.items.findIndex((propItem) => propItem.id === item.id);

  if (foundIndex === -1) return;

  props.items.splice(foundIndex, 1);
};
</script>
