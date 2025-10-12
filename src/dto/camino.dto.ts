// DTOs para Caminos
export interface Camino {
  id: string;
  nombre: string;
  codigo: string;
  zona_operativa?: string;
  region?: string;
  estado_operativo?: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CaminoFilters {
  codigo?: string;
  estado_operativo?: string;
  region?: string;
  zona_operativa?: string;
  [key: string]: string | undefined;
}

export interface CreateCaminoDto {
  nombre: string;
  codigo: string;
  zona_operativa?: string;
  region?: string;
  estado_operativo?: string;
  descripcion?: string;
}

export interface UpdateCaminoDto {
  id: string;
  nombre?: string;
  codigo?: string;
  zona_operativa?: string;
  region?: string;
  estado_operativo?: string;
  descripcion?: string;
}

// Interfaz para estadísticas de camino
export interface CaminoStats {
  camino: {
    id: string;
    nombre: string;
    codigo: string;
    zona_operativa?: string;
    region?: string;
    estado_operativo?: string;
  };
  estadisticas: {
    ubicaciones: number;
    service_points: number;
    usuarios_unicos: number;
  };
  generado_en: string;
}

// Interfaz para ubicaciones con camino
export interface UbicacionFull {
  location_id: string;
  ciudad: string;
  provincia?: string;
  pais?: string;
  latitud?: number;
  longitud?: number;
  codigo_postal?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  camino_id?: string;
  camino_nombre?: string;
  camino_codigo?: string;
  camino_zona?: string;
  camino_region?: string;
  camino_estado?: string;
  service_points_count?: number;
}
