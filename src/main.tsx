import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n/config";

// Import this in case we want to test the app with overriding the default styles.
// import "./styles/variables.css";

// Import our custom styles.
import "./styles/custom.scss";
import "./styles/colors_and_type.css";
import ThemeHandler from "./components/ThemeHandler";

ReactDOM.createRoot(document.getElementById("AIActImplementationTool")!).render(
  <React.StrictMode>
    <ThemeHandler>
      <App />
    </ThemeHandler>
  </React.StrictMode>
);