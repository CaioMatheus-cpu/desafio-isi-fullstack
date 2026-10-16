// RN01: toda data e hora enviada à API usa o horário de Brasília, no formato
// AAAA-MM-DDTHH:MM-03:00. O horário de Brasília é sempre -03:00 (não há
// horário de verão), então a conversão é só somar ou tirar 3 horas.
const OFFSET_MS = 3 * 60 * 60 * 1000;
const INPUT_FORMAT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;

// Lê o formato de entrada e devolve o instante, ou null se o texto estiver
// fora do formato ou for uma data que não existe (30 de fevereiro, hora 24).
// Nunca "ajusta" a data: ou está certa, ou é recusada.
export function parseBrasiliaDateTime(text: string): Date | null {
  const match = INPUT_FORMAT.exec(text);
  if (!match) {
    return null;
  }
  const [year, month, day, hour, minute] = match.slice(1).map(Number);

  // Monta a data com os números exatamente como vieram, só para conferir se
  // eles existem. Se algum campo mudar ao montar, a data era inválida.
  const asWritten = new Date(Date.UTC(year, month - 1, day, hour, minute));
  asWritten.setUTCFullYear(year);
  const exists =
    asWritten.getUTCFullYear() === year &&
    asWritten.getUTCMonth() === month - 1 &&
    asWritten.getUTCDate() === day &&
    asWritten.getUTCHours() === hour &&
    asWritten.getUTCMinutes() === minute;
  if (!exists) {
    return null;
  }

  // A hora escrita é de Brasília (UTC-3): o instante real é 3 horas depois.
  return new Date(asWritten.getTime() + OFFSET_MS);
}

// Formato das respostas: AAAA-MM-DDTHH:MM:SS-03:00.
export function formatBrasiliaDateTime(instant: Date): string {
  const local = new Date(instant.getTime() - OFFSET_MS);
  return `${local.toISOString().slice(0, 19)}-03:00`;
}
