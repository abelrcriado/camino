-- =====================================================
-- Migración: Funciones de ventas_app
-- Sprint 4.1 - Sistema de Ventas desde App
-- Fecha: 2025-10-11
-- =====================================================

-- =====================================================
-- Función 1: Crear venta (estado inicial 'borrador')
-- =====================================================
CREATE OR REPLACE FUNCTION crear_venta_app(
  p_slot_id UUID,
  p_user_id UUID,
  p_producto_id UUID,
  p_cantidad INTEGER DEFAULT 1,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (
  venta_id UUID,
  producto_nombre VARCHAR,
  precio_unitario INTEGER,
  precio_total INTEGER,
  estado VARCHAR
) AS $$
DECLARE
  v_slot RECORD;
  v_producto RECORD;
  v_precio_unitario INTEGER;
  v_precio_total INTEGER;
  v_venta_id UUID;
BEGIN
  -- Verificar que el slot existe y está activo
  SELECT * INTO v_slot
  FROM vending_machine_slots
  WHERE id = p_slot_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot no encontrado o inactivo';
  END IF;
  
  -- Verificar que el producto coincide con el del slot
  IF v_slot.producto_id IS NULL THEN
    RAISE EXCEPTION 'El slot no tiene un producto asignado';
  END IF;
  
  IF v_slot.producto_id != p_producto_id THEN
    RAISE EXCEPTION 'El producto no coincide con el asignado al slot';
  END IF;
  
  -- Obtener información del producto
  SELECT * INTO v_producto
  FROM productos
  WHERE id = p_producto_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado o inactivo';
  END IF;
  
  -- Calcular precio (usar override del slot si existe, sino precio del producto)
  v_precio_unitario := COALESCE(v_slot.precio_override, v_producto.precio_venta);
  v_precio_total := v_precio_unitario * p_cantidad;
  
  -- Crear la venta en estado borrador
  INSERT INTO ventas_app (
    slot_id,
    user_id,
    producto_id,
    producto_nombre,
    producto_sku,
    cantidad,
    precio_unitario,
    precio_total,
    estado,
    fecha_creacion,
    metadata
  ) VALUES (
    p_slot_id,
    p_user_id,
    p_producto_id,
    v_producto.nombre,
    v_producto.sku,
    p_cantidad,
    v_precio_unitario,
    v_precio_total,
    'borrador',
    NOW(),
    p_metadata
  )
  RETURNING id INTO v_venta_id;
  
  -- Retornar información de la venta creada
  RETURN QUERY
  SELECT 
    v_venta_id,
    v_producto.nombre::VARCHAR,
    v_precio_unitario,
    v_precio_total,
    'borrador'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Función 2: Reservar stock (de borrador a reservado)
-- =====================================================
CREATE OR REPLACE FUNCTION reservar_stock_venta(
  p_venta_id UUID
)
RETURNS TABLE (
  venta_id UUID,
  estado VARCHAR,
  fecha_reserva TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_venta RECORD;
  v_slot RECORD;
BEGIN
  -- Obtener la venta
  SELECT * INTO v_venta
  FROM ventas_app
  WHERE id = p_venta_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venta no encontrada';
  END IF;
  
  -- Verificar estado actual
  IF v_venta.estado != 'borrador' THEN
    RAISE EXCEPTION 'Solo se puede reservar stock de ventas en estado borrador. Estado actual: %', v_venta.estado;
  END IF;
  
  -- Obtener el slot
  SELECT * INTO v_slot
  FROM vending_machine_slots
  WHERE id = v_venta.slot_id
  FOR UPDATE;  -- Lock pesimista
  
  -- Verificar disponibilidad de stock
  IF v_slot.stock_disponible < v_venta.cantidad THEN
    RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', 
      v_slot.stock_disponible, v_venta.cantidad;
  END IF;
  
  -- Actualizar stock del slot (reservar)
  UPDATE vending_machine_slots
  SET 
    stock_disponible = stock_disponible - v_venta.cantidad,
    stock_reservado = stock_reservado + v_venta.cantidad,
    updated_at = NOW()
  WHERE id = v_venta.slot_id;
  
  -- Actualizar estado de la venta
  UPDATE ventas_app
  SET 
    estado = 'reservado',
    fecha_reserva = NOW(),
    updated_at = NOW()
  WHERE id = p_venta_id;
  
  -- Retornar información actualizada
  RETURN QUERY
  SELECT 
    p_venta_id,
    'reservado'::VARCHAR,
    NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Función 3: Confirmar pago (de reservado a pagado)
-- =====================================================
CREATE OR REPLACE FUNCTION confirmar_pago_venta(
  p_venta_id UUID,
  p_payment_id UUID,
  p_tiempo_expiracion_minutos INTEGER DEFAULT NULL
)
RETURNS TABLE (
  venta_id UUID,
  estado VARCHAR,
  codigo_retiro VARCHAR,
  fecha_expiracion TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_venta RECORD;
  v_machine RECORD;
  v_codigo_retiro VARCHAR(10);
  v_fecha_expiracion TIMESTAMP WITH TIME ZONE;
  v_tiempo_expiracion INTEGER;
BEGIN
  -- Obtener la venta
  SELECT * INTO v_venta
  FROM ventas_app
  WHERE id = p_venta_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venta no encontrada';
  END IF;
  
  -- Verificar estado actual
  IF v_venta.estado NOT IN ('borrador', 'reservado') THEN
    RAISE EXCEPTION 'Solo se puede confirmar pago de ventas en estado borrador o reservado. Estado actual: %', v_venta.estado;
  END IF;
  
  -- Si la venta estaba en borrador, reservar stock primero
  IF v_venta.estado = 'borrador' THEN
    PERFORM reservar_stock_venta(p_venta_id);
  END IF;
  
  -- Obtener configuración de tiempo de expiración de la máquina
  SELECT vm.tiempo_expiracion_minutos INTO v_tiempo_expiracion
  FROM vending_machine_slots vms
  JOIN vending_machines vm ON vms.machine_id = vm.id
  WHERE vms.id = v_venta.slot_id;
  
  -- Usar tiempo proporcionado o el de la máquina (default 15 minutos)
  v_tiempo_expiracion := COALESCE(p_tiempo_expiracion_minutos, v_tiempo_expiracion, 15);
  
  -- Calcular fecha de expiración
  v_fecha_expiracion := NOW() + (v_tiempo_expiracion || ' minutes')::INTERVAL;
  
  -- Generar código de retiro único (6 caracteres alfanuméricos)
  v_codigo_retiro := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || p_venta_id::TEXT) FROM 1 FOR 6));
  
  -- Verificar que el código no existe (extremadamente raro, pero por seguridad)
  WHILE EXISTS (SELECT 1 FROM ventas_app WHERE codigo_retiro = v_codigo_retiro) LOOP
    v_codigo_retiro := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || p_venta_id::TEXT || RANDOM()::TEXT) FROM 1 FOR 6));
  END LOOP;
  
  -- Actualizar venta
  UPDATE ventas_app
  SET 
    estado = 'pagado',
    payment_id = p_payment_id,
    fecha_pago = NOW(),
    fecha_expiracion = v_fecha_expiracion,
    codigo_retiro = v_codigo_retiro,
    updated_at = NOW()
  WHERE id = p_venta_id;
  
  -- Retornar información
  RETURN QUERY
  SELECT 
    p_venta_id,
    'pagado'::VARCHAR,
    v_codigo_retiro,
    v_fecha_expiracion;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Función 4: Confirmar retiro (de pagado a completado)
