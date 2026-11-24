// Fecha "YYYY-MM-DD" del frontmatter en texto legible. Se usa UTC para que
// servidor y cliente muestren el mismo día sin importar la zona horaria.
export const formatDate = (date, locale) => new Intl.DateTimeFormat(locale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
}).format(new Date(date))
