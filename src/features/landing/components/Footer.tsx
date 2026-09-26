import { PawIcon } from "./icons";

interface FooterLink {
  label: string;
  href: string;
}

const QUICK_LINKS: FooterLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Sobre el Proyecto", href: "#proyecto" },
  { label: "Contacto", href: "#contacto" },
];

const MODULE_LINKS: string[] = [
  "Historial Clínico Centralizado",
  "Esquema de Vacunación",
  "Control de Desparasitación",
  "Catálogos y Certificados",
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-900 text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        {/* Columna 1: Marca y Propósito */}
        <div className="space-y-4">
          <a
            href="#inicio"
            className="inline-flex items-center gap-2.5 text-white transition hover:opacity-90"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-500 text-white shadow-sm shadow-primary-900/50">
              <PawIcon className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              KronoPet
            </span>
          </a>
          <p className="font-sans text-xs leading-relaxed text-neutral-400">
            Plataforma e infraestructura digital para la gestión clínica
            veterinaria. Centraliza historiales de salud, esquemas de vacunación
            y trazabilidad del paciente.
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Navegación
          </h4>
          <ul className="mt-4 space-y-2.5 font-sans text-xs">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-neutral-400 transition hover:text-primary-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: Módulos del Sistema */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Módulos Principales
          </h4>
          <ul className="mt-4 space-y-2.5 font-sans text-xs">
            {MODULE_LINKS.map((item) => (
              <li key={item}>
                <a
                  href="#funcionalidades"
                  className="text-neutral-400 transition hover:text-primary-400"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Subfooter de Copyright */}
      <div className="border-t border-neutral-800/80 bg-neutral-950/50 px-6 py-6 text-center font-sans text-xs text-neutral-500">
        <p>
          © {new Date().getFullYear()} KronoPet. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
