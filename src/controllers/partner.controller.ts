// Controller para manejo de requests HTTP de Partner
import type { NextApiRequest, NextApiResponse } from "next";
import { PartnerService } from "../services/partner.service";
import type { CreatePartnerDto, UpdatePartnerDto } from "../dto/partner.dto";
import {
  createPartnerSchema,
  updatePartnerSchema,
  deletePartnerSchema,
  queryPartnerSchema,
} from "../schemas/partner.schema";

export class PartnerController {
  private service: PartnerService;

  constructor(service?: PartnerService) {
    this.service = service || new PartnerService();
  }

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

  private async getAll(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    // Validar query parameters usando schema centralizado
    const queryValidation = queryPartnerSchema.safeParse(req.query);

    if (!queryValidation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Parámetros de query inválidos",
        details: queryValidation.error.issues,
      });
    }

    const queryData = queryValidation.data || {};
    const { type } = queryData;

    if (type) {
      const partners = await this.service.findByType(type);
      this.logRequest(req, 200, startTime);
      return res.status(200).json(partners);
    }

    const result = await this.service.findAll();
    this.logRequest(req, 200, startTime);
    return res.status(200).json(result.data);
  }

  private async create(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = createPartnerSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: CreatePartnerDto = validation.data;
    const partner = await this.service.createPartner(data);

    this.logRequest(req, 201, startTime);
    return res.status(201).json([partner]);
  }

  private async update(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = updatePartnerSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const data: UpdatePartnerDto = validation.data;
    const partner = await this.service.updatePartner(data);

    this.logRequest(req, 200, startTime);
    return res.status(200).json([partner]);
  }

  private async delete(
    req: NextApiRequest,
    res: NextApiResponse,
    startTime: number
  ): Promise<void> {
    const validation = deletePartnerSchema.safeParse(req.body);

    if (!validation.success) {
      this.logRequest(req, 400, startTime);
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id } = validation.data;

    await this.service.delete(id);

    this.logRequest(req, 204, startTime);
    res.status(204).end();
  }

  private handleError(
    error: unknown,
    res: NextApiResponse,
    startTime: number
  ): void {
    console.error("[PartnerController Error]:", error);

    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ERROR - Duration: ${duration}ms - ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("validación")) {
        return res.status(400).json({ error: error.message });
      }
    }

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }

  private logRequest(
    req: NextApiRequest,
    statusCode: number,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${
        req.url
      } - ${statusCode} - ${duration}ms`
    );
  }
}
