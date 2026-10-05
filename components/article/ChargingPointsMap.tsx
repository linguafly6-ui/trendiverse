'use client'

const OPEN_CHARGE_MAP = 'https://map.openchargemap.io/?mode=embedded&latitude=40.4168&longitude=-3.7038&zoom=6'
const OPEN_CHARGE_MAP_SITE = 'https://www.openchargemap.org/poi?CountryIDs=210'
const REVE_MAP = 'https://www.mapareve.es/'

export default function ChargingPointsMap() {
  return (
    <section aria-labelledby="charging-map-title" className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="p-5 sm:p-6">
        <h3 id="charging-map-title" className="text-xl font-bold text-slate-900 dark:text-white">Mapa de puntos de recarga en España</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Este mapa muestra estaciones de recarga registradas en Open Charge Map. Puedes acercar el mapa, seleccionar puntos y consultar sus datos; el estado y la disponibilidad pueden cambiar, así que conviene comprobar el cargador antes de iniciar el viaje.</p>
      </div>
      <div className="aspect-[16/10] min-h-72 w-full bg-slate-100 dark:bg-slate-800">
        <iframe title="Mapa de puntos de recarga para coches eléctricos en España" src={OPEN_CHARGE_MAP} className="h-full min-h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">Open Charge Map mantiene una base de datos internacional de puntos de recarga y permite consultar ubicaciones, operadores, conectores y estado cuando esos datos están disponibles. Para una referencia específica de España, también puedes consultar el mapa público REVE de Red Eléctrica.</p>
        <div className="flex flex-wrap gap-3">
          <a href={OPEN_CHARGE_MAP_SITE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800">Ver puntos de recarga</a>
          <a href={REVE_MAP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">Abrir mapa oficial REVE</a>
        </div>
      </div>
    </section>
  )
}
