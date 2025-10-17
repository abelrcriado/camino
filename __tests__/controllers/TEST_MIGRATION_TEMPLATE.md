# Test Migration Template: Repository DI Pattern

## ✅ WORKING PATTERN (Test 1/27 Passing)

### Mock Setup (beforeEach)

```typescript
describe("QRValidationController", () => {
  let controller: QRValidationController;
  let mockTransactionRepo: jest.Mocked<TransactionRepository>;
  let mockAccessLogRepo: jest.Mocked<AccessLogRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Create mocked repository instances
    mockTransactionRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      markQRAsUsed: jest.fn(),
      invalidateQR: jest.fn(),
      upsert: jest.fn(),
      createFromQRPayload: jest.fn(),
      updateStatus: jest.fn(),
      findByUserId: jest.fn(),
    } as any;

    mockAccessLogRepo = {
      logAccess: jest.fn(),
      findWithFilters: jest.fn(),
      findByTransactionId: jest.fn(),
      findByUserId: jest.fn(),
      countByValidationResult: jest.fn(),
    } as any;

    mockUserRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    // Inject mocked repositories into controller
    controller = new QRValidationController(mockTransactionRepo, mockAccessLogRepo, mockUserRepo);

    jest.clearAllMocks();
  });
});
```

### Test Pattern (Happy Path Example)

```typescript
it("should validate QR with correct HMAC signature and return 200", async () => {
  const { qrData, payload, secret } = generateValidQRPayload();
  const locationId = generateUUID();
  const scannedBy = generateUUID();

  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: "POST",
    body: {
      qr_data: qrData,
      location_id: locationId,
      scanned_by: scannedBy,
    },
  });

  // 1. Mock UserRepository.findById() - User exists with qr_secret
  mockUserRepo.findById.mockResolvedValue({
    data: { id: payload.user_id, qr_secret: secret },
    error: null,
  } as any);

  // 2. Mock TransactionRepository.findById() - Transaction does NOT exist
  mockTransactionRepo.findById.mockResolvedValue({
    data: null,
    error: null,
  } as any);

  // 3. Mock TransactionRepository.createFromQRPayload() - Create new transaction
  // CRITICAL: Use single() format (object, not array)
  const testTransaction = {
    id: payload.transaction_id,
    user_id: payload.user_id,
    items: payload.items,
    total: 3.5,
    status: "pending_sync" as const,
    qr_used: false,
    qr_invalidated: false,
    qr_used_at: undefined,
    qr_used_location: undefined,
    qr_used_by: undefined,
    qr_invalidated_at: undefined,
    qr_invalidated_reason: undefined,
    parent_transaction_id: undefined,
    created_at: new Date(payload.timestamp).toISOString(),
    updated_at: new Date().toISOString(),
    synced_at: undefined,
  };

  mockTransactionRepo.createFromQRPayload.mockResolvedValue({
    data: testTransaction, // ⚠️ single() returns object, NOT array
    error: null,
  } as any);

  // 4. Mock TransactionRepository.markQRAsUsed() - Mark QR as used
  mockTransactionRepo.markQRAsUsed.mockResolvedValue({
    data: null,
    error: null,
  } as any);

  // 5. Mock AccessLogRepository.logAccess() - Log access (non-blocking)
  mockAccessLogRepo.logAccess.mockResolvedValue({
    data: [
      {
        id: generateUUID(),
        transaction_id: payload.transaction_id,
        user_id: payload.user_id,
        location_id: locationId,
        validation_result: "valid",
        scanned_by: scannedBy,
      },
    ],
    error: null,
  } as any);

  // Execute controller method
  await controller.verifyQR(req, res);

  // Assertions
  expect(res._getStatusCode()).toBe(200);
  const responseData = JSON.parse(res._getData());
  expect(responseData.valid).toBe(true);
  expect(responseData.transaction.id).toBe(payload.transaction_id);
  expect(responseData.message).toBe("QR válido - Acceso autorizado");

  // Verify repository method calls
  expect(mockUserRepo.findById).toHaveBeenCalledWith(payload.user_id);
  expect(mockTransactionRepo.findById).toHaveBeenCalledWith(payload.transaction_id);
  expect(mockTransactionRepo.createFromQRPayload).toHaveBeenCalled();
  expect(mockTransactionRepo.markQRAsUsed).toHaveBeenCalledWith(payload.transaction_id, locationId, scannedBy);
  expect(mockAccessLogRepo.logAccess).toHaveBeenCalled();
});
```

