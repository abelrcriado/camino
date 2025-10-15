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
  stripe_account_id?: string; // Stripe Connect account ID for payment splits
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
  stripe_account_id?: string;
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
  stripe_account_id?: string;
}
