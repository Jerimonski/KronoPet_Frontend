import { useState } from "react";
import { PawIcon } from "./icons";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Sobre el Proyecto", href: "#proyecto" },
  { label: "Contacto", href: "#contacto" },
];

export interface NavbarProps {
  onAccessClick?: () => void;
}

export default function Navbar({ onAccessClick }: NavbarProps) {
  const [open, setOpen] = useState(false);

  // Función para manejar el auto-scroll suave
  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setOpen(false);

    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-primary-100/60 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo KronoPet - Turquesa Marca #75CFCF */}
        <a
          href="#inicio"
          onClick={(e) => handleScroll(e, "#inicio")}
          className="flex items-center gap-2.5 transition opacity-90 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-500 text-white shadow-sm shadow-primary-200">
            <PawIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
            KronoPet
          </span>
        </a>

        {/* Links Escritorio */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-sm font-medium text-neutral-600 transition hover:text-primary-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Acciones Escritorio */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            onClick={onAccessClick}
            className="btn-secondary px-5! py-2.5! cursor-pointer"
          >
            Acceso médico
          </button>
        </div>

        {/* Botón Menú Móvil */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 text-neutral-700 transition hover:bg-primary-50 hover:text-primary-700 md:hidden focus:outline-none"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Menú Móvil */}
      {open && (
        <div className="border-t border-primary-100 bg-white px-6 py-5 shadow-lg md:hidden animate-in fade-in-50 slide-in-from-top-2">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="text-sm font-medium text-neutral-700 transition hover:text-primary-700"
              >
                {link.label}
              </a>
            ))}
            <div className="my-1 border-t border-neutral-100" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onAccessClick?.();
              }}
              className="btn-secondary w-full text-center cursor-pointer"
            >
              Acceso médico
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
