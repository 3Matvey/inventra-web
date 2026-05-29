import { defineStore } from "pinia";
import { ref } from "vue";
import type { Guid } from "@/shared/types/common";

type SupportTicketContext = {
  inventoryId: Guid | null;
  inventoryTitle: string | null;
};

export const useSupportTicketStore = defineStore("supportTicket", () => {
  const visible = ref(false);
  const context = ref<SupportTicketContext>({
    inventoryId: null,
    inventoryTitle: null
  });

  function open() {
    visible.value = true;
  }

  function close() {
    visible.value = false;
  }

  function setInventoryContext(inventoryId: Guid | null, inventoryTitle: string | null = null) {
    context.value = {
      inventoryId,
      inventoryTitle
    };
  }

  function clearContext() {
    setInventoryContext(null, null);
  }

  return {
    visible,
    context,
    open,
    close,
    setInventoryContext,
    clearContext
  };
});
