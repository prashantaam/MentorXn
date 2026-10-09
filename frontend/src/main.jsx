import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

/* Base + design system (new pages use the --mx-* tokens and .mx-* classes) */
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/theme/tokens.css";
import "./styles/theme/components.css";

import "./styles/learning/learning-text.css";
import "./styles/learning/info-panel.css";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
