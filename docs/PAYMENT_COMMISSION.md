# Payment Commission System

## Overview
The payment system now supports automatic commission calculation and tracking for Stripe Connect payments.

## Database Schema

### New Fields in `payments` table:
- `commission_percentage` (DECIMAL): Percentage applied (e.g., 0.15 = 15%)
- `partner_amount` (INTEGER): Amount transferred to partner in cents
- `stripe_transfer_id` (VARCHAR): Stripe transfer ID for tracking

## Commission Rates by Service Type

Based on the `commission_model` field in the `service_points` table:

### Vending Machines
- **Partner receives**: 90-95% (commission_model.vending: 0.05-0.10)
- **Platform receives**: 5-10%
- **Default**: 10% platform fee

### Workshop Services
- **Partner receives**: 70% (commission_model.workshop: 0.30)
- **Platform receives**: 30%
- **Default**: 30% platform fee

### Bike Wash
- **Partner receives**: 60% (commission_model.wash: 0.40)
- **Platform receives**: 40%
- **Default**: 40% platform fee

### E-Bike Charging
- **Partner receives**: 50% (commission_model.charging: 0.50)
- **Platform receives**: 50%
- **Default**: 50% platform fee

### Workshops (CSH)
- **Workshop receives**: 100%
- **Platform receives**: 0%
- Only facilitation, no commission

## Usage

### Calculate Commission

```typescript
import { PaymentService } from '@/services/payment.service';

const paymentService = new PaymentService();

// Calculate commission for a service
const commission = await paymentService.calculateCommission(
  10000, // amount in cents (100 EUR)
  'vending', // service type
  { vending: 0.08 } // commission model from service_point
);

console.log(commission);
// {
//   total: 10000,
//   partner_amount: 9200,
//   platform_fee: 800,
//   commission_percentage: 0.08
// }
```

### Service Type Detection

The `calculateCommission` method detects service types by checking if the `serviceType` string contains these keywords:
- `vending` → applies vending commission
- `workshop` → applies workshop commission
- `wash` → applies wash commission
- `charging` → applies charging commission

If no match is found, it defaults to 15% platform fee.

## Stripe Connect Integration

### Future Enhancement
To enable automatic payment splits with Stripe Connect:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: commission.total,
  currency: 'eur',
  
  // Split payment with Stripe Connect
  transfer_data: {
    destination: partner.stripe_account_id,
    amount: commission.partner_amount
  },
  
  application_fee_amount: commission.platform_fee,
  
  metadata: {
    commission_percentage: commission.commission_percentage.toString(),
    service_type: 'vending'
  }
});
```

## Migration

The migration file `20251015_115817_add_payment_commission_fields.sql` adds:
- Three new columns with proper types
- Indexes for reporting queries
- Constraint to ensure partner_amount ≤ amount
- Documentation comments

To apply:
```bash
psql "postgresql://..." < supabase/migrations/20251015_115817_add_payment_commission_fields.sql
```

## Testing

Comprehensive test coverage for:
- Commission calculation for all service types
- Edge cases (rounding, missing commission model)
- Schema validation for new fields
- Boundary validation (percentage 0-1, positive amounts)

Run tests:
```bash
npm test -- payment.service.test.ts
npm test -- payment.schema.test.ts
```

## Backward Compatibility

All changes are **backward compatible**:
- New fields are optional
- Existing `platform_fee` and `csp_amount` fields still work
- Default commission (15%) applies when commission_model not provided
- No breaking changes to existing API

## Next Steps

1. Update `createPaymentIntent()` to fetch booking and service_point data
2. Integrate `calculateCommission()` call before creating Stripe Payment Intent
3. Add Stripe Connect account setup for partners
4. Store commission data in payment records
5. Build commission reporting dashboard
