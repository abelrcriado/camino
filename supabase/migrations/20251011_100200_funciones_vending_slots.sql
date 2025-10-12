-- ============================================================================
-- Sprint 3.2: Vending Machine Slots
-- Migración: Funciones para gestión de slots
-- Fecha: 2025-10-11
-- ============================================================================

-- ============================================================================
-- 1. FUNCIÓN: create_slots_for_machine
-- Descripción: Crea slots automáticamente para una máquina vending
-- ============================================================================

CREATE OR REPLACE FUNCTION create_slots_for_machine(
  p_machine_id UUID,
  p_num_slots INTEGER,
  p_capacidad_maxima INTEGER DEFAULT 10
) RETURNS INTEGER AS $$
DECLARE
  v_slot_number INTEGER;
  v_created_count INTEGER := 0;
BEGIN
  -- Validar parámetros
  IF p_num_slots <= 0 OR p_num_slots > 100 THEN
    RAISE EXCEPTION 'Número de slots debe estar entre 1 y 100';
  END IF;
  
  IF p_capacidad_maxima <= 0 THEN
    RAISE EXCEPTION 'Capacidad máxima debe ser mayor a 0';
  END IF;
  
  -- Verificar que la máquina existe
  IF NOT EXISTS (SELECT 1 FROM vending_machines WHERE id = p_machine_id) THEN
    RAISE EXCEPTION 'Máquina con ID % no encontrada', p_machine_id;
  END IF;
  
  -- Crear slots
  FOR v_slot_number IN 1..p_num_slots LOOP
    INSERT INTO vending_machine_slots (
      machine_id,
      slot_number,
      capacidad_maxima,
      stock_disponible,
      stock_reservado,
      activo
    ) VALUES (
      p_machine_id,
      v_slot_number,
      p_capacidad_maxima,
      0,
      0,
      true
    )
    ON CONFLICT (machine_id, slot_number) DO NOTHING;
    
    IF FOUND THEN
      v_created_count := v_created_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_created_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_slots_for_machine IS 'Crea slots automáticamente para una máquina vending';

-- ============================================================================
-- 2. FUNCIÓN: asignar_producto_a_slot
-- Descripción: Asigna un producto a un slot y establece stock inicial
-- ============================================================================

CREATE OR REPLACE FUNCTION asignar_producto_a_slot(
  p_slot_id UUID,
  p_producto_id UUID,
  p_stock_inicial INTEGER
) RETURNS vending_machine_slots AS $$
DECLARE
  v_slot vending_machine_slots;
  v_capacidad INTEGER;
BEGIN
  -- Obtener capacidad del slot
  SELECT capacidad_maxima INTO v_capacidad
  FROM vending_machine_slots
  WHERE id = p_slot_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot con ID % no encontrado', p_slot_id;
  END IF;
  
  -- Validar stock inicial
  IF p_stock_inicial < 0 OR p_stock_inicial > v_capacidad THEN
    RAISE EXCEPTION 'Stock inicial % inválido (capacidad: %)', p_stock_inicial, v_capacidad;
  END IF;
  
  -- Verificar que el producto existe
  IF NOT EXISTS (SELECT 1 FROM productos WHERE id = p_producto_id AND is_active = true) THEN
    RAISE EXCEPTION 'Producto con ID % no encontrado o inactivo', p_producto_id;
  END IF;
  
  -- Actualizar slot
  UPDATE vending_machine_slots
  SET 
    producto_id = p_producto_id,
    stock_disponible = p_stock_inicial,
    stock_reservado = 0,
    activo = true,
    updated_at = NOW()
  WHERE id = p_slot_id
  RETURNING * INTO v_slot;
  
  RETURN v_slot;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION asignar_producto_a_slot IS 'Asigna un producto a un slot con stock inicial';

-- ============================================================================
-- 3. FUNCIÓN: get_stock_disponible_slot
-- Descripción: Obtiene el stock disponible de un slot específico
-- ============================================================================

