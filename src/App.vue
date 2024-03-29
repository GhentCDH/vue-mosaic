<template>
  <div class="bg-gray-900 h-screen text-white flex flex-col">
    <div class="p-4 flex-1 bg-gray-800 flex gap-2">
      <MosaicContext>
        <MosaicDropzone :items="items" @add="handleAddNew">
          <template #item="{ item }">
            {{ item.name }}
          </template>
        </MosaicDropzone>

        <Mosaic v-model:root="root" @release="handleSaveChange">
          <template #item="props">
            <!-- <Hello v-if="props.node === 'something-the-first'" :id="'1'" />
            <World :label="'Jiraya'" /> -->
            {{ props }}
          </template>
        </Mosaic>
      </MosaicContext>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Mosaic from "./components/Mosaic.vue";
import MosaicContext from "./components/MosaicContext.vue";
import MosaicDropzone from "./components/MosaicDropzone.vue";
import { MosaicNode } from "./types/Mosaic";

const items = ref<
  {
    id: string;
    name: string;
  }[]
>([]);

const root = ref<MosaicNode>({
  direction: "row",
  first: crypto.randomUUID(),
  second: {
    direction: "column",
    first: {
      direction: "row",
      first: crypto.randomUUID(),
      second: crypto.randomUUID(),
      splitPercentage: 70,
    },
    second: crypto.randomUUID(),
  },
  splitPercentage: 40,
});

const handleSaveChange = (updatedNode: MosaicNode | null) => {
  // Handle update on save
  console.log("update", updatedNode);
};

const handleAddNew = () => {
  items.value.push({
    id: crypto.randomUUID(),
    name: "New from sidepanel",
  });
};
</script>
