// Configuración de Swagger/OpenAPI
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Camiño Service Network API",
      version: "1.0.0",
      description:
        "API REST para la plataforma Camiño Service Network - Sistema de gestión de puntos de servicio para ciclistas en el Camino de Santiago",
      contact: {
        name: "Camiño Service Network",
        url: "https://camino-service.network",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
      {
        url: "https://api.camino-service.network",
        description: "Servidor de producción",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Endpoint de salud de la API",
      },
      {
        name: "Geolocation",
        description: "Servicios de geolocalización y búsqueda espacial de CSPs",
      },
      {
        name: "Availability",
        description: "Gestión de disponibilidad, horarios y servicios de CSPs",
      },
      {
        name: "Bookings",
        description: "Operaciones relacionadas con reservas de servicios",
      },
      {
        name: "Users",
        description: "Gestión de perfiles y usuarios",
      },
      {
        name: "CSPs",
        description: "Camino Service Points - Puntos de servicio",
      },
      {
        name: "Workshops",
        description: "Gestión de talleres de reparación",
      },
      {
        name: "Reviews",
        description: "Reseñas y valoraciones de servicios",
      },
      {
        name: "Favorites",
        description: "Gestión de favoritos de usuarios",
      },
      {
        name: "Payments",
        description: "Gestión de pagos y transacciones",
      },
      {
        name: "Inventory",
        description: "Gestión de inventario y stock",
      },
      {
        name: "Partners",
        description: "Gestión de socios y colaboradores",
      },
      {
        name: "Reports",
        description: "Reportes y análisis del sistema",
      },
      {
        name: "Operations",
        description: "Gestión operativa y equipamiento",
      },
    ],
    components: {
      schemas: {
        Booking: {
          type: "object",
          required: [
            "user_id",
            "service_point_id",
            "workshop_id",
            "start_time",
            "end_time",
          ],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del booking",
              example: "5a480c1a-7a20-4325-b682-c0eed8ae10a1",
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID del usuario que realiza la reserva",
              example: "00000000-0000-0000-0000-000000000001",
            },
            service_point_id: {
              type: "string",
              format: "uuid",
              description: "ID del punto de servicio",
              example: "00000000-0000-0000-0000-000000000100",
            },
            workshop_id: {
              type: "string",
              format: "uuid",
              description: "ID del taller",
              example: "00000000-0000-0000-0000-000000001000",
            },
            start_time: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de inicio del servicio",
              example: "2025-10-20T10:00:00Z",
            },
            end_time: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de fin del servicio",
              example: "2025-10-20T11:30:00Z",
            },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
              description: "Estado actual de la reserva",
              example: "pending",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación del registro",
              example: "2025-10-08T22:13:17.454573Z",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
              example: "2025-10-08T22:13:17.454573Z",
            },
          },
        },
        BookingInput: {
          type: "object",
          required: [
            "user_id",
            "service_point_id",
            "workshop_id",
            "start_time",
            "end_time",
          ],
          properties: {
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID del usuario que realiza la reserva",
              example: "00000000-0000-0000-0000-000000000001",
            },
            service_point_id: {
              type: "string",
              format: "uuid",
              description: "ID del punto de servicio",
              example: "00000000-0000-0000-0000-000000000100",
            },
            workshop_id: {
              type: "string",
              format: "uuid",
              description: "ID del taller",
              example: "00000000-0000-0000-0000-000000001000",
            },
            start_time: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de inicio del servicio",
              example: "2025-10-20T10:00:00Z",
            },
            end_time: {
              type: "string",
              format: "date-time",
              description:
                "Fecha y hora de fin del servicio (debe ser posterior a start_time)",
              example: "2025-10-20T11:30:00Z",
            },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
              description:
                "Estado inicial de la reserva (opcional, default: 'pending')",
              example: "pending",
            },
          },
        },
        BookingUpdate: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID del booking a actualizar",
              example: "5a480c1a-7a20-4325-b682-c0eed8ae10a1",
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID del usuario",
              example: "00000000-0000-0000-0000-000000000001",
            },
            service_point_id: {
              type: "string",
              format: "uuid",
              description: "ID del punto de servicio",
              example: "00000000-0000-0000-0000-000000000100",
            },
            workshop_id: {
              type: "string",
              format: "uuid",
              description: "ID del taller",
              example: "00000000-0000-0000-0000-000000001000",
            },
            start_time: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de inicio del servicio",
              example: "2025-10-20T10:00:00Z",
            },
            end_time: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de fin del servicio",
              example: "2025-10-20T11:30:00Z",
            },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
              description: "Estado de la reserva",
              example: "confirmed",
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              description: "Página actual",
              example: 1,
            },
            limit: {
              type: "integer",
              description: "Resultados por página",
              example: 10,
            },
            total: {
              type: "integer",
              description: "Total de resultados",
              example: 42,
            },
            totalPages: {
              type: "integer",
              description: "Total de páginas",
              example: 5,
            },
            hasMore: {
              type: "boolean",
              description: "Indica si hay más páginas disponibles",
              example: true,
            },
          },
        },
        BookingListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Booking",
              },
            },
            pagination: {
              $ref: "#/components/schemas/Pagination",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            field: {
              type: "string",
              description: "Campo con error de validación",
              example: "user_id",
            },
            message: {
              type: "string",
              description: "Mensaje descriptivo del error",
              example: "El campo 'user_id' debe ser un UUID válido",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Mensaje de error",
              example: "Errores de validación",
            },
            details: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ValidationError",
              },
            },
          },
        },
        Profile: {
          type: "object",
          required: ["id", "email"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID del usuario (mismo que en auth.users)",
              example: "00000000-0000-0000-0000-000000000001",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
              example: "usuario@example.com",
            },
            full_name: {
              type: "string",
              description: "Nombre completo del usuario",
              example: "Juan Pérez",
            },
            avatar_url: {
              type: "string",
              format: "uri",
              description: "URL del avatar",
              example: "https://example.com/avatar.jpg",
            },
            phone: {
              type: "string",
              description: "Teléfono de contacto",
              example: "+34 600 123 456",
            },
            preferred_language: {
              type: "string",
              description: "Idioma preferido",
              example: "es",
              default: "es",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        CSP: {
          type: "object",
          required: ["name", "location_lat", "location_lng", "city"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del CSP",
            },
            name: {
              type: "string",
              description: "Nombre del punto de servicio",
              example: "CSP Santiago de Compostela Centro",
            },
            location_lat: {
              type: "number",
              format: "double",
              description: "Latitud de la ubicación",
              example: 42.8782,
            },
            location_lng: {
              type: "number",
              format: "double",
              description: "Longitud de la ubicación",
              example: -8.5448,
            },
            address: {
              type: "string",
              description: "Dirección completa",
              example: "Rúa do Franco, 5",
            },
            city: {
              type: "string",
              description: "Ciudad",
              example: "Santiago de Compostela",
            },
            country: {
              type: "string",
              description: "País",
              example: "ES",
              default: "ES",
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "maintenance"],
              description: "Estado del CSP",
              example: "active",
              default: "active",
            },
            capacity: {
              type: "integer",
              description: "Capacidad de atención simultánea",
              example: 10,
              default: 10,
            },
            services_offered: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Servicios ofrecidos",
              example: [
                "reparacion_basica",
                "mantenimiento",
                "alquiler_bicicleta",
              ],
            },
            opening_hours: {
              type: "object",
              description: "Horarios de apertura (formato JSON)",
              example: {
                lunes: "09:00-18:00",
                martes: "09:00-18:00",
              },
            },
            contact_email: {
              type: "string",
              format: "email",
              description: "Email de contacto",
            },
            contact_phone: {
              type: "string",
              description: "Teléfono de contacto",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        CSPWithDistance: {
          allOf: [
            { $ref: "#/components/schemas/CSP" },
            {
              type: "object",
              properties: {
                distance_km: {
                  type: "number",
                  format: "double",
                  description:
                    "Distancia en kilómetros desde el punto de referencia",
                  example: 2.45,
                },
              },
            },
          ],
        },
        Coordinates: {
          type: "object",
          required: ["latitude", "longitude"],
          properties: {
            latitude: {
              type: "number",
              format: "double",
              description: "Latitud (-90 a 90)",
              example: 42.8782,
              minimum: -90,
              maximum: 90,
            },
            longitude: {
              type: "number",
              format: "double",
              description: "Longitud (-180 a 180)",
              example: -8.5448,
              minimum: -180,
              maximum: 180,
            },
          },
        },
        RoutePoint: {
          type: "object",
          required: ["latitude", "longitude", "order"],
          properties: {
            latitude: {
              type: "number",
              format: "double",
              description: "Latitud del punto de la ruta",
              example: 42.8782,
            },
            longitude: {
              type: "number",
              format: "double",
              description: "Longitud del punto de la ruta",
              example: -8.5448,
            },
            order: {
              type: "integer",
              description: "Orden del punto en la ruta (empezando desde 0)",
              example: 0,
              minimum: 0,
            },
          },
        },
        OpeningHours: {
          type: "object",
          required: ["day_of_week", "open_time", "close_time"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del horario",
            },
            csp_id: {
              type: "string",
              format: "uuid",
              description: "ID del CSP",
            },
            day_of_week: {
              type: "integer",
              description: "Día de la semana (0=Domingo, 6=Sábado)",
              example: 1,
              minimum: 0,
              maximum: 6,
            },
            open_time: {
              type: "string",
              pattern: "^([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$",
              description: "Hora de apertura (HH:MM:SS)",
              example: "09:00:00",
            },
            close_time: {
              type: "string",
              pattern: "^([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$",
              description: "Hora de cierre (HH:MM:SS)",
              example: "18:00:00",
            },
            is_closed: {
              type: "boolean",
              description: "Si el CSP está cerrado este día",
              default: false,
            },
          },
        },
        SpecialClosure: {
          type: "object",
          required: ["start_date", "end_date", "reason"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del cierre",
            },
            csp_id: {
              type: "string",
              format: "uuid",
              description: "ID del CSP",
            },
            start_date: {
              type: "string",
              format: "date",
              description: "Fecha de inicio del cierre (YYYY-MM-DD)",
              example: "2025-12-25",
            },
            end_date: {
              type: "string",
              format: "date",
              description: "Fecha de fin del cierre (YYYY-MM-DD)",
              example: "2025-12-26",
            },
            reason: {
              type: "string",
              description: "Razón del cierre",
              example: "Vacaciones de Navidad",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
          },
        },
        ServiceAvailability: {
          type: "object",
          required: ["service_type", "is_available"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único de disponibilidad del servicio",
            },
            csp_id: {
              type: "string",
              format: "uuid",
              description: "ID del CSP",
            },
            service_type: {
              type: "string",
              description: "Tipo de servicio",
              example: "workshop",
            },
            is_available: {
              type: "boolean",
              description: "Si el servicio está disponible",
              example: true,
            },
            available_slots: {
              type: "integer",
              description: "Slots disponibles",
              example: 3,
              minimum: 0,
            },
            next_available: {
              type: "string",
              format: "date-time",
              description: "Próxima disponibilidad",
              example: "2025-01-20T10:00:00Z",
            },
            unavailable_reason: {
              type: "string",
              description: "Razón de no disponibilidad",
              example: "Fully booked",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        CSPAvailabilityStatus: {
          type: "object",
          properties: {
            csp_id: {
              type: "string",
              format: "uuid",
              description: "ID del CSP",
            },
            is_open: {
              type: "boolean",
              description: "Si el CSP está abierto actualmente",
              example: true,
            },
            current_status: {
              type: "string",
              enum: ["open", "closed", "special_closure"],
              description: "Estado actual del CSP",
              example: "open",
            },
            next_opening: {
              type: "string",
              format: "date-time",
              description: "Próxima apertura (si está cerrado)",
              example: "2025-01-20T09:00:00Z",
            },
            next_closing: {
              type: "string",
              format: "date-time",
              description: "Próximo cierre (si está abierto)",
              example: "2025-01-19T18:00:00Z",
            },
            services: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ServiceAvailability",
              },
              description: "Disponibilidad de servicios",
            },
            special_closures: {
              type: "array",
              items: {
                $ref: "#/components/schemas/SpecialClosure",
              },
              description: "Cierres especiales activos o próximos",
            },
          },
        },
        Workshop: {
          type: "object",
          required: ["name", "service_point_id"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del taller",
            },
            name: {
              type: "string",
              description: "Nombre del taller",
              example: "Taller Principal",
            },
            service_point_id: {
              type: "string",
              format: "uuid",
              description: "ID del punto de servicio al que pertenece",
            },
            description: {
              type: "string",
              description: "Descripción del taller",
            },
            specialties: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Especialidades del taller",
              example: [
                "reparacion_ruedas",
                "ajuste_frenos",
                "mantenimiento_transmision",
              ],
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "maintenance"],
              description: "Estado del taller",
              example: "active",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        Review: {
          type: "object",
          required: ["user_id", "service_point_id", "rating"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único de la reseña",
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID del usuario que hace la reseña",
            },
            service_point_id: {
              type: "string",
              format: "uuid",
              description: "ID del punto de servicio reseñado",
            },
            workshop_id: {
              type: "string",
              format: "uuid",
              description: "ID del taller reseñado (opcional)",
            },
            rating: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              description: "Calificación de 1 a 5 estrellas",
              example: 5,
            },
            comment: {
              type: "string",
              description: "Comentario opcional de la reseña",
              example: "Excelente servicio, muy rápido y profesional",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        Favorite: {
          type: "object",
          required: ["user_id", "service_point_id"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del favorito",
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID del usuario",
            },
            service_point_id: {
              type: "string",
              format: "uuid",
              description: "ID del punto de servicio marcado como favorito",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
          },
        },
        Payment: {
          type: "object",
          required: ["user_id", "booking_id", "amount", "payment_method"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del pago",
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID del usuario que realiza el pago",
            },
            booking_id: {
              type: "string",
              format: "uuid",
              description: "ID de la reserva asociada",
            },
            amount: {
              type: "number",
              format: "decimal",
              description: "Monto del pago",
              example: 25.5,
            },
            payment_method: {
              type: "string",
              enum: ["card", "cash", "app", "other"],
              description: "Método de pago utilizado",
              example: "card",
            },
            status: {
              type: "string",
              enum: ["pending", "completed", "failed", "refunded"],
              description: "Estado del pago",
              example: "completed",
            },
            transaction_id: {
              type: "string",
              description: "ID de transacción externa (opcional)",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        Inventory: {
          type: "object",
          required: ["service_point_id", "item_type"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del inventario",
            },
            service_point_id: {
              type: "string",
              format: "uuid",
              description: "ID del punto de servicio",
            },
            item_type: {
              type: "string",
              description: "Tipo de ítem en inventario",
              example: "spare_part",
            },
            quantity: {
              type: "integer",
              description: "Cantidad disponible",
              example: 50,
            },
            min_threshold: {
              type: "integer",
              description: "Umbral mínimo de stock",
              example: 10,
            },
            status: {
              type: "string",
              enum: ["available", "low", "out_of_stock"],
              description: "Estado del stock",
              example: "available",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        InventoryItem: {
          type: "object",
          required: ["inventory_id", "name"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del ítem",
            },
            inventory_id: {
              type: "string",
              format: "uuid",
              description: "ID del inventario padre",
            },
            name: {
              type: "string",
              description: "Nombre del ítem",
              example: 'Cámara de aire 26"',
            },
            sku: {
              type: "string",
              description: "SKU o código del producto",
              example: "CAM-26-001",
            },
            price: {
              type: "number",
              format: "decimal",
              description: "Precio unitario",
              example: 8.5,
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        Partner: {
          type: "object",
          required: ["name", "type"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del socio",
            },
            name: {
              type: "string",
              description: "Nombre del socio o empresa",
              example: "Bicicletas García S.L.",
            },
            type: {
              type: "string",
              enum: ["supplier", "sponsor", "collaborator", "other"],
              description: "Tipo de socio",
              example: "supplier",
            },
            contact_email: {
              type: "string",
              format: "email",
              description: "Email de contacto",
              example: "contacto@bicicletasgarcia.com",
            },
            contact_phone: {
              type: "string",
              description: "Teléfono de contacto",
              example: "+34 666 777 888",
            },
            status: {
              type: "string",
              enum: ["active", "inactive"],
              description: "Estado del socio",
              example: "active",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        Report: {
          type: "object",
          required: ["report_type", "data"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del reporte",
            },
            report_type: {
              type: "string",
              enum: [
                "usage",
                "revenue",
                "maintenance",
                "user_activity",
                "other",
              ],
              description: "Tipo de reporte",
              example: "usage",
            },
            service_point_id: {
              type: "string",
              format: "uuid",
              description: "ID del punto de servicio (opcional)",
            },
            data: {
              type: "object",
              description: "Datos del reporte en formato JSON",
              example: {
                total_bookings: 150,
                total_revenue: 3750.0,
                period: "2025-01",
              },
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de generación del reporte",
            },
          },
        },
        TallerManager: {
          type: "object",
          required: ["user_id", "workshop_id"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del gestor de taller",
            },
            user_id: {
              type: "string",
              format: "uuid",
              description: "ID del usuario gestor",
            },
            workshop_id: {
              type: "string",
              format: "uuid",
              description: "ID del taller gestionado",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Permisos del gestor",
              example: ["manage_bookings", "view_reports", "manage_inventory"],
            },
            status: {
              type: "string",
              enum: ["active", "inactive"],
              description: "Estado del gestor",
              example: "active",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        VendingMachine: {
          type: "object",
          required: ["service_point_id", "machine_type"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único de la máquina vending",
            },
            service_point_id: {
              type: "string",
              format: "uuid",
              description: "ID del punto de servicio",
            },
            machine_type: {
              type: "string",
              enum: ["parts", "accessories", "beverages", "tools", "other"],
              description: "Tipo de máquina vending",
              example: "parts",
            },
            status: {
              type: "string",
              enum: ["operational", "maintenance", "out_of_service"],
              description: "Estado de la máquina",
              example: "operational",
            },
            inventory_level: {
              type: "integer",
              description: "Nivel de inventario actual",
              example: 75,
            },
            last_maintenance: {
              type: "string",
              format: "date-time",
              description: "Fecha del último mantenimiento",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de instalación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
      },
    },
  },
  apis: ["./pages/api/**/*.ts"], // Archivos que contienen anotaciones JSDoc
};

export const swaggerSpec = swaggerJsdoc(options);
