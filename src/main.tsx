import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: "#1e1e2e", // dark card background
                      color: "#fff",
                      borderRadius: "0.75rem",
                      border: "1px solid #2d2d3d",
                      padding: "12px 16px",
                    },
                    success: {
                      iconTheme: {
                        primary: "#10b981", // green-500
                        secondary: "#1e1e2e",
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: "#ef4444", // red-500
                        secondary: "#1e1e2e",
                      },
                    },
                  }}
                />

      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
