# Guía de Configuración de Supabase Auth

**Proyecto**: Camino Service Backend  
**Fecha**: 17 de octubre de 2025  
**Objetivo**: Configurar autenticación por email/password en Supabase

---

## 📋 Pre-requisitos

- Acceso al dashboard de Supabase: https://supabase.com/dashboard
- Proyecto ya creado (actual: `vjmwoqwqwblllrdbnkod`)
- Tabla `usuarios` ya existente con campos: `id`, `email`, `full_name`, `phone`, `role`

---

## 🔐 PASO 1: Habilitar Email/Password Provider

### 1.1 Navegar a Authentication Settings

1. Abre el dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto: **camino** (`vjmwoqwqwblllrdbnkod`)
3. En el menú lateral izquierdo, clic en **Authentication** (icono de candado 🔒)
4. Luego clic en **Providers** (pestaña superior)

### 1.2 Configurar Email Provider

**Ruta**: `Authentication > Providers > Email`

1. Busca **"Email"** en la lista de providers
2. Haz clic en el switch para **habilitar** Email authentication
3. Configuración recomendada:

```
✅ Enable Email provider
✅ Confirm email (enviar email de confirmación al registrarse)
⬜ Enable Email OTP (deshabilitado - usamos contraseña)
✅ Secure email change (re-autenticación para cambiar email)
✅ Double confirm email change (doble confirmación)
```

4. **Rate Limits** (límites anti-spam):

```
- Max sends per hour: 10 (por IP/email)
- Signup/Login attempts: 5 por minuto
```

5. Clic en **Save** (botón inferior derecho)

### 1.3 Verificar que Password Authentication está habilitado

Por defecto ya debería estar, pero verifica:

```
Authentication > Providers > Email > Password Configuration
✅ Minimum password length: 6 characters
✅ Require uppercase: No (nuestro Zod schema ya valida esto)
✅ Require lowercase: No
✅ Require numbers: No
✅ Require special characters: No
```

> **Nota**: Nuestras validaciones Zod son MÁS estrictas (mínimo 8 chars, mayúscula, minúscula, número) así que dejamos Supabase flexible.

---

## 📧 PASO 2: Configurar Email Templates

### 2.1 Navegar a Email Templates

**Ruta**: `Authentication > Email Templates`

Aquí configurarás 3 plantillas de email:

### 2.2 Template: Confirm Signup (Confirmar Registro)

**Cuándo se envía**: Al crear cuenta nueva con `register()`

1. Selecciona **"Confirm signup"** de la lista
2. **Subject** (Asunto):

```
Confirma tu cuenta en Camino de Santiago
```

3. **Message Body** (personalizar en español):

```html
<h2>¡Bienvenido a Camino de Santiago!</h2>

<p>Gracias por registrarte. Para activar tu cuenta, confirma tu email haciendo clic en el botón:</p>

<p><a href="{{ .ConfirmationURL }}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirmar Email</a></p>

<p>O copia y pega este enlace en tu navegador:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Este enlace expira en 24 horas.</p>

<p>Si no creaste esta cuenta, ignora este email.</p>

<p>¡Buen Camino! 🥾</p>
```

4. **Redirect URL** (donde va el usuario después de confirmar):

```
http://localhost:3000/auth/verify-success
```

> **Cambiar a tu dominio en producción**: `https://camino.app/auth/verify-success`

5. Clic en **Save**

### 2.3 Template: Reset Password (Restablecer Contraseña)

**Cuándo se envía**: Al llamar `requestPasswordReset()`

1. Selecciona **"Reset password"** de la lista
2. **Subject**:

```
Restablece tu contraseña - Camino de Santiago
```

3. **Message Body**:

```html
<h2>Restablecer contraseña</h2>

<p>Recibimos una solicitud para restablecer tu contraseña.</p>

<p>Haz clic en el botón para crear una nueva contraseña:</p>

<p><a href="{{ .ConfirmationURL }}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Restablecer Contraseña</a></p>

<p>O copia y pega este enlace:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Este enlace expira en 1 hora.</p>

<p><strong>Si no solicitaste esto, ignora este email.</strong> Tu contraseña actual sigue siendo segura.</p>
```

4. **Redirect URL**:

```
http://localhost:3000/auth/reset-password
```

> **Producción**: `https://camino.app/auth/reset-password`