---

## 🔑 Key Differences from Old Pattern

### OLD (Global Supabase Mock):

```typescript
// ❌ OLD: Mock global supabase module
(mockSupabase.single as jest.Mock).mockResolvedValueOnce({
  data: { qr_secret: secret },
  error: null,
});

(mockSupabase.update as jest.Mock).mockResolvedValue({
  data: null,
  error: null,
});
```

### NEW (Repository DI Mock):

```typescript
// ✅ NEW: Mock repository methods directly
mockUserRepo.findById.mockResolvedValue({
  data: { id: userId, qr_secret: secret },
  error: null,
} as any);

mockTransactionRepo.markQRAsUsed.mockResolvedValue({
  data: null,
  error: null,
} as any);
```

---

## 📋 Repository Method Signatures

### TransactionRepository

```typescript
findById(id: string): Promise<{ data: Transaction | null, error: any }>
create(data): Promise<{ data: Transaction[], error: any }>
createFromQRPayload(data): Promise<{ data: Transaction, error: any }>  // ⚠️ single()
markQRAsUsed(id, location, scannedBy): Promise<{ data: null, error: any }>
invalidateQR(id, reason): Promise<{ data: null, error: any }>
upsert(transaction): Promise<{ data: Transaction, error: any }>  // ⚠️ single()
updateStatus(id, status): Promise<{ data: null, error: any }>
findByUserId(userId): Promise<{ data: Transaction[], error: any }>
```

### AccessLogRepository

```typescript
logAccess(log): Promise<{ data: AccessLog[], error: any }>
findWithFilters(filters): Promise<{ data: AccessLog[], count: number }>
findByTransactionId(id): Promise<{ data: AccessLog[], error: any }>
findByUserId(id): Promise<{ data: AccessLog[], error: any }>
countByValidationResult(result): Promise<{ count: number, error: any }>
```

### UserRepository

```typescript
findById(id): Promise<{ data: User | null, error: any }>
create(data): Promise<{ data: User[], error: any }>
update(id, data): Promise<{ data: User[], error: any }>
delete(id): Promise<{ data: null, error: any }>
findAll(params): Promise<{ data: User[], error: any }>
```

---

## ⚠️ Critical Notes

1. **single() vs select()**:
   - `createFromQRPayload()` uses `.single()` → returns `{ data: Transaction }` (object)
   - `create()` uses `.select()` → returns `{ data: Transaction[] }` (array)

2. **Logger Mock**:

   ```typescript
   jest.mock("@/config/logger", () => ({
     __esModule: true,
     default: {
       info: jest.fn(),
       warn: jest.fn(),
       error: jest.fn(),
       debug: jest.fn(),
     },
   }));
   ```

3. **asyncHandler Mock**:
   ```typescript
   jest.mock("@/api/middlewares/error-handler", () => ({
     asyncHandler: (handler: any) => handler,
   }));
   ```

---

## 📊 Migration Progress

- ✅ **1/27 tests passing** (Happy Path test 1)
- ⏳ **26/27 tests remaining**:
  - Happy Path (2 tests)
  - 400 Bad Request (4 tests)
  - 403 Forbidden (2 tests)
  - 404 Not Found (1 test)
  - 409 Conflict (1 test)
  - 410 Gone (3 tests)
  - 500 Internal Server Error (3 tests)
  - Access Logs Auditing (4 tests)
  - HMAC Signature Verification (3 tests - already passing)
  - Edge Cases (3 tests)

---

## 🚀 Next Steps

1. Apply this template to remaining 26 tests
2. Update each `(mockSupabase.X as jest.Mock)` → `mockXRepo.method()`
3. Fix response formats: `data: object` vs `data: [object]`
4. Verify all repository method calls with `expect().toHaveBeenCalledWith()`

**Estimated time**: 3-4 hours (10-15 min per test with template)
