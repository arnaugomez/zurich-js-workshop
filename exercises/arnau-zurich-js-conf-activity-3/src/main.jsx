import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MyersDiffGame from "./myers-diff-game.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MyersDiffGame />
  </StrictMode>,
);
