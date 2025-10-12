-- =====================================================
-- MIGRACIÓN 2.1: Seed data para tabla caminos
-- =====================================================
-- Descripción: Poblar caminos iniciales del sistema
-- Fecha: 2025-10-10
-- Sprint: 1.1 - Jerarquía de Entidades
-- =====================================================

-- Insertar caminos principales de España
INSERT INTO caminos (nombre, codigo, zona_operativa, region, estado_operativo, descripcion) VALUES
  (
    'Camino de Santiago Francés',
    'CSF',
    'Norte de España',
    'Galicia, Castilla y León',
    'activo',
    'La ruta más popular y transitada del Camino de Santiago. Parte desde Francia (St. Jean Pied de Port) y atraviesa Navarra, La Rioja, Castilla y León hasta llegar a Santiago de Compostela.'
  ),
  (
    'Camino del Norte',
    'CN',
    'Costa Cantábrica',
    'País Vasco, Cantabria, Asturias, Galicia',
    'activo',
    'Ruta costera que discurre por la costa cantábrica desde Irún hasta Santiago de Compostela. Conocido por sus paisajes marítimos y montañosos.'
  ),
  (
    'Camino Portugués',
    'CP',
    'Norte de Portugal y Galicia',
    'Portugal, Galicia',
    'activo',
    'Ruta que parte desde Lisboa o Oporto (Portugal) y atraviesa el norte de Portugal hasta entrar en Galicia y llegar a Santiago.'
  ),
  (
    'Vía de la Plata',
    'VDP',
    'Oeste de España',
    'Andalucía, Extremadura, Castilla y León',
    'activo',
    'Una de las rutas más largas del Camino, que parte desde Sevilla y atraviesa Extremadura y Castilla y León hacia Santiago o Astorga.'
  ),
  (
    'Camino Primitivo',
    'CPRI',
    'Asturias y Galicia',
    'Asturias, Galicia',
    'activo',
    'La primera ruta histórica del Camino de Santiago. Parte desde Oviedo y se caracteriza por su dureza y belleza montañosa.'
  ),
  (
    'Camino Inglés',
    'CI',
    'Galicia',
    'Galicia',
    'activo',
    'Ruta corta que utilizaban los peregrinos que llegaban en barco a Ferrol o A Coruña desde Inglaterra e Irlanda.'
  ),
  (
    'Camino de Madrid',
    'CM',
    'Centro de España',
    'Madrid, Castilla y León',
    'planificado',
    'Ruta que parte desde Madrid y se une al Camino Francés en Sahagún. En fase de planificación para expansión de servicios.'
  ),
  (
    'Camino de Levante',
    'CL',
    'Este de España',
    'Valencia, Castilla-La Mancha',
    'planificado',
    'Ruta que parte desde Valencia/Alicante y atraviesa el interior hacia el Camino Francés. En fase de planificación.'
  );

-- =====================================================
-- Asociar locations existentes a caminos
-- =====================================================
-- NOTA: Estas actualizaciones asignan las ubicaciones existentes
-- a los caminos según criterios geográficos

-- Camino Francés (Galicia, Castilla y León, La Rioja, Navarra)
UPDATE locations 
SET camino_id = (SELECT id FROM caminos WHERE codigo = 'CSF' LIMIT 1)
WHERE 
  city ILIKE '%santiago%' OR 
  city ILIKE '%león%' OR 
  city ILIKE '%burgos%' OR
  city ILIKE '%logroño%' OR
  city ILIKE '%pamplona%' OR
  city ILIKE '%ponferrada%' OR
  city ILIKE '%astorga%';

-- Camino del Norte (País Vasco, Cantabria, Asturias costa)
UPDATE locations 
SET camino_id = (SELECT id FROM caminos WHERE codigo = 'CN' LIMIT 1)
WHERE 
  city ILIKE '%irún%' OR 
  city ILIKE '%san sebast%' OR 
  city ILIKE '%bilbao%' OR
  city ILIKE '%santander%' OR
  city ILIKE '%gijón%' OR
  city ILIKE '%avilés%';

-- Camino Portugués (Galicia sur, frontera con Portugal)
UPDATE locations 
SET camino_id = (SELECT id FROM caminos WHERE codigo = 'CP' LIMIT 1)
WHERE 
  city ILIKE '%vigo%' OR 
  city ILIKE '%pontevedra%' OR 
  city ILIKE '%tui%' OR
  city ILIKE '%porriño%';

-- Vía de la Plata (Andalucía, Extremadura)
UPDATE locations 
SET camino_id = (SELECT id FROM caminos WHERE codigo = 'VDP' LIMIT 1)
WHERE 
  city ILIKE '%sevilla%' OR 
  city ILIKE '%mérida%' OR 
  city ILIKE '%cáceres%' OR
  city ILIKE '%plasencia%' OR
  city ILIKE '%zamora%' OR
  city ILIKE '%salamanca%';

-- Camino Primitivo (Asturias interior)
UPDATE locations 
SET camino_id = (SELECT id FROM caminos WHERE codigo = 'CPRI' LIMIT 1)
WHERE 
  city ILIKE '%oviedo%' OR 
  city ILIKE '%lugo%';

-- Camino Inglés (Galicia norte - A Coruña, Ferrol)
UPDATE locations 
SET camino_id = (SELECT id FROM caminos WHERE codigo = 'CI' LIMIT 1)
WHERE 
  city ILIKE '%coruña%' OR 
  city ILIKE '%ferrol%' OR
  city ILIKE '%betanzos%';

-- Por defecto, asignar ubicaciones sin camino al Camino Francés (más común)
UPDATE locations 
SET camino_id = (SELECT id FROM caminos WHERE codigo = 'CSF' LIMIT 1)
WHERE camino_id IS NULL;

-- =====================================================
-- Verificación de datos
-- =====================================================

-- Mostrar resumen de caminos creados
SELECT 
  codigo,
  nombre,
  estado_operativo,
  (SELECT COUNT(*) FROM locations WHERE locations.camino_id = caminos.id) as ubicaciones_count
FROM caminos
ORDER BY codigo;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
