import { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "@/api/services/supabase";
import {
  OpeningHours,
  SpecialClosure,
  ServiceAvailability,
  CSPAvailabilityStatus,
  CreateOpeningHoursDto,
  UpdateOpeningHoursDto,
  CreateSpecialClosureDto,
  UpdateSpecialClosureDto,
} from "@/shared/dto/availability.dto";

export class AvailabilityRepository {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || defaultSupabase;
  }

  /**
   * Check if a CSP is currently open
   */
  async isCSPOpenNow(cspId: string, timestamp?: Date): Promise<boolean> {
    const { data, error } = await this.supabase.rpc("is_csp_open_now", {
      p_csp_id: cspId,
      p_timestamp: timestamp?.toISOString() || new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to check if CSP is open: ${error.message}`);
    }

    return data || false;
  }

  /**
   * Get comprehensive availability status for a CSP
   */
  async getCSPAvailabilityStatus(
    cspId: string,
    timestamp?: Date
  ): Promise<CSPAvailabilityStatus | null> {
    const { data: statusData, error: statusError } = await this.supabase.rpc(
      "get_csp_availability_status",
      {
        p_csp_id: cspId,
        p_timestamp: timestamp?.toISOString() || new Date().toISOString(),
      }
    );

    if (statusError) {
      throw new Error(
        `Failed to get CSP availability status: ${statusError.message}`
      );
    }

    if (!statusData || statusData.length === 0) {
      return null;
    }

    const status = statusData[0];

    // Get opening hours
    const openingHours = await this.getOpeningHoursForCSP(cspId);

    // Get services
    const services = await this.getServiceAvailability(cspId);

    // Get special closures
    const specialClosures = await this.getSpecialClosuresForCSP(cspId);

    return {
      csp_id: status.csp_id,
      csp_name: status.csp_name,
      is_open: status.is_open,
      current_status: status.current_status,
      opening_hours: openingHours,
      services,
      special_closures: specialClosures,
    };
  }

  /**
   * Get opening hours for a CSP
   */
  async getOpeningHoursForCSP(cspId: string): Promise<OpeningHours[]> {
    const { data, error } = await this.supabase.rpc(
      "get_opening_hours_for_csp",
      {
        p_csp_id: cspId,
      }
    );

    if (error) {
      throw new Error(`Failed to get opening hours: ${error.message}`);
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      day_of_week: row.day_of_week,
      open_time: row.open_time,
      close_time: row.close_time,
      is_closed: row.is_closed,
    }));
  }

  /**
   * Get service availability for a CSP
   */
  async getServiceAvailability(
    cspId: string,
    serviceType?: string
  ): Promise<ServiceAvailability[]> {
    const { data, error } = await this.supabase.rpc(
      "get_service_availability",
      {
        p_csp_id: cspId,
        p_service_type: serviceType || null,
      }
    );

    if (error) {
      throw new Error(`Failed to get service availability: ${error.message}`);
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      service_id: row.service_id,
      service_name: row.service_name,
      service_type: row.service_type,
      is_available: row.is_available,
      available_slots: row.available_slots,
      next_available: row.next_available,
      unavailable_reason: row.unavailable_reason,
    }));
  }

  /**
   * Get special closures for a CSP
   */
  async getSpecialClosuresForCSP(
    cspId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SpecialClosure[]> {
    const { data, error } = await this.supabase.rpc(
      "get_special_closures_for_csp",
      {
        p_csp_id: cspId,
        p_start_date:
          startDate?.toISOString().split("T")[0] ||
          new Date().toISOString().split("T")[0],
        p_end_date:
          endDate?.toISOString().split("T")[0] ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
      }
    );

    if (error) {
      throw new Error(`Failed to get special closures: ${error.message}`);
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id,
      csp_id: row.csp_id,
      start_date: row.start_date,
      end_date: row.end_date,
      reason: row.reason,
      created_at: row.created_at,
    }));
  }

  /**
   * Check if a time slot is available
   */
  async checkSlotAvailability(
    cspId: string,
    serviceType: string,
    slotTime: Date,
    durationMinutes: number = 60
  ): Promise<boolean> {
    const { data, error } = await this.supabase.rpc("check_slot_availability", {
      p_csp_id: cspId,
      p_service_type: serviceType,
      p_slot_time: slotTime.toISOString(),
      p_duration_minutes: durationMinutes,
    });

    if (error) {
      throw new Error(`Failed to check slot availability: ${error.message}`);
    }

    return data || false;
  }

  /**
   * Create opening hours for a CSP
   */
  async createOpeningHours(dto: CreateOpeningHoursDto): Promise<OpeningHours> {
    const { data, error } = await this.supabase
      .from("opening_hours")
      .insert({
        csp_id: dto.csp_id,
        day_of_week: dto.day_of_week,
        open_time: dto.open_time,
        close_time: dto.close_time,
        is_closed: dto.is_closed || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create opening hours: ${error.message}`);
    }

    return {
      day_of_week: data.day_of_week,
      open_time: data.open_time,
      close_time: data.close_time,
      is_closed: data.is_closed,
    };
  }

  /**
   * Update opening hours
   */
  async updateOpeningHours(dto: UpdateOpeningHoursDto): Promise<OpeningHours> {
    const updates: Record<string, unknown> = {};
    if (dto.open_time !== undefined) updates.open_time = dto.open_time;
    if (dto.close_time !== undefined) updates.close_time = dto.close_time;
    if (dto.is_closed !== undefined) updates.is_closed = dto.is_closed;

    const { data, error } = await this.supabase
      .from("opening_hours")
      .update(updates)
      .eq("id", dto.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update opening hours: ${error.message}`);
    }

    return {
      day_of_week: data.day_of_week,
      open_time: data.open_time,
      close_time: data.close_time,
      is_closed: data.is_closed,
    };
  }

  /**
   * Delete opening hours
   */
  async deleteOpeningHours(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("opening_hours")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete opening hours: ${error.message}`);
    }
  }

  /**
   * Create special closure
   */
  async createSpecialClosure(
    dto: CreateSpecialClosureDto
  ): Promise<SpecialClosure> {
    const { data, error } = await this.supabase
      .from("special_closures")
      .insert({
        csp_id: dto.csp_id,
        start_date: dto.start_date,
        end_date: dto.end_date,
        reason: dto.reason,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create special closure: ${error.message}`);
    }

    return {
      id: data.id,
      csp_id: data.csp_id,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason,
      created_at: data.created_at,
    };
  }

  /**
   * Update special closure
   */
  async updateSpecialClosure(
    dto: UpdateSpecialClosureDto
  ): Promise<SpecialClosure> {
    const updates: Record<string, unknown> = {};
    if (dto.start_date !== undefined) updates.start_date = dto.start_date;
    if (dto.end_date !== undefined) updates.end_date = dto.end_date;
    if (dto.reason !== undefined) updates.reason = dto.reason;

    const { data, error } = await this.supabase
      .from("special_closures")
      .update(updates)
      .eq("id", dto.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update special closure: ${error.message}`);
    }

    return {
      id: data.id,
      csp_id: data.csp_id,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason,
      created_at: data.created_at,
    };
  }

  /**
   * Delete special closure
   */
  async deleteSpecialClosure(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("special_closures")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete special closure: ${error.message}`);
    }
  }

  /**
   * Update service availability
   */
  async updateServiceAvailability(
    serviceId: string,
    updates: {
      is_available?: boolean;
      available_slots?: number;
      next_available?: Date;
      unavailable_reason?: string;
    }
  ): Promise<ServiceAvailability> {
    const updateData: Record<string, unknown> = {};
    if (updates.is_available !== undefined)
      updateData.is_available = updates.is_available;
    if (updates.available_slots !== undefined)
      updateData.available_slots = updates.available_slots;
    if (updates.next_available !== undefined)
      updateData.next_available = updates.next_available.toISOString();
    if (updates.unavailable_reason !== undefined)
      updateData.unavailable_reason = updates.unavailable_reason;

    const { data, error } = await this.supabase
      .from("service_availability")
      .update(updateData)
      .eq("id", serviceId)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to update service availability: ${error.message}`
      );
    }

    return {
      service_id: data.id,
      service_name: data.service_name,
      service_type: data.service_type,
      is_available: data.is_available,
      available_slots: data.available_slots,
      next_available: data.next_available,
      unavailable_reason: data.unavailable_reason,
    };
  }
}
