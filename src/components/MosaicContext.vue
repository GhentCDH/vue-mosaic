<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import {
  MosaicContextActionsProviderKey,
  MosaicDraggingSourceItemKey,
  MosaicDraggingSourcePathKey,
  MosaicIsDraggingKey,
} from "../symbols/Mosaic";
import { MosaicContextActionsProviders } from "../types/Mosaic";

const isDragging = ref(false);
provide(MosaicIsDraggingKey, isDragging);

const draggingSourcePath = ref([]);
provide(MosaicDraggingSourcePathKey, draggingSourcePath);

const draggingSourceItem = ref();
provide(MosaicDraggingSourceItemKey, draggingSourceItem);

const contextActionProviders: MosaicContextActionsProviders = {
  // @ts-ignore
  expand(path, percentage) {
    throw new Error(`[MosaicContext] expand not implemented in Mosaic`);
  },
  getRoot() {
    throw new Error(`[MosaicContext] getRoot not implemented in Mosaic`);
  },
  // @ts-ignore
  hide(path) {
    throw new Error(`[MosaicContext] hide not implemented in Mosaic`);
  },
  // @ts-ignore
  remove(path) {
    throw new Error(`[MosaicContext] remove not implemented in Mosaic`);
  },
  // @ts-ignore
  replaceWith(path, node) {
    throw new Error(`[MosaicContext] replaceWith not implemented in Mosaic`);
  },
  // @ts-ignore
  updateTree(updates, suppressOnRelease, refreshPortals) {
    throw new Error(`[MosaicContext] updateTree not implemented in Mosaic`);
  },
  handleAddPanel() {
    throw new Error(`[MosaicContext] handleAddPanel not implemented in Mosaic`);
  },
};
provide(MosaicContextActionsProviderKey, contextActionProviders);
</script>
