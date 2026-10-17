import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// In development, forward /api calls to the backend so cookies stay same-origin.
export default defineConfig({ plugins: [react()], server: { proxy: { "/api": "http://localhost:5000" } } });
