import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import babel from "@rolldown/plugin-babel"
import { defineConfig, loadEnv } from "vite"
import { mailDevServer } from "./dev/mailDevServer.ts"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Prefijo "" carga también variables sin VITE_ (solo en Node, nunca en el bundle).
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      mailDevServer({ RESEND_API_KEY: env.RESEND_API_KEY, RESEND_FROM: env.RESEND_FROM }),
    ],
  }
})
