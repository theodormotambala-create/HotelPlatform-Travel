import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { supabase, SUPABASE_READY } from "./supabaseClient.js";

// Rend le client Supabase accessible a l'app pour la synchronisation des donnees.
// L'app fonctionne avec ou sans : sans connexion, elle garde les donnees de demo.
if (SUPABASE_READY) {
  window.__supabase = supabase;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Cache le splash de demarrage une fois l'app montee
requestAnimationFrame(() => {
  setTimeout(() => {
    const b = document.getElementById("boot");
    if (b) {
      b.classList.add("hide");
      setTimeout(() => b.remove(), 400);
    }
  }, 300);
});
