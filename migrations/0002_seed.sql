INSERT OR IGNORE INTO categories (name, slug, color, icon, description) VALUES
 ('Virales & Pop Culture', 'virales', '#EF4444', '🔥', 'Noticias de tendencia, celebridades y memes'),
 ('Gaming & Guías', 'gaming', '#10B981', '🎮', 'Trucos, códigos y guías de juegos'),
 ('Micro-Herramientas', 'herramientas', '#3B82F6', '🛠️', 'Calculadoras, convertidores y tools útiles'),
 ('Chollos & Descuentos', 'chollos', '#F97316', '🏷️', 'Ofertas y descuentos en línea');

INSERT OR IGNORE INTO tools (title, slug, description, type, config) VALUES
 ('Calculadora de porcentajes', 'porcentajes', 'Calcula porcentajes rápidamente', 'percentage', '{}'),
 ('Conversor de divisas', 'divisas', 'Convierte entre EUR, USD, GBP y MXN', 'currency', '{"rates":{"EUR":1,"USD":1.08,"GBP":0.85,"MXN":18.5}}'),
 ('Generador de contraseñas', 'password', 'Crea contraseñas seguras', 'password', '{}');
