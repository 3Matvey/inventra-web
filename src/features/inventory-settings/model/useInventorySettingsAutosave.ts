import { computed, onBeforeUnmount, ref, watch, type Ref } from "vue";
import { getInventoryDetails, updateInventorySettings } from "@/entities/inventory/api";
import type { InventoryDetailsDto } from "@/entities/inventory/types";

export type InventorySettingsDraft = {
  title: string;
  categoryId: string;
  descriptionMarkdown: string;
  imageUrl: string | null;
  imagePublicId: string | null;
};

const autosaveDelayMs = 8000;

export function useInventorySettingsAutosave(
  inventory: Ref<InventoryDetailsDto>,
  draft: InventorySettingsDraft,
  onSaved: (inventory: InventoryDetailsDto) => void
) {
  const status = ref<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const errorMessage = ref<string | null>(null);
  let timer: number | undefined;

  const canSave = computed(() => Boolean(draft.title.trim() && draft.categoryId));

  function clearTimer() {
    if (timer) window.clearTimeout(timer);
    timer = undefined;
  }

  function markDirty() {
    if (status.value === "saving") return;
    status.value = "dirty";
    clearTimer();
    timer = window.setTimeout(() => void save(), autosaveDelayMs);
  }

  async function save() {
    if (!canSave.value) return;
    clearTimer();
    status.value = "saving";
    errorMessage.value = null;

    try {
      await updateInventorySettings(inventory.value.id, {
        expectedVersion: inventory.value.version,
        categoryId: draft.categoryId,
        title: draft.title.trim(),
        descriptionMarkdown: draft.descriptionMarkdown.trim() || null,
        imageUrl: draft.imageUrl,
        imagePublicId: draft.imagePublicId
      });

      const nextInventory = await getInventoryDetails(inventory.value.id);
      onSaved(nextInventory);
      status.value = "saved";
    } catch (error) {
      status.value = "error";
      errorMessage.value = error instanceof Error ? error.message : "Failed to save settings.";
    }
  }

  watch(draft, markDirty, { deep: true });
  onBeforeUnmount(clearTimer);

  return {
    status,
    errorMessage,
    canSave,
    save,
    markDirty
  };
}
