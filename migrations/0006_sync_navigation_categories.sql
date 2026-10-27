-- Keep the D1 categories table aligned with the 10 categories exposed by lib/constants.ts.
-- Seed current navigation categories before moving any existing deal references.
INSERT OR IGNORE INTO categories (name, slug, color, icon, description) VALUES
('Coches & Novedades', 'coches', '#0EA5E9', '🚗', 'Noticias de coches, nuevos modelos, movilidad, tecnología del automóvil y novedades de la industria.'),
('Tecnología & Novedades', 'tecnologia', '#8B5CF6', '💻', 'Actualidad tecnológica, inteligencia artificial, ciencia aplicada, innovación, dispositivos y avances que están cambiando el mundo.'),
('Empresas que transforman', 'empresas-que-transforman', '#0F766E', '🚀', 'Reportajes sobre empresas que transforman industrias con inteligencia artificial, baterías, robótica, computación avanzada y tecnología espacial.'),
('Moda & Tendencias', 'moda', '#DB2777', '👗', 'Últimas tendencias de moda, colores de temporada, prendas clave, accesorios y consejos prácticos para adaptar las pasarelas al día a día.'),
('TopTrends', 'toptrends', '#7C3AED', '⭐', 'Comparativas y guías de compra de productos en tendencia: hogar, cocina, fitness y tecnología, con criterios claros para comparar antes de comprar.'),
('Hogar', 'hogar', '#0F766E', '🏠', 'Ofertas y guías para el hogar: muebles, decoración, iluminación, textiles y tecnología para comparar precios y condiciones antes de comprar.'),
('Ahorro y Finanzas Personales', 'ahorro', '#15803D', '💶', 'Guías prácticas para ahorrar dinero, organizar presupuestos, reducir gastos del hogar y entender productos financieros con fuentes fiables.'),
('Suplementos', 'suplementos', '#0D9488', '🌿', 'Guías informativas sobre suplementos, vitaminas, minerales y nutrición: evidencia científica, posibles efectos secundarios, interacciones y criterios para elegir productos con seguridad.'),
('Conciertos & Festivales', 'conciertos', '#BE123C', '🎤', 'Entradas para conciertos y festivales en España: lo que queda de 2026 y las citas ya fechadas para 2027, con el enlace oficial de compra y la fuente de cada anuncio.'),
('Actualidad', 'actualidad', '#2563EB', '📰', 'Noticias de actualidad en España explicadas con contexto, fuentes verificables, datos clave y respuestas a las preguntas que más buscan los lectores.');

-- Preserve deal categorization where legacy sections have a clear current equivalent.
UPDATE deals
SET category_id = (
  SELECT id FROM categories
  WHERE slug = CASE
    (SELECT slug FROM categories AS old_category WHERE old_category.id = deals.category_id)
    WHEN 'virales' THEN 'actualidad'
    WHEN 'gaming' THEN 'toptrends'
    WHEN 'herramientas' THEN 'toptrends'
    WHEN 'chollos' THEN 'toptrends'
  END
)
WHERE category_id IN (
  SELECT id FROM categories WHERE slug IN ('virales', 'gaming', 'herramientas', 'chollos')
);

-- Detach any remaining deal references to retired categories, then remove retired rows.
UPDATE deals
SET category_id = NULL
WHERE category_id IN (
  SELECT id FROM categories
  WHERE slug NOT IN (
    'coches', 'tecnologia', 'empresas-que-transforman', 'moda', 'toptrends',
    'hogar', 'ahorro', 'suplementos', 'conciertos', 'actualidad'
  )
);

DELETE FROM categories
WHERE slug NOT IN (
  'coches', 'tecnologia', 'empresas-que-transforman', 'moda', 'toptrends',
  'hogar', 'ahorro', 'suplementos', 'conciertos', 'actualidad'
);

UPDATE categories SET name = 'Coches & Novedades', color = '#0EA5E9', icon = '🚗', description = 'Noticias de coches, nuevos modelos, movilidad, tecnología del automóvil y novedades de la industria.' WHERE slug = 'coches';
UPDATE categories SET name = 'Tecnología & Novedades', color = '#8B5CF6', icon = '💻', description = 'Actualidad tecnológica, inteligencia artificial, ciencia aplicada, innovación, dispositivos y avances que están cambiando el mundo.' WHERE slug = 'tecnologia';
UPDATE categories SET name = 'Empresas que transforman', color = '#0F766E', icon = '🚀', description = 'Reportajes sobre empresas que transforman industrias con inteligencia artificial, baterías, robótica, computación avanzada y tecnología espacial.' WHERE slug = 'empresas-que-transforman';
UPDATE categories SET name = 'Moda & Tendencias', color = '#DB2777', icon = '👗', description = 'Últimas tendencias de moda, colores de temporada, prendas clave, accesorios y consejos prácticos para adaptar las pasarelas al día a día.' WHERE slug = 'moda';
UPDATE categories SET name = 'TopTrends', color = '#7C3AED', icon = '⭐', description = 'Comparativas y guías de compra de productos en tendencia: hogar, cocina, fitness y tecnología, con criterios claros para comparar antes de comprar.' WHERE slug = 'toptrends';
UPDATE categories SET name = 'Hogar', color = '#0F766E', icon = '🏠', description = 'Ofertas y guías para el hogar: muebles, decoración, iluminación, textiles y tecnología para comparar precios y condiciones antes de comprar.' WHERE slug = 'hogar';
UPDATE categories SET name = 'Ahorro y Finanzas Personales', color = '#15803D', icon = '💶', description = 'Guías prácticas para ahorrar dinero, organizar presupuestos, reducir gastos del hogar y entender productos financieros con fuentes fiables.' WHERE slug = 'ahorro';
UPDATE categories SET name = 'Suplementos', color = '#0D9488', icon = '🌿', description = 'Guías informativas sobre suplementos, vitaminas, minerales y nutrición: evidencia científica, posibles efectos secundarios, interacciones y criterios para elegir productos con seguridad.' WHERE slug = 'suplementos';
UPDATE categories SET name = 'Conciertos & Festivales', color = '#BE123C', icon = '🎤', description = 'Entradas para conciertos y festivales en España: lo que queda de 2026 y las citas ya fechadas para 2027, con el enlace oficial de compra y la fuente de cada anuncio.' WHERE slug = 'conciertos';
UPDATE categories SET name = 'Actualidad', color = '#2563EB', icon = '📰', description = 'Noticias de actualidad en España explicadas con contexto, fuentes verificables, datos clave y respuestas a las preguntas que más buscan los lectores.' WHERE slug = 'actualidad';

-- Report the final count for deployment-log verification.
SELECT COUNT(*) AS category_count FROM categories;
