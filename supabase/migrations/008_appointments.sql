-- ============================================================
-- 008_appointments.sql
-- Sistema de agendamiento de citas + documentos de cita
-- ============================================================

-- Tipo ENUM para estado de citas
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- ── appointments ──
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  reminder_1h_requested BOOLEAN NOT NULL DEFAULT false,
  reminder_24h_requested BOOLEAN NOT NULL DEFAULT false,
  reminder_1h_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_24h_sent BOOLEAN NOT NULL DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Previene doble booking: solo una cita scheduled por horario
CREATE UNIQUE INDEX idx_appointments_no_double_booking
  ON appointments (scheduled_at)
  WHERE status = 'scheduled';

-- Índices de consulta
CREATE INDEX idx_appointments_client ON appointments (client_id);
CREATE INDEX idx_appointments_case ON appointments (case_id);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_appointments_scheduled ON appointments (scheduled_at);

-- ── appointment_tokens ── Links públicos sin auth
CREATE TABLE appointment_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_appointment_tokens_token ON appointment_tokens (token);

-- ── scheduling_config ── Horarios por día de semana
CREATE TABLE scheduling_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_hour INT NOT NULL DEFAULT 8 CHECK (start_hour BETWEEN 0 AND 23),
  end_hour INT NOT NULL DEFAULT 20 CHECK (end_hour BETWEEN 0 AND 23),
  is_available BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (day_of_week)
);

-- ── scheduling_settings ── Config global (singleton)
CREATE TABLE scheduling_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zoom_link TEXT NOT NULL DEFAULT '',
  slot_duration_minutes INT NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── blocked_dates ── Días bloqueados por Henry
CREATE TABLE blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SEED: Horarios por defecto + settings singleton
-- ============================================================

-- Lun-Sáb: 8AM-8PM MT, Domingo no disponible
INSERT INTO scheduling_config (day_of_week, start_hour, end_hour, is_available) VALUES
  (0, 8, 20, false),  -- Domingo
  (1, 8, 20, true),   -- Lunes
  (2, 8, 20, true),   -- Martes
  (3, 8, 20, true),   -- Miércoles
  (4, 8, 20, true),   -- Jueves
  (5, 8, 20, true),   -- Viernes
  (6, 8, 20, true);   -- Sábado

INSERT INTO scheduling_settings (zoom_link, slot_duration_minutes) VALUES ('', 60);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- appointments: clients ven las suyas, admin maneja todas
CREATE POLICY "Clients can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Admin full access appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- appointment_tokens: solo admin
CREATE POLICY "Admin full access appointment_tokens"
  ON appointment_tokens FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- scheduling_config: lectura pública, escritura solo admin
CREATE POLICY "Anyone can read scheduling_config"
  ON scheduling_config FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage scheduling_config"
  ON scheduling_config FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- scheduling_settings: lectura pública, escritura solo admin
CREATE POLICY "Anyone can read scheduling_settings"
  ON scheduling_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage scheduling_settings"
  ON scheduling_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- blocked_dates: lectura pública, escritura solo admin
CREATE POLICY "Anyone can read blocked_dates"
  ON blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage blocked_dates"
  ON blocked_dates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
