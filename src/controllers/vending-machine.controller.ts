import { NextApiRequest, NextApiResponse } from "next";
import logger from "@/config/logger";
import { VendingMachineService } from "../services/vending-machine.service";

export class VendingMachineController {
  private vendingMachineService: VendingMachineService;

  constructor() {
    this.vendingMachineService = new VendingMachineService();
  }

  async handle(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      switch (req.method) {
        case "GET":
          if (req.query.id) {
            return await this.getById(req, res);
          }
          return await this.list(req, res);
        case "POST":
          return await this.create(req, res);
        case "PUT":
          return await this.update(req, res);
        case "DELETE":
          return await this.delete(req, res);
        default:
          return res.status(405).json({ message: "Method not allowed" });
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`[VendingMachineController] Error: ${error.message}`);
      logger.error(
        `[VendingMachineController] ${req.method} ${req.url} - 500 (${duration}ms)`
      );
      return res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }

  async list(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const { status, service_point_id } = req.query;

      const filters = {
        status: status as string | undefined,
        service_point_id: service_point_id as string | undefined,
      };

      const machines = await this.vendingMachineService.list(filters);

      const duration = Date.now() - startTime;
      logger.info(
        `[VendingMachineController] GET ${req.url} - 200 (${duration}ms)`
      );

      return res.status(200).json({ machines });
    } catch (error: any) {
      throw error;
    }
  }

  async getById(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const machine = await this.vendingMachineService.getById(id);

      const duration = Date.now() - startTime;
      logger.info(
        `[VendingMachineController] GET ${req.url} - 200 (${duration}ms)`
      );

      return res.status(200).json({ machine });
    } catch (error: any) {
      if (error.message === "Vending machine not found") {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const machine = await this.vendingMachineService.create(req.body);

      const duration = Date.now() - startTime;
      logger.info(
        `[VendingMachineController] POST ${req.url} - 201 (${duration}ms)`
      );

      return res.status(201).json({ machine });
    } catch (error: any) {
      throw error;
    }
  }

  async update(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const machine = await this.vendingMachineService.update(id, req.body);

      const duration = Date.now() - startTime;
      logger.info(
        `[VendingMachineController] PUT ${req.url} - 200 (${duration}ms)`
      );

      return res.status(200).json({ machine });
    } catch (error: any) {
      if (error.message === "Vending machine not found") {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  }

  async delete(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();

    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await this.vendingMachineService.delete(id);

      const duration = Date.now() - startTime;
      logger.info(
        `[VendingMachineController] DELETE ${req.url} - 204 (${duration}ms)`
      );

      return res.status(204).end();
    } catch (error: any) {
      if (error.message === "Vending machine not found") {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  }
}
