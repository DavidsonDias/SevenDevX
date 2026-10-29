import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Preserve the public first-paint island and the existing application tree.
const appMount = document.getElementById("public-app-root") || document.getElementById("root");
ReactDOM.createRoot(appMount as HTMLElement).render(
  <React.StrictMode><App /></React.StrictMode>
);