CREATE OR REPLACE FUNCTION get_stock_disponible_slot(
  p_slot_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_stock_disponible INTEGER;
BEGIN
  SELECT stock_disponible INTO v_stock_disponible
  FROM vending_machine_slots
  WHERE id = p_slot_id AND activo = true;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  RETURN COALESCE(v_stock_disponible, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_stock_disponible_slot IS 'Retorna el stock disponible de un slot (0 si no existe o está inactivo)';

-- ============================================================================
-- 4. FUNCIÓN: reservar_stock_slot
-- Descripción: Reserva unidades de un slot (mueve de disponible a reservado)
-- ============================================================================

CREATE OR REPLACE FUNCTION reservar_stock_slot(
  p_slot_id UUID,
  p_cantidad INTEGER
) RETURNS vending_machine_slots AS $$
DECLARE
  v_slot vending_machine_slots;
  v_stock_actual INTEGER;
BEGIN
  -- Validar cantidad
  IF p_cantidad <= 0 THEN
    RAISE EXCEPTION 'Cantidad debe ser mayor a 0';
  END IF;
  
  -- Obtener slot con lock
  SELECT * INTO v_slot
  FROM vending_machine_slots
  WHERE id = p_slot_id AND activo = true
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot con ID % no encontrado o inactivo', p_slot_id;
  END IF;
  
  -- Verificar stock disponible
  IF v_slot.stock_disponible < p_cantidad THEN
    RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', 
      v_slot.stock_disponible, p_cantidad;
  END IF;
  
  -- Mover stock de disponible a reservado
  UPDATE vending_machine_slots
  SET 
    stock_disponible = stock_disponible - p_cantidad,
    stock_reservado = stock_reservado + p_cantidad,
    updated_at = NOW()
  WHERE id = p_slot_id
  RETURNING * INTO v_slot;
  
  RETURN v_slot;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reservar_stock_slot IS 'Reserva unidades de stock en un slot (mueve de disponible a reservado)';

-- ============================================================================
-- 5. FUNCIÓN: liberar_stock_slot
-- Descripción: Libera unidades reservadas (mueve de reservado a disponible)
-- ============================================================================

CREATE OR REPLACE FUNCTION liberar_stock_slot(
  p_slot_id UUID,
  p_cantidad INTEGER
) RETURNS vending_machine_slots AS $$
DECLARE
  v_slot vending_machine_slots;
BEGIN
  -- Validar cantidad
  IF p_cantidad <= 0 THEN
    RAISE EXCEPTION 'Cantidad debe ser mayor a 0';
  END IF;
  
  -- Obtener slot con lock
  SELECT * INTO v_slot
  FROM vending_machine_slots
  WHERE id = p_slot_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot con ID % no encontrado', p_slot_id;
  END IF;
  
  -- Verificar stock reservado
  IF v_slot.stock_reservado < p_cantidad THEN
    RAISE EXCEPTION 'Stock reservado insuficiente. Reservado: %, Solicitado liberar: %', 
      v_slot.stock_reservado, p_cantidad;
  END IF;
  
  -- Mover stock de reservado a disponible
  UPDATE vending_machine_slots
  SET 
    stock_disponible = stock_disponible + p_cantidad,
    stock_reservado = stock_reservado - p_cantidad,
    updated_at = NOW()
  WHERE id = p_slot_id
  RETURNING * INTO v_slot;
  
  RETURN v_slot;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION liberar_stock_slot IS 'Libera stock reservado de un slot (mueve de reservado a disponible)';

-- ============================================================================
-- 6. FUNCIÓN: consumir_stock_slot
-- Descripción: Consume stock reservado (venta confirmada)
-- ============================================================================

CREATE OR REPLACE FUNCTION consumir_stock_slot(
  p_slot_id UUID,
  p_cantidad INTEGER
) RETURNS vending_machine_slots AS $$
DECLARE
  v_slot vending_machine_slots;
BEGIN
  -- Validar cantidad
  IF p_cantidad <= 0 THEN
    RAISE EXCEPTION 'Cantidad debe ser mayor a 0';
  END IF;
  
  -- Obtener slot con lock
  SELECT * INTO v_slot
  FROM vending_machine_slots
  WHERE id = p_slot_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot con ID % no encontrado', p_slot_id;
  END IF;
  
  -- Verificar stock reservado
  IF v_slot.stock_reservado < p_cantidad THEN
    RAISE EXCEPTION 'Stock reservado insuficiente para consumir. Reservado: %, Solicitado: %', 
      v_slot.stock_reservado, p_cantidad;
  END IF;
  
  -- Reducir stock reservado (el stock ya no está disponible ni reservado)
  UPDATE vending_machine_slots
  SET 
    stock_reservado = stock_reservado - p_cantidad,
    updated_at = NOW()
  WHERE id = p_slot_id
  RETURNING * INTO v_slot;
  
  RETURN v_slot;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION consumir_stock_slot IS 'Consume stock reservado de un slot (venta confirmada)';

-- ============================================================================
-- 7. VISTA: v_vending_machine_slots_full
-- Descripción: Vista completa de slots con información de máquina y producto
-- ============================================================================

CREATE OR REPLACE VIEW v_vending_machine_slots_full AS
SELECT 
  s.id,
  s.machine_id,
  s.slot_number,
  s.producto_id,
  s.capacidad_maxima,
  s.stock_disponible,
  s.stock_reservado,
  (s.stock_disponible + s.stock_reservado) AS stock_total,
  s.precio_override,
  s.activo,
  s.notas,
  s.created_at,
  s.updated_at,
  
  -- Información de la máquina
  vm.name AS machine_name,
  vm.service_point_id,
  vm.status AS machine_status,
  vm.politica_reserva,
  vm.tiempo_expiracion_minutos,
  
  -- Información del producto
  p.sku AS producto_sku,
  p.nombre AS producto_nombre,
  p.precio_venta AS producto_precio_venta,
  p.unidad_medida AS producto_unidad_medida,
  p.is_active AS producto_activo,
  
  -- Precio efectivo (override o producto)
  COALESCE(s.precio_override, p.precio_venta) AS precio_efectivo
  
FROM vending_machine_slots s
INNER JOIN vending_machines vm ON s.machine_id = vm.id
LEFT JOIN productos p ON s.producto_id = p.id;

COMMENT ON VIEW v_vending_machine_slots_full IS 'Vista completa de slots con información de máquina y producto';

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION create_slots_for_machine TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION asignar_producto_a_slot TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_stock_disponible_slot TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION reservar_stock_slot TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION liberar_stock_slot TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION consumir_stock_slot TO authenticated, service_role;

GRANT SELECT ON v_vending_machine_slots_full TO authenticated, service_role, anon;

-- ============================================================================
-- FIN MIGRACIÓN
-- ============================================================================
