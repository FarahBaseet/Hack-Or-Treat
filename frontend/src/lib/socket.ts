// WebSocket client for the caregiver page. Reconnects automatically.

import { API_URL, getAuthToken, type Alert } from "./api";

type LostMessage = { type: "lost"; alert: Alert };

type Handlers = {
  onAlert: (alert: Alert) => void;
  /** Called on every (re)connect, so the page can re-fetch alerts it may have missed. */
  onOpen?: () => void;
  onStatus?: (connected: boolean) => void;
};

/** Connect to WS /ws/caregiver. Returns a function that closes the connection for good. */
export function connectCaregiver({ onAlert, onOpen, onStatus }: Handlers): () => void {
  const url = API_URL.replace(/^http/, "ws") + "/ws/caregiver";
  let socket: WebSocket | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let closed = false;

  const open = async () => {
    // The backend needs the sign-in token; WebSockets can't send headers, so it goes in the URL.
    const token = await getAuthToken();
    if (closed) return;
    socket = new WebSocket(token ? `${url}?token=${encodeURIComponent(token)}` : url);
    socket.onopen = () => {
      onStatus?.(true);
      onOpen?.();
    };
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as LostMessage;
        if (msg.type === "lost") onAlert(msg.alert);
      } catch {
        // ignore malformed messages
      }
    };
    socket.onclose = () => {
      onStatus?.(false);
      if (!closed) retryTimer = setTimeout(() => void open(), 3000);
    };
  };

  void open();

  return () => {
    closed = true;
    clearTimeout(retryTimer);
    socket?.close();
  };
}