import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";

// Import this in case we want to test the app with overriding the default styles.
// import "./styles/variables.css";

// Import our custom styles.
import "./styles/custom.scss";
import ThemeHandler from "./components/ThemeHandler";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeHandler>
      <App />
    </ThemeHandler>
  </React.StrictMode>
);
