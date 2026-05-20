import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { onBeforeUnmount, ref } from "vue";
import { appConfig } from "@/shared/config/appConfig";
import type { InventoryCommentDto } from "../types";

function buildHubUrl() {
  return `${appConfig.apiBaseUrl}/hubs/inventory-discussion`;
}

export function useInventoryDiscussionHub(
  inventoryId: string,
  onCommentAdded: (comment: InventoryCommentDto) => void
) {
  const connected = ref(false);
  const errorMessage = ref<string | null>(null);

  const connection = new HubConnectionBuilder()
    .withUrl(buildHubUrl(), { withCredentials: true })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("commentAdded", onCommentAdded);
  connection.onreconnected(() => {
    connected.value = true;
    void join();
  });
  connection.onreconnecting(() => {
    connected.value = false;
  });
  connection.onclose(() => {
    connected.value = false;
  });

  async function join() {
    if (connection.state === HubConnectionState.Connected) {
      await connection.invoke("JoinInventoryDiscussion", inventoryId);
    }
  }

  async function start() {
    try {
      await connection.start();
      connected.value = true;
      await join();
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Failed to connect discussion.";
    }
  }

  async function stop() {
    if (connection.state === HubConnectionState.Connected) {
      await connection.invoke("LeaveInventoryDiscussion", inventoryId);
    }

    await connection.stop();
  }

  onBeforeUnmount(() => {
    void stop();
  });

  return {
    connected,
    errorMessage,
    start,
    stop
  };
}
