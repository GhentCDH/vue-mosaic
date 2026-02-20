<template>
  <div class="bg-gray-900 h-screen text-white flex flex-col">
    <div class="p-4 flex-1 bg-gray-800 flex gap-2">
      <MosaicContext>
        <MosaicCollection :items="items" @add="handleAddNew">
          <template #item="{ item }">
            {{ item.title }}
          </template>
        </MosaicCollection>

        <Mosaic v-model:root="root" @release="handleSaveChange">
          <template #item="props">
            <Hello v-if="props.node.id === 'SHEESH'" :id="'1'" />
            <World v-else-if="props.node.id === 'yes'" :label="'Jiraya'" />
            {{ props }}
          </template>
        </Mosaic>
      </MosaicContext>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Mosaic from "../src/components/Mosaic.vue";
import MosaicContext from "../src/components/MosaicContext.vue";
import MosaicCollection from "../src/components/MosaicCollection.vue";
import { MosaicNode } from "../src";
import Hello from "./components/Hello.vue";
import World from "./components/World.vue";

const items = ref<
  {
    id: string;
    title: string;
  }[]
>([]);

const root = ref<MosaicNode>({
  direction: "row",
  first: { id: "SHEESH", title: "1" },
  second: {
    direction: "column",
    first: {
      direction: "row",
      first: { id: "yes", title: "2" },
      second: { id: crypto.randomUUID(), title: "3" },
      splitPercentage: 70,
    },
    second: { id: crypto.randomUUID(), title: "4" },
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
    title: "New from sidepanel",
  });
};
</script>
