import { NextRequest, NextResponse } from 'next/server';
import logger from "@/config/logger";
import { z } from 'zod';
import { AvailabilityService } from '@/services/availability.service';
import { AvailabilityRepository } from '@/repositories/availability.repository';
import { supabase } from '@/services/supabase';

// Request validation schemas
const cspAvailabilityQuerySchema = z.object({
  check_time: z.string().datetime().optional(),
});

const openingHoursSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  open_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Invalid time format. Expected HH:MM:SS'),
  close_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Invalid time format. Expected HH:MM:SS'),
  is_closed: z.boolean().default(false),
});

const createOpeningHoursSchema = z.object({
  opening_hours: z.array(openingHoursSchema).min(1).max(7),
});

const specialClosureSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD'),
  reason: z.string().min(1),
});

const updateServiceAvailabilitySchema = z.object({
  is_available: z.boolean().optional(),
  available_slots: z.number().min(0).optional(),
  next_available: z.string().datetime().optional(),
  unavailable_reason: z.string().optional(),
});

const checkSlotAvailabilityQuerySchema = z.object({
  service_type: z.string().min(1),
  slot_time: z.string().datetime(),
  duration_minutes: z.string().transform(Number).pipe(z.number().min(1).max(1440)).optional(),
});

export class AvailabilityController {
  private service: AvailabilityService;

  constructor() {
    const repository = new AvailabilityRepository(supabase);
    this.service = new AvailabilityService(repository);
  }

  /**
   * GET /api/csp/:id/availability
   * Get comprehensive availability status for a CSP
   */
  async getCSPAvailability(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id: cspId } = await context.params;
      const { searchParams } = new URL(req.url);
      
      const queryParams = cspAvailabilityQuerySchema.safeParse({
        check_time: searchParams.get('check_time') || undefined,
      });

      if (!queryParams.success) {
        return NextResponse.json(
          { error: 'Invalid query parameters', details: queryParams.error.issues },
          { status: 400 }
        );
      }

      const checkTime = queryParams.data.check_time 
        ? new Date(queryParams.data.check_time)
        : undefined;

      const status = await this.service.getCSPAvailabilityStatus(cspId, checkTime);