5. Clic en **Save**

### 2.4 Template: Magic Link (Opcional - no usamos)

**Puedes dejarlo por defecto** - no lo usamos en nuestro sistema actual.

### 2.5 Template: Invite User (Invitar Usuario)

**Cuándo se envía**: Si más adelante implementas invitaciones admin

Puedes configurarlo después, no es crítico ahora.

---

## ⚙️ PASO 3: Configurar URLs y Redirects

### 3.1 Redirect URLs (Site URL)

**Ruta**: `Authentication > URL Configuration`

1. **Site URL** (URL principal de tu app):

```
Development: http://localhost:3000
Production: https://camino.app
```

2. **Redirect URLs** (permitidas para callbacks):

```
http://localhost:3000/**
http://localhost:3000/auth/**
https://camino.app/**
https://camino.app/auth/**
```

> **Importante**: El `/**` permite cualquier ruta bajo ese dominio.

3. Clic en **Save**

---

## 🔑 PASO 4: Configurar JWT Settings

### 4.1 Verificar configuración JWT

**Ruta**: `Settings > API > JWT Settings`

Estos valores ya deberían estar configurados, solo verifica:

1. **JWT Expiry** (duración del access_token):

```
Default: 3600 seconds (1 hora)
Recomendado: Dejar en 3600
```

2. **Refresh Token Lifetime**:

```
Default: 2592000 seconds (30 días)
Recomendado: Dejar en 30 días
```

3. **JWT Secret** (auto-generado):

```
⚠️ NO CAMBIAR - se regenera automáticamente
Está en tus variables de entorno como SUPABASE_JWT_SECRET
```

### 4.2 Verificar API Keys

**Ruta**: `Settings > API`

Verifica que tienes estas 2 keys:

1. **anon (public) key**:

```
- Usada en el frontend (React, mobile app)
- Variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
- Safe to expose publicly
```

2. **service_role (private) key**:

```
- Usada en el backend (Next.js API routes)
- Variable: SUPABASE_SERVICE_ROLE_KEY
- ⚠️ NUNCA exponer al frontend
```

