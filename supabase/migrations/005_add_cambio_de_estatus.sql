-- Agregar servicio: Cambio de Estatus (B-2 a F-1)
INSERT INTO service_catalog (
  name,
  slug,
  short_description,
  full_description,
  base_price,
  allow_installments,
  max_installments,
  min_down_payment_percent,
  estimated_duration,
  uscis_forms,
  required_documents,
  eligibility_questions,
  is_active,
  icon,
  display_order
) VALUES (
  'Cambio de Estatus',
  'cambio-de-estatus',
  'Visa de Turismo a Visa de Estudiante (B-2 a F-1)',
  'Servicio de asesoria y asistencia para cambiar su estatus migratorio de Visa de Turismo (B-1/B-2) a Visa de Estudiante (F-1) ante USCIS. Incluye coordinacion con la institucion educativa para la obtencion del Formulario I-20, preparacion y presentacion del Formulario I-539, orientacion sobre el pago de la tarifa SEVIS I-901, y seguimiento del caso hasta la aprobacion. Tambien se ofrece asistencia para incluir familiares dependientes (conyuge e hijos menores) en la solicitud.',
  1500.00,
  true,
  10,
  20,
  '2 a 6 meses',
  ARRAY['I-539', 'I-20', 'I-901'],
  '[
    {"key": "passport", "label": "Pasaporte vigente", "required": true, "category": "identidad"},
    {"key": "passport_photos", "label": "Fotos tipo pasaporte", "required": true, "category": "identidad"},
    {"key": "photo_id", "label": "Identificación con foto", "required": true, "category": "identidad"},
    {"key": "i94", "label": "Registro I-94", "required": true, "category": "inmigración"},
    {"key": "visa_stamp", "label": "Copia de estampa de visa B-1/B-2", "required": true, "category": "inmigración"},
    {"key": "i20", "label": "Formulario I-20 de la escuela", "required": true, "category": "escolar"},
    {"key": "admission_letter", "label": "Carta de admisión", "required": true, "category": "escolar"},
    {"key": "sevis_fee_receipt", "label": "Comprobante pago SEVIS I-901", "required": true, "category": "escolar"},
    {"key": "bank_statements", "label": "Estados de cuenta bancarios", "required": true, "category": "financiero", "multiple": true},
    {"key": "sponsor_affidavit", "label": "Carta de apoyo financiero", "required": false, "category": "financiero"},
    {"key": "sponsor_bank_statements", "label": "Estados de cuenta del patrocinador", "required": false, "category": "financiero", "multiple": true},
    {"key": "marriage_certificate", "label": "Acta de matrimonio", "required": false, "category": "familia"},
    {"key": "birth_certificates_dependents", "label": "Actas de nacimiento de hijos", "required": false, "category": "familia", "multiple": true}
  ]'::jsonb,
  '[
    {"id": "in_us", "question": "¿Se encuentra actualmente en EE.UU. con visa de turismo (B-1/B-2)?", "type": "boolean", "required_answer": true, "fail_message": "Debe estar en EE.UU. con estatus B-1/B-2 válido."},
    {"id": "valid_status", "question": "¿Su estatus migratorio actual sigue vigente?", "type": "boolean", "required_answer": true, "fail_message": "Su estatus debe estar vigente para solicitar cambio."},
    {"id": "no_study", "question": "¿Confirma que NO se ha inscrito en clases con visa de turismo?", "type": "boolean", "required_answer": true, "fail_message": "Asistir a clases con visa de turismo viola su estatus."},
    {"id": "school_accepted", "question": "¿Ha sido aceptado en una escuela en EE.UU.?", "type": "boolean", "required_answer": true, "fail_message": "Necesita aceptación de una escuela certificada por SEVP."},
    {"id": "financial_support", "question": "¿Puede demostrar fondos suficientes para sus estudios?", "type": "boolean", "required_answer": true, "fail_message": "Debe demostrar capacidad financiera."}
  ]'::jsonb,
  true,
  'GraduationCap',
  10
);
