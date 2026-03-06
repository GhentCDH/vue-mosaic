<template>
  <div class="mosaic w-full h-full relative overflow-hidden">
    <div class="mosaic-root absolute inset-1">
      <!-- MosaicContent: only renders split handles, no slot needed -->
      <MosaicContent v-if="root" :node="root" :bounding-box="BoundingBox.empty()" :path="[]" />

      <!-- Flat keyed window list — components are never destroyed when tree restructures -->
      <template v-if="root">
        <div
          v-for="leaf in leavesWithBoundingBoxes"
          :key="leaf.item.id"
          class="mosaic-tile absolute m-[3px]"
          :style="{ ...BoundingBox.asStyles(leaf.boundingBox) }"
        >
          <div class="w-full h-full overflow-hidden">
            <MosaicWindow :node="leaf.item" :bounding-box="leaf.boundingBox" :path="leaf.path" :title="leaf.item.title">
              <slot name="item" :node="leaf.item" :bounding-box="leaf.boundingBox" :path="leaf.path"></slot>
            </MosaicWindow>
          </div>
        </div>
      </template>

      <div v-else class="w-full h-full">
        <slot name="empty">
          <div class="h-full relative drop-target" @mouseup="handleDropEmpty">
            <div>No Root</div>

            <div @click="handleAddPanel" class="p-2 bg-gray-500 hover:bg-gray-600 cursor-pointer">Add a new panel</div>
          </div>
        </slot>
      </div>
    </div>
    <Teleport to="body">
      <div
        ref="previewRef"
        class="preview fixed bg-[#4c90f0]/40 border-2 border-[#4c90f0] rounded-md opacity-0 hover:opacity-100 cursor-alias select-none pointer-events-none transition-all"
      ></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ComponentPublicInstance, computed, provide, ref, watch } from "vue";
import { MosaicContextActionsProviderKey, MosaicDraggingSourceItemKey, MosaicIsDraggingKey, MosaicRootActionsKey } from "../symbols/Mosaic";
import { MosaicItem, MosaicNode, MosaicRootActions, MosaicUpdate } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import { injectStrict } from "../utils/InjectStrict";
import { addMosaicNode, getLeavesWithBoundingBoxes } from "../utils/Mosaic";
import { createExpandUpdate, createHideUpdate, createRemoveUpdate, updateTree } from "../utils/MosaicUpdates";
import MosaicContent from "./MosaicContent.vue";
import MosaicWindow from "./MosaicWindow.vue";

const props = defineProps<{
  root: MosaicNode | null;
  newPanelComponent?: InstanceType<ComponentPublicInstance<any>>;
}>();

const emit = defineEmits<{
  (event: "release", node: MosaicNode | null): void;
  (event: "removedItem", node: MosaicNode): void;
  (event: "update:root", node: MosaicNode | null): void;
  (event: "addItem", item: MosaicItem): void;
}>();

const previewRef = ref<HTMLDivElement>();

const leavesWithBoundingBoxes = computed(() => {
  if (!props.root) return [];
  return getLeavesWithBoundingBoxes(props.root);
});

const replaceRoot = (currentNode: MosaicNode | null, suppressOnRelease: boolean = false) => {
  emit("update:root", currentNode);
  if (!suppressOnRelease) {
    emit("release", currentNode);
  }
};

const mosaicSourceItem = injectStrict(MosaicDraggingSourceItemKey);
const handleDropEmpty = () => {
  if (!mosaicIsDragging.value) return;
  if (!mosaicSourceItem.value) return;

  const newRoot = addMosaicNode(props.root, mosaicSourceItem.value);
  replaceRoot(newRoot);
  emit("addItem", mosaicSourceItem.value);
};

const handleAddPanel = () => {
  const newItem = {
    id: crypto.randomUUID(),
    title: "New",
  };
  const newRoot = addMosaicNode(props.root, newItem);
  replaceRoot(newRoot);
  emit("addItem", newItem);
};

const updateTreeFromRoot = (updates: MosaicUpdate[], suppressOnRelease: boolean = false) => {
  const currentNode = props.root || ({} as MosaicNode);

  const updatedRoot = updateTree(currentNode, updates);
  replaceRoot(updatedRoot, suppressOnRelease);
};

const mosaicRootActions: MosaicRootActions = {
  updateTree: updateTreeFromRoot,
  getRoot: () => props.root,
  expand(path, percentage) {
    updateTreeFromRoot([createExpandUpdate(path, percentage || 50)]);
  },
  hide(path) {
    updateTreeFromRoot([createHideUpdate(path)], true);
  },
  remove(path, node) {
    if (path.length === 0) {
      replaceRoot(null, true);
    } else {
      updateTreeFromRoot([createRemoveUpdate(this.getRoot(), path)], true);
    }

    emit("removedItem", node);
  },
  replaceWith(path, node) {
    updateTreeFromRoot([
      {
        path,
        spec: {
          $set: node,
        },
      },
    ]);
  },
};
provide(MosaicRootActionsKey, mosaicRootActions);

const mosaicContextActions = injectStrict(MosaicContextActionsProviderKey);
mosaicContextActions.updateTree = mosaicRootActions.updateTree;
mosaicContextActions.getRoot = mosaicRootActions.getRoot;
mosaicContextActions.expand = mosaicRootActions.expand;
mosaicContextActions.hide = mosaicRootActions.hide;
mosaicContextActions.remove = mosaicRootActions.remove;
mosaicContextActions.replaceWith = mosaicRootActions.replaceWith;
mosaicContextActions.handleAddPanel = handleAddPanel;

const previewPane = (attach: boolean, targetDom?: HTMLElement) => {
  if (!previewRef.value) return;

  if (!attach) {
    previewRef.value.style.opacity = "0";
    return;
  }
  if (targetDom === undefined) {
    return -1;
  }

  // Precalc styles
  const targetRect = targetDom.getBoundingClientRect();
  const previewPos = {
    left: targetRect.left,
    top: targetRect.top,
    width: targetRect.width,
    height: targetRect.height,
  };

  // Update DOM style
  previewRef.value.style.opacity = "1";
  previewRef.value.style.position = "fixed";
  for (const k in previewPos) {
    previewRef.value.style[k as any] = previewPos[k as keyof typeof previewPos] + "px";
  }
};

const mosaicIsDragging = injectStrict(MosaicIsDraggingKey);
watch(
  () => mosaicIsDragging.value,
  () => {
    if (mosaicIsDragging.value) {
      document.addEventListener("mousemove", handleMousemove);
    } else {
      document.removeEventListener("mousemove", handleMousemove);
      previewPane(false);
    }
  }
);

const handleMousemove = (e: MouseEvent) => {
  const targetElement = document.elementFromPoint(e.clientX, e.clientY);

  if (!targetElement) return;

  if (targetElement.classList.contains("drop-target")) {
    previewPane(true, targetElement as HTMLElement);
    return;
  }

  previewPane(false);
};
</script>
