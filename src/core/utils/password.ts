// Contraseña inicial legible (sin caracteres ambiguos como 0/O o 1/l).
// La entrega la clínica; el backend la almacena con hash.

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function generatePassword(length = 10): string {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}
