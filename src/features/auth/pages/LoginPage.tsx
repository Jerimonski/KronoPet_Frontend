import { ArrowLeft, CircleAlert, Eye, EyeOff, PawPrint, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { ApiError } from "../../../core/api/client";
import { MOCK_STAFF_PASSWORD } from "../../../core/mocks/seed";
import { Field, TextInput } from "../../../shared/components/form";
import { useAuth } from "../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Ingresa un correo válido.";
    if (password.length < 6) nextErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    setErrors(nextErrors);
    setAuthError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setAuthError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="relative hidden overflow-hidden bg-primary-950 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-700/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-500 text-primary-950">
            <PawPrint className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl font-bold">KronoPet</span>
        </div>
        <div className="relative mt-auto max-w-md">
          <h1 className="font-display text-4xl leading-tight">
            Cuidado experto.
            <br />
            <span className="text-primary-400">Registros ordenados.</span>
          </h1>
          <p className="mt-4 text-primary-200">
            Gestiona tutores, mascotas, fichas clínicas y vacunas desde un solo lugar, sin
            fichas de papel.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-primary-300">
            <ShieldCheck className="h-5 w-5 text-primary-400" />
            Acceso exclusivo para el personal de la clínica
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex flex-col p-6 sm:p-12">
        <Link to="/" className="btn-ghost inline-flex items-center gap-1.5 self-start">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
        <div className="m-auto w-full max-w-sm py-10">
          <h2 className="font-sans text-2xl font-bold text-neutral-900">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Ingresa con tu cuenta del personal veterinario.
          </p>

          {authError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-xl bg-danger-bg p-3 text-sm text-danger ring-1 ring-danger/20"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <Field label="Correo electrónico" error={errors.email}>
              <TextInput
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@vety.cl"
                aria-invalid={!!errors.email}
              />
            </Field>
            <Field label="Contraseña" error={errors.password}>
              <div className="relative">
                <TextInput
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <button type="submit" className="btn-app h-11 w-full" disabled={submitting}>
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-dashed border-primary-300 bg-primary-50 p-4 text-xs text-primary-900">
            <p className="font-semibold">Modo demostración (datos simulados)</p>
            <p className="mt-1">
              Correo: <code>camila.rojas@vety.cl</code>
              <br />
              Contraseña: <code>{MOCK_STAFF_PASSWORD}</code>
            </p>
            <button
              type="button"
              className="mt-2 font-semibold text-primary-800 underline underline-offset-2"
              onClick={() => {
                setEmail("camila.rojas@vety.cl");
                setPassword(MOCK_STAFF_PASSWORD);
              }}
            >
              Autocompletar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
