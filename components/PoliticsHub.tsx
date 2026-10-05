import Link from 'next/link'

const topics = [
  {
    label: 'Elecciones · 29N',
    title: 'Elecciones generales',
    description: 'Calendario, partidos, candidaturas y claves para entender cómo se traducen los votos en escaños.',
    links: [
      { href: 'elecciones-generales-2026-29-noviembre', text: 'Guía de las elecciones generales del 29N' },
      { href: 'como-se-reparten-escanos-voto-provincia-29n', text: 'Cómo se reparten los escaños por provincia' },
      { href: 'frente-amplio-espana-partidos-candidato-programa-29n', text: 'Frente Amplio: partidos, candidatura y programa' },
    ],
  },
  {
    label: 'Vivienda · alquiler',
    title: 'Vivienda y medidas públicas',
    description: 'Qué proponen los partidos, qué normas siguen vigentes y cómo afectan los cambios a inquilinos y propietarios.',
    links: [
      { href: 'vivienda-elecciones-29n-comparar-propuestas-partidos', text: 'Comparativa de propuestas de vivienda para el 29N' },
      { href: 'desahucios-decretos-vivienda-rechazados-que-sigue-vigente-2026', text: 'Qué pasa con los desahucios tras los decretos rechazados' },
    ],
  },
  {
    label: 'Gobierno · Congreso',
    title: 'Gobierno y actividad legislativa',
    description: 'Explicamos las competencias del Ejecutivo, el trabajo parlamentario y el recorrido de las leyes pendientes.',
    links: [
      { href: 'gobierno-en-funciones-espana-que-puede-hacer-elecciones-2026', text: 'Qué puede hacer un Gobierno en funciones' },
      { href: 'leyes-pendientes-elecciones-anticipadas-espana-2026-29n', text: 'Leyes pendientes tras el adelanto electoral' },
    ],
  },
  {
    label: 'Presupuestos · autonomías',
    title: 'Financiación y cuentas públicas',
    description: 'Seguimos la prórroga presupuestaria y las negociaciones sobre los recursos de las comunidades autónomas.',
    links: [
      { href: 'espana-sin-presupuestos-prorrogados-consecuencias-ciudadanos-2026', text: 'Qué implica que España siga sin nuevos Presupuestos' },
      { href: 'reforma-financiacion-autonomica-2026-que-propone-y-que-falta', text: 'Reforma de la financiación autonómica: claves y pasos pendientes' },
    ],
  },
]

export default function PoliticsHub() {
  return (
    <section aria-labelledby="politics-topics-title" className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/30 sm:p-6">
      <div className="mb-5 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Guías y contexto</p>
        <h2 id="politics-topics-title" className="mt-1 text-2xl font-extrabold">Política española por temas</h2>
        <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
          Sigue las elecciones del 29N, las decisiones sobre vivienda y las cuestiones que afectan al Gobierno, al Congreso y a las comunidades autónomas. Reunimos explicadores y noticias relacionadas para encontrar el contexto de cada asunto.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <article key={topic.title} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{topic.label}</p>
            <h3 className="mt-1 text-lg font-bold">{topic.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{topic.description}</p>
            <ul className="mt-3 space-y-2">
              {topic.links.map((link) => (
                <li key={link.href}>
                  <Link className="text-sm font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100" href={`/articles/${link.href}`}>
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
