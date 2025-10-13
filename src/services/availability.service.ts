import { AvailabilityRepository } from "@/repositories/availability.repository";
import {
  OpeningHours,
  SpecialClosure,
  ServiceAvailability,
  CSPAvailabilityStatus,
} from "@/dto/availability.dto";
import {
  ValidationError,
  BusinessRuleError,
} from "@/errors/custom-errors";

export class AvailabilityService {
  private repository: AvailabilityRepository;

  constructor(repository?: AvailabilityRepository) {
    this.repository = repository || new AvailabilityRepository();
  }

  /**
   * Check if a CSP is currently open
   */
  async isCSPOpen(cspId: string, checkTime?: Date): Promise<boolean> {
    if (!this.isValidUUID(cspId)) {
      throw new ValidationError("Invalid CSP ID format");
    }

    return this.repository.isCSPOpenNow(cspId, checkTime);
  }

  /**
   * Get comprehensive availability status for a CSP
   */
  async getCSPAvailabilityStatus(
    cspId: string,
    checkTime?: Date
  ): Promise<CSPAvailabilityStatus | null> {
    if (!this.isValidUUID(cspId)) {
      throw new ValidationError("Invalid CSP ID format");
    }

    return this.repository.getCSPAvailabilityStatus(cspId, checkTime);
  }

  /**
   * Get opening hours for a CSP
   */
  async getOpeningHours(cspId: string): Promise<OpeningHours[]> {
    if (!this.isValidUUID(cspId)) {
      throw new ValidationError("Invalid CSP ID format");
    }

    return this.repository.getOpeningHoursForCSP(cspId);
  }

  /**
   * Create or update opening hours for a CSP
   */
  async setOpeningHours(
    cspId: string,
    openingHours: Omit<
      OpeningHours,
      "id" | "csp_id" | "created_at" | "updated_at"
    >[]
  ): Promise<OpeningHours[]> {
    if (!this.isValidUUID(cspId)) {
      throw new ValidationError("Invalid CSP ID format");
    }

    // Validate opening hours
    this.validateOpeningHours(openingHours);

    // Delete existing and create new
    const results: OpeningHours[] = [];
    for (const hours of openingHours) {
      const created = await this.repository.createOpeningHours({
        csp_id: cspId,
        ...hours,
      });
      results.push(created);
    }

    return results;
  }

  /**
   * Get special closures for a CSP
   */
  async getSpecialClosures(
    cspId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<SpecialClosure[]> {
    if (!this.isValidUUID(cspId)) {
      throw new ValidationError("Invalid CSP ID format");
    }

    if (fromDate && toDate && fromDate > toDate) {
      throw new BusinessRuleError("fromDate must be before toDate");
    }

    return this.repository.getSpecialClosuresForCSP(cspId, fromDate, toDate);
  }

  /**
   * Create a special closure
   */
  async createSpecialClosure(
    cspId: string,
    closure: Omit<SpecialClosure, "id" | "csp_id" | "created_at" | "updated_at">
  ): Promise<SpecialClosure> {
    if (!this.isValidUUID(cspId)) {
      throw new ValidationError("Invalid CSP ID format");
    }

    // Validate dates
    if (closure.start_date > closure.end_date) {
      throw new BusinessRuleError("start_date must be before or equal to end_date");
    }

    return this.repository.createSpecialClosure({
      csp_id: cspId,
      ...closure,
    });
  }

  /**
   * Delete a special closure
   */
  async deleteSpecialClosure(closureId: string): Promise<void> {
    if (!this.isValidUUID(closureId)) {
      throw new ValidationError("Invalid closure ID format");
    }

    await this.repository.deleteSpecialClosure(closureId);
  }

  /**
   * Get service availability status
   */
  async getServiceAvailability(
    cspId: string,
    serviceType?: string
  ): Promise<ServiceAvailability[]> {
    if (!this.isValidUUID(cspId)) {
      throw new ValidationError("Invalid CSP ID format");
    }

    return this.repository.getServiceAvailability(cspId, serviceType);
  }

  /**
   * Update service availability
   */
  async updateServiceAvailability(
    serviceId: string,
    availability: Partial<{
      is_available: boolean;
      available_slots: number;
      next_available: Date;
      unavailable_reason: string;
    }>
  ): Promise<ServiceAvailability> {
    if (!this.isValidUUID(serviceId)) {
      throw new ValidationError("Invalid service ID format");
    }

    // Validate available_slots
    if (
      availability.available_slots !== undefined &&
      availability.available_slots < 0
    ) {
      throw new BusinessRuleError("available_slots cannot be negative");
    }

    return this.repository.updateServiceAvailability(serviceId, availability);
  }

  /**
   * Get available time slots for a service - Simplified version
   */
  async checkSlotAvailability(
    cspId: string,
    serviceType: string,
    slotTime: Date,
    durationMinutes: number = 60
  ): Promise<boolean> {
    if (!this.isValidUUID(cspId)) {
      throw new ValidationError("Invalid CSP ID format");
    }

    if (!serviceType || serviceType.trim().length === 0) {
      throw new BusinessRuleError("Service type is required");
    }

    if (durationMinutes <= 0 || durationMinutes > 1440) {
      throw new BusinessRuleError("Duration must be between 1 and 1440 minutes");
    }

    return this.repository.checkSlotAvailability(
      cspId,
      serviceType,
      slotTime,
      durationMinutes
    );
  }

  // Private helper methods

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private validateOpeningHours(
    hours: Omit<OpeningHours, "id" | "csp_id" | "created_at" | "updated_at">[]
  ): void {
    for (const hour of hours) {
      // Validate day_of_week
      if (hour.day_of_week < 0 || hour.day_of_week > 6) {
        throw new BusinessRuleError(
          "day_of_week must be between 0 (Sunday) and 6 (Saturday)"
        );
      }

      // Validate times if not closed
      if (!hour.is_closed) {
        if (!hour.open_time || !hour.close_time) {
          throw new BusinessRuleError(
            "open_time and close_time are required when is_closed is false"
          );
        }

        // Validate time format (HH:MM:SS)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        if (!timeRegex.test(hour.open_time)) {
          throw new BusinessRuleError(
            `Invalid open_time format: ${hour.open_time}. Expected HH:MM:SS`
          );
        }
        if (!timeRegex.test(hour.close_time)) {
          throw new BusinessRuleError(
            `Invalid close_time format: ${hour.close_time}. Expected HH:MM:SS`
          );
        }

        // Check that close_time is after open_time
        if (hour.open_time >= hour.close_time) {
          throw new BusinessRuleError("close_time must be after open_time");
        }
      }
    }

    // Check for duplicate days
    const days = hours.map((h) => h.day_of_week);
    const uniqueDays = new Set(days);
    if (days.length !== uniqueDays.size) {
      throw new BusinessRuleError("Duplicate day_of_week values found");
    }
  }
}
