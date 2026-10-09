import { useState } from "react";
import { PawIcon } from "./icons";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    clinic: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      // Reemplaza esta URL por el endpoint de tu Backend/API Handler que dispara el servicio de Resend
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Ocurrió un problema al enviar el mensaje.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", clinic: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "No pudimos enviar tu mensaje. Por favor intenta de nuevo o escríbenos directamente por correo.",
      );
    }
  };

  return (
    <section
      id="contacto"
      className="border-t border-neutral-200/60 bg-neutral-50 py-20"
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* Encabezado */}
        <div className="text-center">
          <span className="badge font-sans inline-flex items-center gap-1.5">
            <PawIcon className="h-4 w-4 text-primary-600" />
            Soporte y Contacto
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            ¿Tienes consultas sobre la plataforma?
          </h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-600 max-w-2xl mx-auto">
            Si eres médico veterinario o administrador de una clínica y
            requieres soporte técnico, información sobre el enrolamiento de tu
            centro o consultas del sistema, déjanos un mensaje.
          </p>
        </div>

        {/* Cajas de Soporte Directo */}
        <div className="mt-10 mx-auto">
          <div className="card flex flex-col items-center p-6 text-center transition hover:border-primary-300">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Consultas Institucionales
            </span>
            <a
              href="mailto:contacto@kronopet.cl"
              className="mt-2 font-sans text-base font-bold text-primary-700 hover:underline"
            >
              contacto@kronopet.cl
            </a>
            <p className="mt-1 font-sans text-xs text-neutral-500">
              Información del proyecto e integración clínica
            </p>
          </div>
        </div>

        {/* Formulario conectado a Resend */}
        <div className="card mt-10 p-8 bg-white shadow-sm ring-1 ring-neutral-200/60">
          <h3 className="font-display text-xl font-bold text-neutral-900 text-center sm:text-left">
            Envíanos un mensaje directo
          </h3>

          {status === "success" ? (
            <div className="mt-6 rounded-xl bg-emerald-50 p-6 border border-emerald-200 text-center">
              <span className="text-2xl">🎉</span>
              <p className="mt-2 font-sans text-base font-bold text-emerald-900">
                ¡Mensaje enviado con éxito!
              </p>
              <p className="mt-1 font-sans text-sm text-emerald-700">
                Gracias por comunicarte con KronoPet. Te responderemos a la
                brevedad a tu correo electrónico.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-4 btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5 font-sans">
              {status === "error" && (
                <div className="rounded-lg bg-rose-50 p-4 border border-rose-200 text-xs text-rose-800">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                  >
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. Juan Pérez"
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {/* Correo */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                  >
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.cl"
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              {/* Clínica o Centro Veterinario */}
              <div>
                <label
                  htmlFor="clinic"
                  className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                >
                  Clínica / Centro Veterinario (Opcional)
                </label>
                <input
                  type="text"
                  id="clinic"
                  name="clinic"
                  value={formData.clinic}
                  onChange={handleChange}
                  placeholder="Clínica Veterinaria San Francisco"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              {/* Mensaje */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
                >
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe tu consulta o requerimiento operativo..."
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                />
              </div>

              {/* Botón de envío */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="btn-secondary font-sans cursor-pointer px-6 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status === "submitting" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Mensaje"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
