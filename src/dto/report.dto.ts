/**
 * DTOs para Report
 */

export interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  service_point_id?: string;
  user_id: string;
  status: string;
  data?: Record<string, unknown>;
  generated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportFilters {
  [key: string]: string | undefined;
  type?: string;
  status?: string;
  user_id?: string;
  service_point_id?: string;
}

export interface CreateReportDto {
  type: string;
  title: string;
  description: string;
  service_point_id?: string;
  user_id: string;
  status?: string;
  data?: Record<string, unknown>;
  generated_at?: string;
}

export interface UpdateReportDto {
  title?: string;
  description?: string;
  status?: string;
  data?: Record<string, unknown>;
}
