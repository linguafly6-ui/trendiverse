export function formatDate(date: string): string {
  const d = new Date(date.includes('T') ? date : date.replace(' ', 'T') + 'Z')
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatPrice(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

export function cn(...c: Array<string | false | null | undefined>): string {
  return c.filter(Boolean).join(' ')
}