      if (!status) {
        return NextResponse.json(
          { error: 'CSP not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(status);
    } catch (error) {
      logger.error('Error getting CSP availability:', error);
      return NextResponse.json(
        { error: 'Failed to get CSP availability', message: (error as Error).message },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/csp/:id/availability/is-open
   * Check if a CSP is currently open
   */
  async checkIfCSPIsOpen(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id: cspId } = await context.params;
      const { searchParams } = new URL(req.url);
      
      const checkTimeStr = searchParams.get('check_time');
      const checkTime = checkTimeStr ? new Date(checkTimeStr) : undefined;

      const isOpen = await this.service.isCSPOpen(cspId, checkTime);

      return NextResponse.json({ 
        csp_id: cspId,
        is_open: isOpen,
        checked_at: (checkTime || new Date()).toISOString(),
      });
    } catch (error) {
      logger.error('Error checking if CSP is open:', error);
      return NextResponse.json(
        { error: 'Failed to check CSP status', message: (error as Error).message },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/csp/:id/availability/opening-hours
   * Get opening hours for a CSP
   */
  async getOpeningHours(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id: cspId } = await context.params;
      const openingHours = await this.service.getOpeningHours(cspId);

      return NextResponse.json({ 
        csp_id: cspId,
        opening_hours: openingHours,
      });
    } catch (error) {
      logger.error('Error getting opening hours:', error);
      return NextResponse.json(
        { error: 'Failed to get opening hours', message: (error as Error).message },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/csp/:id/availability/opening-hours
   * Set opening hours for a CSP
   */
  async setOpeningHours(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id: cspId } = await context.params;
      const body = await req.json();

      const validation = createOpeningHoursSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid request body', details: validation.error.issues },
          { status: 400 }
        );
      }

      const openingHours = await this.service.setOpeningHours(
        cspId,
        validation.data.opening_hours
      );

      return NextResponse.json({ 
        csp_id: cspId,
        opening_hours: openingHours,
      }, { status: 201 });
    } catch (error) {
      logger.error('Error setting opening hours:', error);
      return NextResponse.json(
        { error: 'Failed to set opening hours', message: (error as Error).message },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/csp/:id/availability/closures
   * Get special closures for a CSP
   */
  async getSpecialClosures(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id: cspId } = await context.params;
      const { searchParams } = new URL(req.url);
      
      const fromDateStr = searchParams.get('from_date');
      const toDateStr = searchParams.get('to_date');

      const fromDate = fromDateStr ? new Date(fromDateStr) : undefined;
      const toDate = toDateStr ? new Date(toDateStr) : undefined;

      const closures = await this.service.getSpecialClosures(cspId, fromDate, toDate);

      return NextResponse.json({ 
        csp_id: cspId,
        closures: closures,
      });
    } catch (error) {
      logger.error('Error getting special closures:', error);
      return NextResponse.json(
        { error: 'Failed to get special closures', message: (error as Error).message },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/csp/:id/availability/closures
   * Create a special closure
   */
  async createSpecialClosure(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id: cspId } = await context.params;
      const body = await req.json();

      const validation = specialClosureSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid request body', details: validation.error.issues },
          { status: 400 }
        );
      }

      const closure = await this.service.createSpecialClosure(cspId, validation.data);

      return NextResponse.json(closure, { status: 201 });
    } catch (error) {
      logger.error('Error creating special closure:', error);
      return NextResponse.json(
        { error: 'Failed to create special closure', message: (error as Error).message },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/csp/:id/availability/closures/:closureId
   * Delete a special closure
   */
  async deleteSpecialClosure(
    req: NextRequest,
    context: { params: Promise<{ id: string; closureId: string }> }
  ): Promise<NextResponse> {
    try {
      const { closureId } = await context.params;
      await this.service.deleteSpecialClosure(closureId);

      return NextResponse.json({ message: 'Special closure deleted successfully' });
    } catch (error) {
      logger.error('Error deleting special closure:', error);
      return NextResponse.json(
        { error: 'Failed to delete special closure', message: (error as Error).message },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/csp/:id/availability/services
   * Get service availability for a CSP
   */
  async getServiceAvailability(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id: cspId } = await context.params;
      const { searchParams } = new URL(req.url);
      const serviceType = searchParams.get('service_type') || undefined;

      const services = await this.service.getServiceAvailability(cspId, serviceType);

      return NextResponse.json({ 
        csp_id: cspId,
        services: services,
      });
    } catch (error) {
      logger.error('Error getting service availability:', error);
      return NextResponse.json(
        { error: 'Failed to get service availability', message: (error as Error).message },
        { status: 500 }
      );
    }
  }

  /**
   * PATCH /api/csp/:id/availability/services/:serviceId
   * Update service availability
   */
  async updateServiceAvailability(
    req: NextRequest,
    context: { params: Promise<{ id: string; serviceId: string }> }
  ): Promise<NextResponse> {
    try {
      const { serviceId } = await context.params;
      const body = await req.json();

      const validation = updateServiceAvailabilitySchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid request body', details: validation.error.issues },
          { status: 400 }
        );
      }

      const availability = await this.service.updateServiceAvailability(
        serviceId,
        {
          ...validation.data,
          next_available: validation.data.next_available 
            ? new Date(validation.data.next_available)
            : undefined,
        }
      );

      return NextResponse.json(availability);
    } catch (error) {
      logger.error('Error updating service availability:', error);
      return NextResponse.json(
        { error: 'Failed to update service availability', message: (error as Error).message },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/csp/:id/availability/check-slot
   * Check if a specific time slot is available
   */
  async checkSlotAvailability(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const { id: cspId } = await context.params;
      const { searchParams } = new URL(req.url);

      const queryParams = checkSlotAvailabilityQuerySchema.safeParse({
        service_type: searchParams.get('service_type'),
        slot_time: searchParams.get('slot_time'),
        duration_minutes: searchParams.get('duration_minutes') || '60',
      });

      if (!queryParams.success) {
        return NextResponse.json(
          { error: 'Invalid query parameters', details: queryParams.error.issues },
          { status: 400 }
        );
      }

      const isAvailable = await this.service.checkSlotAvailability(
        cspId,
        queryParams.data.service_type,
        new Date(queryParams.data.slot_time),
        queryParams.data.duration_minutes || 60
      );

      return NextResponse.json({ 
        csp_id: cspId,
        service_type: queryParams.data.service_type,
        slot_time: queryParams.data.slot_time,
        duration_minutes: queryParams.data.duration_minutes || 60,
        is_available: isAvailable,
      });
    } catch (error) {
      logger.error('Error checking slot availability:', error);
      return NextResponse.json(
        { error: 'Failed to check slot availability', message: (error as Error).message },
        { status: 500 }
      );
    }
  }
}
