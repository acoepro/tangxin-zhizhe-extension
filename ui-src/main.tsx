import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

const HOST_ID = "txzz-candy-ui-root";
const ROOT_ID = "txzz-candy-ui";

function createHost() {
  const existed = document.getElementById(HOST_ID);
  if (existed?.shadowRoot) {
    return existed.shadowRoot;
  }

  const host = existed || document.createElement("div");
  host.id = HOST_ID;
  Object.assign(host.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none"
  });
  if (!existed) document.documentElement.appendChild(host);

  const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
  const styleHref = chrome.runtime.getURL("dist-ui/txzz-ui.css");

  if (!shadow.querySelector(`link[href="${styleHref}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = styleHref;
    shadow.appendChild(link);
  }

  let root = shadow.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = ROOT_ID;
    shadow.appendChild(root);
  }

  return shadow;
}

const shadow = createHost();
const rootElement = shadow.getElementById(ROOT_ID);

if (rootElement && !rootElement.dataset.mounted) {
  rootElement.dataset.mounted = "1";
  document.documentElement.classList.add("txzz-candy-ui-ready");
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
