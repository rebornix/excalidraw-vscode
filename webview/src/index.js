import { loadFromBlob } from "@excalidraw/excalidraw";
import React from "react";
import ReactDOM from "react-dom";
import { Base64 } from "js-base64";

import App from "./App";
const vscode = window.acquireVsCodeApi();

async function getInitialData(content, contentType) {
  if (!content) {
    return {};
  }
  vscode.postMessage({ type: "log", msg: "Loading from blob!" });
  const initialData = await loadFromBlob(
    new Blob([content], { type: contentType }),
    null,
    null
  );
  vscode.postMessage({ type: "log", msg: "Loaded from blob!" });

  return { ...initialData, scrollToContent: true };
}

function getExcalidrawConfig(rootElement) {
  const b64Config = rootElement.getAttribute("data-excalidraw");
  const strConfig = Base64.decode(b64Config);
  return JSON.parse(strConfig);
}

async function main() {
  try {
    vscode.postMessage({ type: "log", msg: "Hello from the client side" });
    const rootElement = document.getElementById("root");

    const previousState = vscode.getState();
    const config = getExcalidrawConfig(rootElement);

    const initialData = previousState
      ? previousState
      : await getInitialData(config.content, config.contentType);

    vscode.postMessage({
      type: "log",
      msg: `Initial Data: ${JSON.stringify(initialData, null, 2)}`,
    });

    ReactDOM.render(
      <React.StrictMode>
        <App
          initialData={{ libraryItems: config.libraryItems, ...initialData }}
          vscode={vscode}
          name={config.name}
          contentType={config.contentType}
          viewModeEnabled={config.viewModeEnabled}
          syncTheme={config.syncTheme}
        />
      </React.StrictMode>,
      rootElement
    );
  } catch (error) {
    vscode.postMessage({
      type: "log",
      msg: error.message,
    });
  }
}

main();
