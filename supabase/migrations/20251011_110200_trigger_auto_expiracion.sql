-- =====================================================
-- Migración: Trigger de auto-expiración de reservas
-- Sprint 4.1 - Sistema de Ventas desde App
-- Fecha: 2025-10-11
-- =====================================================

-- =====================================================
-- Job programado para liberar stock expirado
-- Ejecutar cada minuto via pg_cron
-- =====================================================

-- Habilitar extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Eliminar job anterior si existe (para re-ejecutar migración)
SELECT cron.unschedule('liberar-stock-expirado-ventas')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'liberar-stock-expirado-ventas'
);

-- Crear job que se ejecuta cada minuto
SELECT cron.schedule(
  'liberar-stock-expirado-ventas',  -- Nombre del job
  '* * * * *',                       -- Cron expression: cada minuto
  $$SELECT liberar_stock_expirado();$$  -- SQL a ejecutar
);

-- =====================================================
-- Vista para monitorear ventas próximas a expirar
-- =====================================================
CREATE OR REPLACE VIEW v_ventas_por_expirar AS
SELECT 
  va.id as venta_id,
  va.user_id,
  va.slot_id,
  va.producto_nombre,
  va.cantidad,
  va.precio_total,
  va.codigo_retiro,
  va.fecha_pago,
  va.fecha_expiracion,
  EXTRACT(EPOCH FROM (va.fecha_expiracion - NOW())) / 60 as minutos_restantes,
  vms.machine_id,
  vm.name as machine_name
FROM ventas_app va
JOIN vending_machine_slots vms ON va.slot_id = vms.id
JOIN vending_machines vm ON vms.machine_id = vm.id
WHERE va.estado = 'pagado'
  AND va.fecha_expiracion > NOW()
  AND va.fecha_expiracion < NOW() + INTERVAL '10 minutes'
ORDER BY va.fecha_expiracion ASC;

-- =====================================================
-- Vista de estadísticas de ventas
-- =====================================================
CREATE OR REPLACE VIEW v_estadisticas_ventas AS
SELECT 
  COUNT(*) FILTER (WHERE estado = 'borrador') as ventas_borrador,
  COUNT(*) FILTER (WHERE estado = 'reservado') as ventas_reservadas,
  COUNT(*) FILTER (WHERE estado = 'pagado') as ventas_pagadas,
  COUNT(*) FILTER (WHERE estado = 'completado') as ventas_completadas,
  COUNT(*) FILTER (WHERE estado = 'cancelado') as ventas_canceladas,
  COUNT(*) FILTER (WHERE estado = 'expirado') as ventas_expiradas,
  COUNT(*) as total_ventas,
  SUM(precio_total) FILTER (WHERE estado = 'completado') as ingresos_completados,
  SUM(precio_total) FILTER (WHERE estado = 'pagado') as ingresos_pendientes,
  SUM(cantidad) FILTER (WHERE estado IN ('reservado', 'pagado')) as stock_actualmente_reservado,
  AVG(EXTRACT(EPOCH FROM (fecha_retiro - fecha_pago)) / 60) FILTER (WHERE estado = 'completado' AND fecha_retiro IS NOT NULL) as tiempo_promedio_retiro_minutos,
  COUNT(*) FILTER (WHERE estado = 'expirado' AND fecha_expiracion >= NOW() - INTERVAL '24 hours') as expiraciones_ultimas_24h
FROM ventas_app;

-- =====================================================
-- Vista de ventas con información completa
-- =====================================================
CREATE OR REPLACE VIEW v_ventas_full AS
SELECT 
  va.id as venta_id,
  va.slot_id,
  va.user_id,
  va.producto_id,
  va.producto_nombre,
  va.producto_sku,
  va.cantidad,
  va.precio_unitario,
  va.precio_total,
  va.estado,
  va.codigo_retiro,
  va.fecha_creacion,
  va.fecha_reserva,
  va.fecha_pago,
  va.fecha_expiracion,
  va.fecha_retiro,
  va.fecha_cancelacion,
  va.payment_id,
  va.notas,
  va.metadata,
  -- Info del slot
  vms.slot_number,
  vms.machine_id,
  -- Info de la máquina
  vm.name as machine_name,
  vm.service_point_id,
  -- Info del service point
  sp.name as service_point_name,
  -- Cálculos
  CASE 
    WHEN va.estado = 'pagado' AND va.fecha_expiracion IS NOT NULL
    THEN GREATEST(0, EXTRACT(EPOCH FROM (va.fecha_expiracion - NOW())) / 60)
    ELSE NULL
  END as minutos_restantes,
  CASE 
    WHEN va.estado = 'completado' AND va.fecha_retiro IS NOT NULL AND va.fecha_pago IS NOT NULL
    THEN EXTRACT(EPOCH FROM (va.fecha_retiro - va.fecha_pago)) / 60
    ELSE NULL
  END as tiempo_retiro_minutos
FROM ventas_app va
JOIN vending_machine_slots vms ON va.slot_id = vms.id
JOIN vending_machines vm ON vms.machine_id = vm.id
JOIN service_points sp ON vm.service_point_id = sp.id;

-- =====================================================
-- Función auxiliar: Notificar ventas próximas a expirar
-- (Puede ser usada por un sistema de notificaciones)
-- =====================================================
CREATE OR REPLACE FUNCTION notificar_ventas_por_expirar()
RETURNS TABLE (
  venta_id UUID,
  user_id UUID,
  minutos_restantes NUMERIC,
  codigo_retiro VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    user_id,
    EXTRACT(EPOCH FROM (fecha_expiracion - NOW())) / 60,
    codigo_retiro
  FROM ventas_app va
  WHERE estado = 'pagado'
    AND fecha_expiracion > NOW()
    AND fecha_expiracion < NOW() + INTERVAL '5 minutes'
  ORDER BY fecha_expiracion ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comentarios
-- =====================================================
COMMENT ON VIEW v_ventas_por_expirar IS 'Ventas pagadas que expirarán en los próximos 10 minutos';
COMMENT ON VIEW v_estadisticas_ventas IS 'Estadísticas agregadas de todas las ventas';
COMMENT ON VIEW v_ventas_full IS 'Vista completa de ventas con información de slot, máquina, service point y usuario';
COMMENT ON FUNCTION notificar_ventas_por_expirar IS 'Obtiene ventas que expirarán en los próximos 5 minutos (para sistema de notificaciones)';

-- =====================================================
-- Permisos
-- =====================================================
GRANT SELECT ON v_ventas_por_expirar TO authenticated;
GRANT SELECT ON v_estadisticas_ventas TO authenticated;
GRANT SELECT ON v_ventas_full TO authenticated;
GRANT EXECUTE ON FUNCTION notificar_ventas_por_expirar TO authenticated;
