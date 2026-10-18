import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
import ConnectivityGate from "./shared/components/connectivity/ConnectivityGate";
import { Provider } from "react-redux";
import { store } from "./app/store";

const Router =
  window.location.protocol === "file:" ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <ConnectivityGate>
          <App />
        </ConnectivityGate>
      </Router>
    </Provider>
  </StrictMode>,
);

// Keep the branded first-load experience visible for three seconds, then
// remove it after React has painted its first frame.
window.setTimeout(() => {
  requestAnimationFrame(() => {
    const loader = document.getElementById("app-loader");
    if (!loader) return;

    loader.classList.add("app-loader--hidden");
    loader.addEventListener("transitionend", () => loader.remove(), {
      once: true,
    });
    window.setTimeout(() => loader.remove(), 500);
  });
}, 3000);
