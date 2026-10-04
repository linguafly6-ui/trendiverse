INSERT OR IGNORE INTO categories (name, slug, color, icon, description) VALUES
 ('Virales & Pop Culture', 'virales', '#EF4444', '🔥', 'Noticias de tendencia, celebridades y memes'),
 ('Gaming & Guías', 'gaming', '#10B981', '🎮', 'Trucos, códigos y guías de juegos'),
 ('Micro-Herramientas', 'herramientas', '#3B82F6', '🛠️', 'Calculadoras, convertidores y tools útiles'),
 ('Chollos & Descuentos', 'chollos', '#F97316', '🏷️', 'Ofertas y descuentos en línea');

INSERT OR IGNORE INTO articles (title, slug, category, content, excerpt, image_url, thumbnail_url, read_time_minutes, views, trending) VALUES
 ('Los memes que dominaron internet esta semana', 'memes-de-la-semana', 'virales', 'Repasamos los memes más compartidos de la semana y su origen.', 'Repasamos los memes más compartidos y su origen.', 'https://picsum.photos/seed/memes/1200/630', 'https://picsum.photos/seed/memes/400/225', 4, 9800, 1),
 ('La celebridad que rompió TikTok con un baile viral', 'baile-viral-tiktok', 'virales', 'Cómo un baile de 15 segundos llegó a millones de vistas.', 'Un baile de 15 segundos llegó a millones de vistas.', 'https://picsum.photos/seed/tiktok/1200/630', 'https://picsum.photos/seed/tiktok/400/225', 3, 8700, 1),
 ('Códigos activos de Genshin Impact hoy', 'codigos-genshin-impact', 'gaming', 'Lista de códigos canjeables y cómo usarlos.', 'Lista actualizada de códigos canjeables.', 'https://picsum.photos/seed/genshin/1200/630', 'https://picsum.photos/seed/genshin/400/225', 2, 12000, 1),
 ('Guía completa para empezar en Elden Ring', 'guia-elden-ring', 'gaming', 'Consejos de clases, armas y primeros jefes.', 'Clases, armas y primeros jefes explicados.', 'https://picsum.photos/seed/elden/1200/630', 'https://picsum.photos/seed/elden/400/225', 8, 6400, 0),
 ('Conversor de divisas en tiempo real', 'conversor-divisas', 'herramientas', 'Convierte entre monedas al instante.', 'Convierte entre monedas al instante.', 'https://picsum.photos/seed/divisas/1200/630', 'https://picsum.photos/seed/divisas/400/225', 1, 3100, 0),
 ('Las mejores ofertas tecnológicas del día', 'ofertas-tecnologicas-del-dia', 'chollos', 'Selección de chollos con mayor descuento.', 'Selección de chollos con mayor descuento.', 'https://picsum.photos/seed/ofertas/1200/630', 'https://picsum.photos/seed/ofertas/400/225', 3, 7200, 0);

INSERT OR IGNORE INTO tools (title, slug, description, type, config) VALUES
 ('Calculadora de porcentajes', 'porcentajes', 'Calcula porcentajes rápidamente', 'percentage', '{}'),
 ('Conversor de divisas', 'divisas', 'Convierte entre EUR, USD, GBP y MXN', 'currency', '{"rates":{"EUR":1,"USD":1.08,"GBP":0.85,"MXN":18.5}}'),
 ('Generador de contraseñas', 'password', 'Crea contraseñas seguras', 'password', '{}');

INSERT INTO deals (product_name, original_price, discount_price, discount_percent, image_url, affiliate_url, expires_at, category_id)
 SELECT 'Auriculares inalámbricos ANC', 129.99, 79.99, 38, 'https://picsum.photos/seed/aud/400/300', 'https://example.com/aff/auriculares', datetime('now', '+7 days'), id FROM categories WHERE slug = 'chollos';
INSERT INTO deals (product_name, original_price, discount_price, discount_percent, image_url, affiliate_url, expires_at, category_id)
 SELECT 'Teclado mecánico RGB', 89.9, 49.9, 44, 'https://picsum.photos/seed/tec/400/300', 'https://example.com/aff/teclado', datetime('now', '+3 days'), id FROM categories WHERE slug = 'chollos';
