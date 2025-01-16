import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import PageManager from "./PageManager.tsx";
import App2 from "./longpress.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PageManager />
  </StrictMode>
);
