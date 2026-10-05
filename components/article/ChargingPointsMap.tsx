'use client'

const GOOGLE_MAPS_SEARCH = 'https://www.google.com/maps/search/?api=1&query=puntos+de+carga+para+coches+electricos+en+Espana'
const GOOGLE_MAPS_EMBED = 'https://www.google.com/maps?output=embed&q=puntos%20de%20carga%20para%20coches%20el%C3%A9ctricos%20en%20Espa%C3%B1a'
const REVE_MAP = 'https://www.mapareve.es/'

export default function ChargingPointsMap() {
  return (
    <section aria-labelledby="charging-map-title" className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="p-5 sm:p-6">
        <h3 id="charging-map-title" className="text-xl font-bold text-slate-900 dark:text-white">Mapa de puntos de recarga en España</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Busca estaciones en Google Maps. Los resultados pueden no incluir todos los cargadores ni reflejar su disponibilidad en tiempo real; confirma el estado antes de desviarte.</p>
      </div>
      <div className="aspect-[16/10] min-h-72 w-full bg-slate-100 dark:bg-slate-800">
        <iframe title="Google Maps: puntos de recarga para coches eléctricos en España" src={GOOGLE_MAPS_EMBED} className="h-full min-h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">Para planificar una ruta y consultar los puntos públicos registrados, la disponibilidad y las tarifas comunicadas por cada operador, abre también el mapa oficial REVE, operado por Red Eléctrica.</p>
        <div className="flex flex-wrap gap-3">
          <a href={GOOGLE_MAPS_SEARCH} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800">Abrir Google Maps</a>
          <a href={REVE_MAP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">Abrir mapa oficial REVE</a>
        </div>
      </div>
    </section>
  )
}
