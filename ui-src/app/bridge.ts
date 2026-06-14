import type { BridgeState, UiActionPayload } from "./types";

const STATE_EVENT = "txzz:state";
const ACTION_EVENT = "txzz:ui-action";
const READY_EVENT = "txzz:ui-ready";

declare global {
  interface Window {
    __txzzBridgeState?: BridgeState;
  }
}

export function readBridgeState(): BridgeState {
  return window.__txzzBridgeState || {};
}

export function listenBridgeState(callback: (state: BridgeState) => void) {
  const handler = (event: Event) => {
    callback((event as CustomEvent<BridgeState>).detail || readBridgeState());
  };
  window.addEventListener(STATE_EVENT, handler);
  callback(readBridgeState());

  return () => {
    window.removeEventListener(STATE_EVENT, handler);
  };
}

export function sendUiAction(action: string, payload: Record<string, unknown> = {}) {
  const detail: UiActionPayload = { action, payload };
  window.dispatchEvent(new CustomEvent(ACTION_EVENT, { detail }));
}

export function notifyUiReady() {
  window.dispatchEvent(new CustomEvent(READY_EVENT));
}