-- =====================================================
CREATE OR REPLACE FUNCTION confirmar_retiro_venta(
  p_venta_id UUID,
  p_codigo_retiro VARCHAR
)
RETURNS TABLE (
  venta_id UUID,
  estado VARCHAR,
  fecha_retiro TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_venta RECORD;
BEGIN
  -- Obtener la venta
  SELECT * INTO v_venta
  FROM ventas_app
  WHERE id = p_venta_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venta no encontrada';
  END IF;
  
  -- Verificar estado actual
  IF v_venta.estado != 'pagado' THEN
    RAISE EXCEPTION 'Solo se puede confirmar retiro de ventas en estado pagado. Estado actual: %', v_venta.estado;
  END IF;
  
  -- Verificar código de retiro
  IF v_venta.codigo_retiro != p_codigo_retiro THEN
    RAISE EXCEPTION 'Código de retiro incorrecto';
  END IF;
  
  -- Verificar que no haya expirado
  IF v_venta.fecha_expiracion < NOW() THEN
    RAISE EXCEPTION 'La venta ha expirado. Debe solicitar reembolso.';
  END IF;
  
  -- Consumir stock reservado (mover de reservado a consumido)
  UPDATE vending_machine_slots
  SET 
    stock_reservado = stock_reservado - v_venta.cantidad,
    -- No actualizamos stock_total aquí porque ya se consumió
    updated_at = NOW()
  WHERE id = v_venta.slot_id;
  
  -- Actualizar venta
  UPDATE ventas_app
  SET 
    estado = 'completado',
    fecha_retiro = NOW(),
    updated_at = NOW()
  WHERE id = p_venta_id;
  
  -- Retornar información
  RETURN QUERY
  SELECT 
    p_venta_id,
    'completado'::VARCHAR,
    NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Función 5: Cancelar venta (liberar stock si estaba reservado)
-- =====================================================
CREATE OR REPLACE FUNCTION cancelar_venta(
  p_venta_id UUID,
  p_motivo TEXT DEFAULT NULL
)
RETURNS TABLE (
  venta_id UUID,
  estado VARCHAR,
  stock_liberado INTEGER
) AS $$
DECLARE
  v_venta RECORD;
  v_stock_a_liberar INTEGER := 0;
BEGIN
  -- Obtener la venta
  SELECT * INTO v_venta
  FROM ventas_app
  WHERE id = p_venta_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venta no encontrada';
  END IF;
  
  -- Verificar que se puede cancelar
  IF v_venta.estado IN ('completado', 'cancelado', 'expirado') THEN
    RAISE EXCEPTION 'No se puede cancelar una venta en estado: %', v_venta.estado;
  END IF;
  
  -- Si la venta estaba reservada o pagada, liberar el stock
  IF v_venta.estado IN ('reservado', 'pagado') THEN
    v_stock_a_liberar := v_venta.cantidad;
    
    UPDATE vending_machine_slots
    SET 
      stock_disponible = stock_disponible + v_venta.cantidad,
      stock_reservado = stock_reservado - v_venta.cantidad,
      updated_at = NOW()
    WHERE id = v_venta.slot_id;
  END IF;
  
  -- Actualizar venta
  UPDATE ventas_app
  SET 
    estado = 'cancelado',
    fecha_cancelacion = NOW(),
    notas = COALESCE(notas, '') || 
      CASE WHEN p_motivo IS NOT NULL 
        THEN E'\nMotivo cancelación: ' || p_motivo 
        ELSE '' 
      END,
    updated_at = NOW()
  WHERE id = p_venta_id;
  
  -- Retornar información
  RETURN QUERY
  SELECT 
    p_venta_id,
    'cancelado'::VARCHAR,
    v_stock_a_liberar;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Función 6: Liberar stock de ventas expiradas
-- (Ejecutar periódicamente, ej: cada minuto via cron job)
-- =====================================================
CREATE OR REPLACE FUNCTION liberar_stock_expirado()
RETURNS TABLE (
  ventas_expiradas INTEGER,
  stock_liberado INTEGER
) AS $$
DECLARE
  v_ventas_expiradas INTEGER;
  v_stock_liberado INTEGER;
BEGIN
  -- Contar ventas que van a expirar
  SELECT COUNT(*) INTO v_ventas_expiradas
  FROM ventas_app
  WHERE estado = 'pagado'
    AND fecha_expiracion < NOW();
  
  -- Liberar stock de slots
  WITH ventas_a_expirar AS (
    SELECT slot_id, SUM(cantidad) as total_cantidad
    FROM ventas_app
    WHERE estado = 'pagado'
      AND fecha_expiracion < NOW()
    GROUP BY slot_id
  )
  UPDATE vending_machine_slots vms
  SET 
    stock_disponible = stock_disponible + vae.total_cantidad,
    stock_reservado = stock_reservado - vae.total_cantidad,
    updated_at = NOW()
  FROM ventas_a_expirar vae
  WHERE vms.id = vae.slot_id;
  
  -- Obtener total de stock liberado
  SELECT COALESCE(SUM(cantidad), 0) INTO v_stock_liberado
  FROM ventas_app
  WHERE estado = 'pagado'
    AND fecha_expiracion < NOW();
  
  -- Marcar ventas como expiradas
  UPDATE ventas_app
  SET 
    estado = 'expirado',
    updated_at = NOW()
  WHERE estado = 'pagado'
    AND fecha_expiracion < NOW();
  
  -- Retornar estadísticas
  RETURN QUERY
  SELECT v_ventas_expiradas, v_stock_liberado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Función 7: Obtener ventas activas de un usuario
-- =====================================================
CREATE OR REPLACE FUNCTION get_ventas_activas_usuario(
  p_user_id UUID
)
RETURNS TABLE (
  venta_id UUID,
  slot_id UUID,
  producto_nombre VARCHAR,
  cantidad INTEGER,
  precio_total INTEGER,
  estado VARCHAR,
  codigo_retiro VARCHAR,
  fecha_expiracion TIMESTAMP WITH TIME ZONE,
  tiempo_restante_minutos INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    va.id,
    va.slot_id,
    va.producto_nombre,
    va.cantidad,
    va.precio_total,
    va.estado,
    va.codigo_retiro,
    va.fecha_expiracion,
    CASE 
      WHEN va.fecha_expiracion IS NOT NULL AND va.estado = 'pagado'
      THEN GREATEST(0, EXTRACT(EPOCH FROM (va.fecha_expiracion - NOW())) / 60)::INTEGER
      ELSE NULL
    END as tiempo_restante_minutos
  FROM ventas_app va
  WHERE va.user_id = p_user_id
    AND va.estado IN ('reservado', 'pagado')
  ORDER BY va.fecha_creacion DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comentarios de documentación
-- =====================================================
COMMENT ON FUNCTION crear_venta_app IS 'Crea una nueva venta en estado borrador';
COMMENT ON FUNCTION reservar_stock_venta IS 'Reserva stock para una venta (de borrador a reservado)';
COMMENT ON FUNCTION confirmar_pago_venta IS 'Confirma el pago de una venta (de reservado a pagado) y genera código de retiro';
COMMENT ON FUNCTION confirmar_retiro_venta IS 'Confirma el retiro físico del producto (de pagado a completado)';
COMMENT ON FUNCTION cancelar_venta IS 'Cancela una venta y libera el stock si estaba reservado';
COMMENT ON FUNCTION liberar_stock_expirado IS 'Libera stock de ventas expiradas (ejecutar periódicamente)';
COMMENT ON FUNCTION get_ventas_activas_usuario IS 'Obtiene ventas activas (reservado/pagado) de un usuario';

-- =====================================================
-- Permisos para funciones
-- =====================================================
GRANT EXECUTE ON FUNCTION crear_venta_app TO authenticated;
GRANT EXECUTE ON FUNCTION reservar_stock_venta TO authenticated;
GRANT EXECUTE ON FUNCTION confirmar_pago_venta TO authenticated;
GRANT EXECUTE ON FUNCTION confirmar_retiro_venta TO authenticated;
GRANT EXECUTE ON FUNCTION cancelar_venta TO authenticated;
GRANT EXECUTE ON FUNCTION get_ventas_activas_usuario TO authenticated;
-- liberar_stock_expirado solo para admin (ejecutar via cron job)
GRANT EXECUTE ON FUNCTION liberar_stock_expirado TO service_role;
