// Set de iconos propios en SVG inline, para no depender de una librería externa
// solo para la landing pública.

export interface IconProps {
  className?: string;
}
export function VaccineIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        d="M19 5L5 19M9 5l10 10M18 9l1.5-1.5a1.5 1.5 0 000-2.12l-.88-.88a1.5 1.5 0 00-2.12 0L15 6M6 15l-1.5 1.5a1.5 1.5 0 000 2.12l.88.88a1.5 1.5 0 002.12 0L9 18M3 21l3-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EditIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

export function ScalpelIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        d="M14 4l6 6-10 10H4v-6L14 4zM11 7l3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldCheckIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path
        d="M8 11V7a4 4 0 018 0v4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function PawIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="5.5" cy="9" r="2.2" />
      <circle cx="10.2" cy="6" r="2.2" />
      <circle cx="14.8" cy="6" r="2.2" />
      <circle cx="19.2" cy="9" r="2.2" />
      <path d="M12 12.2c-3.4 0-6.4 2.1-6.4 5 0 1.9 1.6 3.3 3.6 3.1 1-.1 1.8-.6 2.8-.6s1.8.5 2.8.6c2 .2 3.6-1.2 3.6-3.1 0-2.9-3-5-6.4-5z" />
    </svg>
  );
}

export function SyringeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        d="M20 4l-3 3M9 10l5 5M4 20l4-1 8-8-3-3-8 8-1 4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5 5.5l4 4" strokeLinecap="round" />
    </svg>
  );
}

export function StethoscopeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        d="M6 3v6a4 4 0 0 0 8 0V3M10 17a5 5 0 0 0 5-5v-1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="17" r="2.2" />
    </svg>
  );
}

export function ToothIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        d="M12 3c-2.2 0-3.6 1.2-4.6 1.2C6.2 4.2 5 3.4 4 4.4c-1.2 1.2-.6 4 0 6 .5 1.7.9 3.4 1.4 5.3.3 1.2.9 2.3 2 2.3.9 0 1.1-1 1.4-2.2.3-1.2.6-2.6 1.2-2.6s.9 1.4 1.2 2.6c.3 1.2.5 2.2 1.4 2.2 1.1 0 1.7-1.1 2-2.3.5-1.9.9-3.6 1.4-5.3.6-2 1.2-4.8 0-6-1-1-2.2-.2-3.4.8C15.6 4.2 14.2 3 12 3z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FlaskIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        d="M9 2h6M10 2v6.5L4.8 17a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 8.5V2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.5 14h9" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        d="M5 4h3.5l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4 1.5V18a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