**Tu configuración actual** (en `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vjmwoqwqwblllrdbnkod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (tu anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (tu service role key)
```

---

## 🗄️ PASO 5: Configurar Trigger en tabla `usuarios`

### 5.1 Crear función de sincronización

**Ruta**: `SQL Editor > New Query`

Ejecuta este SQL para crear un trigger que sincronice `auth.users` → `usuarios`:

```sql
-- Función para sincronizar nuevo usuario de auth a tabla usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar en tabla usuarios cuando se crea usuario en auth.users
  INSERT INTO public.usuarios (id, email, full_name, phone, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Si ya existe, no hacer nada

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que ejecuta la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 5.2 Verificar que el trigger funciona

Ejecuta este query para ver triggers activos:

```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users';
```

Deberías ver:

```
trigger_name: on_auth_user_created
event_manipulation: INSERT
event_object_table: users
action_statement: EXECUTE FUNCTION public.handle_new_user()
```

---

## ✅ PASO 6: Probar la configuración

### 6.1 Test de Registro (desde tu API)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "nombre": "Usuario",
    "apellidos": "De Prueba"
  }'
```

**Verificaciones**:

1. ✅ Respuesta 201 con `{ data: { user, session } }`
2. ✅ Email de confirmación enviado a `test@example.com`
3. ✅ Usuario creado en tabla `usuarios` con `role: 'user'`
4. ✅ Usuario creado en `auth.users` (verificar en Authentication > Users)

### 6.2 Test de Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

**Verificación**:

1. ✅ Respuesta 200 con `access_token` y `refresh_token`
2. ✅ Datos del usuario desde tabla `usuarios`

### 6.3 Test de Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Verificación**:

1. ✅ Respuesta 200
2. ✅ Email de reset enviado con enlace

### 6.4 Verificar en Dashboard

**Ruta**: `Authentication > Users`

Deberías ver:

- ✅ Usuario `test@example.com`
- ✅ Estado: `Confirmed` (si confirmó email) o `Unconfirmed`
- ✅ `Last Sign In`: timestamp del login
- ✅ `Created At`: timestamp de registro

---

## 🔒 PASO 7: Configurar Row Level Security (RLS)

### 7.1 Habilitar RLS en tabla usuarios

**Ruta**: `Table Editor > usuarios > RLS Policies`

1. Clic en **"Enable RLS"** (botón superior derecho)

### 7.2 Crear políticas de seguridad

Ejecuta en **SQL Editor**:

```sql
-- Política: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON public.usuarios
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política: Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política: Solo service_role puede insertar (registro desde backend)
CREATE POLICY "Service role can insert users"
ON public.usuarios
FOR INSERT
TO service_role
WITH CHECK (true);

-- Política: Admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 7.3 Verificar políticas activas

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'usuarios';
```

---

## 📱 PASO 8: Configurar Email Provider (SMTP opcional)

### Opción A: Usar Supabase Email (Desarrollo)

**Por defecto ya activo** - Supabase envía emails desde `noreply@mail.app.supabase.io`

**Limitaciones**:

- ⚠️ Máximo 3-4 emails/hora en plan gratuito
- ⚠️ Puede caer en spam
- ✅ Perfecto para desarrollo

### Opción B: Configurar SMTP Custom (Producción)

**Ruta**: `Settings > Auth > SMTP Settings`

**Providers recomendados**:

1. **SendGrid** (12,000 emails/mes gratis)
2. **Mailgun** (5,000 emails/mes gratis)
3. **Resend** (3,000 emails/mes gratis)

**Configuración ejemplo (SendGrid)**:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: <tu-sendgrid-api-key>
Sender Email: noreply@camino.app
Sender Name: Camino de Santiago
```

---

## ✅ Checklist Final de Verificación

Antes de dar por completada la configuración:

- [ ] **Email Provider habilitado** (Authentication > Providers > Email)
- [ ] **Email de confirmación activado** (Confirm email = ON)
- [ ] **Templates en español configurados** (Confirm signup, Reset password)
- [ ] **Redirect URLs configuradas** (localhost + producción)
- [ ] **JWT settings verificados** (1h access, 30d refresh)
- [ ] **API Keys copiadas a .env.local** (ANON_KEY + SERVICE_ROLE_KEY)
- [ ] **Trigger `on_auth_user_created` activo** (sincroniza auth → usuarios)
- [ ] **RLS habilitado en tabla usuarios** (4 políticas activas)
- [ ] **Test de registro exitoso** (email enviado + usuario creado)
- [ ] **Test de login exitoso** (tokens generados)
- [ ] **Test de reset password exitoso** (email recibido)
- [ ] **Usuario visible en dashboard** (Authentication > Users)

---

## 🐛 Troubleshooting Común

### Problema 1: "Email not confirmed"

**Causa**: Usuario registrado pero no confirmó email

**Solución**:

```sql
-- Confirmar manualmente en desarrollo
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'test@example.com';
```

### Problema 2: "No se envían emails"

**Verificar**:

1. `Authentication > Providers > Email` está habilitado
2. `Email Templates` están guardadas
3. Rate limits no excedidos (max 10/hora en dev)
4. Revisar `Authentication > Logs` para errores

### Problema 3: "Usuario en auth.users pero no en tabla usuarios"

**Causa**: Trigger no ejecutado

**Verificar**:

```sql
-- Ver si trigger existe
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Insertar manualmente si falta
INSERT INTO usuarios (id, email, full_name, role)
SELECT id, email,
       raw_user_meta_data->>'full_name',
       COALESCE(raw_user_meta_data->>'role', 'user')
FROM auth.users
WHERE id NOT IN (SELECT id FROM usuarios);
```

### Problema 4: "Invalid JWT token"

**Causa**: Token expirado o service_role_key incorrecta

**Verificar**:

```bash
# Revisar env vars
echo $SUPABASE_SERVICE_ROLE_KEY

# Comparar con dashboard: Settings > API > service_role key
```

---

## 📚 Documentación Supabase

- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Email Auth](https://supabase.com/docs/guides/auth/auth-email)
- [Server-side Auth](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎉 ¡Configuración Completa!

Tu sistema de autenticación está listo para:

- ✅ Registro de usuarios con confirmación por email
- ✅ Login con email/password
- ✅ Recuperación de contraseña
- ✅ Refresh de tokens automático
- ✅ Protección de rutas con middleware
- ✅ Row Level Security en base de datos

**Siguiente paso**: Probar todos los endpoints desde Postman o el frontend.
