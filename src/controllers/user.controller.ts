// Controller para manejo de requests HTTP de User
import type { NextApiRequest, NextApiResponse } from "next";
import { UserService } from "../services/user.service";
import type { CreateUserDto, UpdateUserDto } from "../dto/user.dto";

// Usar schemas centralizados
import {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  queryUserSchema,
} from "../schemas/user.schema";

export class UserController {
  private service: UserService;

  constructor(service?: UserService) {
    this.service = service || new UserService();
  }

  /**
   * Handler principal que enruta según el método HTTP
   */
  async handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const startTime = Date.now();

    try {
      switch (req.method) {
        case "GET":
          return await this.getAll(req, res, startTime);
        case "POST":
          return await this.create(req, res, startTime);
        case "PUT":
          return await this.update(req, res, startTime);
        case "DELETE":
          return await this.delete(req, res, startTime);
        default:
          res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
          return res.status(405).json({
            error: `Method ${req.method} Not Allowed`,
          });
      }
    } catch (error) {
      return this.handleError(error, res, startTime);
    }
  }

  /**
   * GET - Obtener usuarios con filtros
   */
  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const { email, role } = req.query;

    // Si hay filtro de email, buscar por email específico
    if (email && typeof email === "string") {
      const user = await this.service.findByEmail(email);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(user ? [user] : []);
    }

    // Si hay filtro de rol, buscar por rol
    if (role && typeof role === "string") {
      const users = await this.service.findByRole(role);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(users);
    }

    // Sin filtros, devolver todos
    const result = await this.service.findAll();

    this.logRequest(req, 200, startTime);
    return res.status(200).json(result.data);
  }

  /**
   * POST - Crear nuevo usuario
   */
  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod centralizado
    const validation = createUserSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const userData = validation.data as CreateUserDto;
    const user = await this.service.createUser(userData);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([user]);
  }

  /**
   * PUT - Actualizar usuario existente
   */
  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod centralizado
    const validation = updateUserSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const updateData = validation.data as UpdateUserDto;
    const user = await this.service.updateUser(updateData);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([user]);
  }

  /**
   * DELETE - Eliminar usuario
   */
  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar datos con Zod centralizado
    const validation = deleteUserSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id } = validation.data;
    await this.service.delete(id);

    this.logRequest(req, 200, startTime);
    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    console.error("[UserController] Error:", error);

    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.log(
      JSON.stringify({
        level: "error",
        message: errorMessage,
        duration,
        timestamp: new Date().toISOString(),
      })
    );

    if (errorMessage.includes("not found")) {
      return res.status(404).json({
        error: errorMessage,
      });
    }

    if (
      errorMessage.includes("Validation") ||
      errorMessage.includes("Invalid") ||
      errorMessage.includes("already exists") ||
      errorMessage.includes("must be")
    ) {
      return res.status(400).json({
        error: errorMessage,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }

  /**
   * Logging de requests
   */
  private logRequest(
    req: NextApiRequest,
    statusCode: number,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    console.log(
      JSON.stringify({
        level: "info",
        method: req.method,
        path: "/api/user",
        statusCode,
        duration,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
