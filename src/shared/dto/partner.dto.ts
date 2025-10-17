/**
 * DTOs para Partner
 */

export interface Partner {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone: string;
  type?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerFilters {
  [key: string]: string | undefined;
  type?: string;
}

export interface CreatePartnerDto {
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone: string;
  type?: string;
}

export interface UpdatePartnerDto {
  id: string;
  name?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  type?: string;
}
