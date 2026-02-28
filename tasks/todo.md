# Plan XL: Sistema de Agendamiento de Citas + Upload de Documentos

## Resumen
Sistema donde clientes que ya pagaron pueden: (1) agendar cita de 1 hora con Henry por Zoom, (2) subir 5 documentos PDF requeridos. Acceso via token unico por cliente (sin login). Henry controla todo desde su dashboard admin.

---

## Decisiones de Diseno

| Decisión | Elección | Razón |
|----------|----------|-------|
| Acceso cliente | Token UUID por cliente (patron `/cita/[token]`) | Reutiliza patron probado de `/contrato/[token]`, no requiere login |
| Duración cita | 1 hora fija | Requerimiento de Henry |
| Días disponibles | Lunes a Sábado | Requerimiento de Henry |
| Horario | 8:00 AM - 8:00 PM Mountain Time | 12 slots de 1 hora por día |
| Modalidad | Zoom | Henry provee su link de Zoom |
| Recordatorios | Email via Resend (1h antes, 1 día antes) | Sistema de email ya existe |
| Penalización no-show | 7 días sin poder agendar | Si no cancela 24h antes |
| Calendar UI | react-day-picker (ya instalado) | No agregar dependencia nueva |
| Storage documentos | Bucket `case-documents` existente | Ya tiene RLS configurado |

---

## Nuevas Tablas (1 migración SQL)

### `appointments`
```
id              UUID PK DEFAULT gen_random_uuid()
case_id         UUID FK → cases(id)
client_id       UUID FK → profiles(id) -- auth.users
scheduled_at    TIMESTAMPTZ NOT NULL -- fecha+hora de la cita
duration_minutes INT DEFAULT 60
zoom_link       TEXT -- link de Zoom de Henry
status          TEXT CHECK (scheduled, completed, cancelled, no_show) DEFAULT 'scheduled'
reminder_1h     BOOLEAN DEFAULT false -- ya se envió?
reminder_24h    BOOLEAN DEFAULT false -- ya se envió?
cancelled_at    TIMESTAMPTZ
cancellation_reason TEXT
notes           TEXT -- notas de Henry post-cita
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

### `appointment_tokens`
```
id              UUID PK DEFAULT gen_random_uuid()
client_id       UUID FK → profiles(id)
case_id         UUID FK → cases(id)
token           UUID UNIQUE DEFAULT gen_random_uuid()
expires_at      TIMESTAMPTZ -- opcional, puede no expirar
created_at      TIMESTAMPTZ DEFAULT now()
```

### `scheduling_config`
```
id              UUID PK DEFAULT gen_random_uuid()
day_of_week     INT NOT NULL (0=domingo...6=sábado)
start_hour      INT NOT NULL -- 8 (8AM)
end_hour        INT NOT NULL -- 20 (8PM)
is_available    BOOLEAN DEFAULT true
zoom_link       TEXT -- link default de Henry
updated_at      TIMESTAMPTZ DEFAULT now()
```

### `blocked_dates`
```
id              UUID PK DEFAULT gen_random_uuid()
blocked_date    DATE NOT NULL -- día completo bloqueado
reason          TEXT
created_at      TIMESTAMPTZ DEFAULT now()
```

No necesitamos tabla nueva para documentos — ya existe `documents` con `document_key`.

---

## Subtareas (en orden de ejecución)

### Fase 1: Base de Datos (L)
- [ ] **1.1** Crear migración SQL: tablas `appointments`, `appointment_tokens`, `scheduling_config`, `blocked_dates`
- [ ] **1.2** RLS policies: clientes ven solo sus citas, admin ve todo
- [ ] **1.3** Seed data: scheduling_config con Lun-Sáb 8AM-8PM, link Zoom de Henry
- [ ] **1.4** Actualizar `src/types/database.ts` con nuevas interfaces

### Fase 2: API Routes (L)
- [ ] **2.1** `POST /api/admin/appointments/generate-link` — genera token para un cliente+caso
- [ ] **2.2** `GET /api/appointments/available?token=X&date=YYYY-MM-DD` — slots disponibles para una fecha
- [ ] **2.3** `POST /api/appointments/book` — agendar cita (valida: tiene pago completado, no tiene penalización, slot libre)
- [ ] **2.4** `POST /api/appointments/cancel` — cancelar (valida: >24h antes, sino marca penalización)
- [ ] **2.5** `POST /api/appointments/upload-document` — subir PDF con token (sin auth, usa service client)
- [ ] **2.6** `POST /api/admin/appointments/update-status` — Henry marca completado/no-show
- [ ] **2.7** `GET /api/admin/appointments/config` + `PUT` — Henry configura disponibilidad

### Fase 3: Página del Cliente `/cita/[token]` (L)
- [ ] **3.1** Server component: valida token, muestra perfil del cliente y caso
- [ ] **3.2** Calendario: react-day-picker mostrando días con slots disponibles
- [ ] **3.3** Selector de hora: grid de slots disponibles para el día seleccionado
- [ ] **3.4** Opciones de recordatorio: checkboxes "1 hora antes" y "1 día antes"
- [ ] **3.5** Confirmación: resumen de cita + botón confirmar
- [ ] **3.6** Vista post-agendamiento: detalles de la cita, link Zoom, botón cancelar
- [ ] **3.7** Upload de documentos: 5 slots de PDF con labels, preview, progreso
- [ ] **3.8** Estado de penalización: si tiene no-show, mostrar mensaje "puede agendar desde [fecha]"

### Fase 4: Admin Dashboard — Vista Citas (L)
- [ ] **4.1** Nueva página `/admin/citas` con tabla de citas (fecha, cliente, caso, estado)
- [ ] **4.2** Agregar "Citas" al sidebar del admin layout
- [ ] **4.3** Vista calendario semanal/mensual: slots ocupados vs libres
- [ ] **4.4** Botón "Generar Link" desde la vista de detalle de cliente (`/admin/clients/[id]`)
- [ ] **4.5** Configuración: editar horarios, bloquear días, cambiar link Zoom
- [ ] **4.6** Acciones: marcar completado, marcar no-show, ver documentos subidos

### Fase 5: Recordatorios (M)
- [ ] **5.1** API route `/api/cron/appointment-reminders` — envía emails pendientes
- [ ] **5.2** Template de email: "Tu cita con UsaLatinoPrime es en X" con link Zoom y detalles
- [ ] **5.3** Vercel Cron Job o Edge Function para ejecutar cada 30 min

### Fase 6: Integración Dashboard (M)
- [ ] **6.1** Widget en `/admin/dashboard`: "Citas de Hoy" con lista de próximas
- [ ] **6.2** Widget: "Documentos Pendientes" — clientes que no han subido todos los PDFs
- [ ] **6.3** Badge en sidebar "Citas" con conteo de citas del día

---

## Los 5 Documentos Requeridos

| # | document_key | Label |
|---|-------------|-------|
| 1 | `tutor_id` | Pasaporte o ID del Tutor |
| 2 | `minor_id` | Pasaporte o ID de Menores |
| 3 | `birth_certificates` | Actas de Nacimiento de Menores |
| 4 | `lease_or_utility` | Contrato de Arrendamiento o Factura de Servicio |
| 5 | `supporting_docs` | Documentos Sustentatorios |

Se guardan en bucket `case-documents` con path: `{clientId}/{caseId}/{docKey}/{timestamp}-{filename}`

---

## Flujo del Usuario

```
Henry genera link → Cliente recibe link por WhatsApp
→ Cliente abre /cita/[token]
→ Ve calendario con días disponibles
→ Selecciona día → ve slots de hora disponibles
→ Selecciona hora + opciones de recordatorio
→ Confirma cita → ve resumen + link Zoom
→ Sube sus 5 documentos PDF
→ Recibe recordatorio por email (1 día / 1 hora antes)
→ Asiste a cita por Zoom
→ Henry marca "Completado" en dashboard
```

## Flujo de Penalización

```
Cita agendada → Cliente NO cancela 24h antes Y no asiste
→ Henry marca "No Show" en dashboard
→ Sistema calcula: no puede agendar hasta [fecha_noshow + 7 días]
→ Si cliente intenta agendar antes → ve mensaje de penalización
```

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Zona horaria confusa | Todo en Mountain Time, mostrar "Hora de Utah (MT)" claramente |
| Cliente agenda y no sube documentos | Widget en dashboard "Docs pendientes", Henry puede recordar via WhatsApp |
| Dos clientes agendan mismo slot | Lock optimista: verificar slot libre al momento de INSERT |
| Token se filtra | Token UUID es cripto-random, difícil de adivinar. Opcional: agregar expiración |
| Cron de recordatorios falla | Flags `reminder_1h`/`reminder_24h` previenen duplicados |
| Henry quiere bloquear un día específico | Tabla `blocked_dates` para vacaciones/emergencias |

---

## Orden de Implementación Recomendado

1. **Fase 1** (DB) → sin esto nada funciona
2. **Fase 2** (APIs) → lógica de negocio central
3. **Fase 3** (Página cliente) → el producto visible para el cliente
4. **Fase 4** (Admin) → Henry controla el sistema
5. **Fase 5** (Recordatorios) → mejora la experiencia
6. **Fase 6** (Dashboard widgets) → pulido final

Estimación: 5 fases de desarrollo secuencial. Cada fase es testeable independientemente.
