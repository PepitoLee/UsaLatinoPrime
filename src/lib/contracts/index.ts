export interface PriceVariant {
  label: string
  totalPrice: number
}

export interface ContractTemplate {
  objetoDelContrato: string
  etapas: string[]
  requiresMinor: boolean
  installments: boolean
  variants: PriceVariant[]
}

const contracts: Record<string, ContractTemplate> = {
  'asilo-defensivo': {
    installments: true,
    requiresMinor: false,
    variants: [
      { label: 'Individual', totalPrice: 1500 },
      { label: 'Familiar', totalPrice: 2200 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y representacion legal en el proceso de Asilo Defensivo ante la Corte de Inmigracion de los Estados Unidos, incluyendo la preparacion y presentacion de la solicitud de asilo como defensa ante procedimientos de deportacion.',
    etapas: [
      'Evaluacion inicial del caso y revision de documentacion existente',
      'Preparacion y redaccion de la declaracion jurada del solicitante',
      'Recopilacion y organizacion de evidencia de persecucion o temor fundado',
      'Preparacion del Formulario I-589 y documentos de soporte',
      'Presentacion de la solicitud ante la Corte de Inmigracion',
      'Preparacion del cliente para la audiencia individual ante el Juez de Inmigracion',
      'Representacion en audiencias ante la Corte de Inmigracion',
      'Seguimiento post-audiencia y tramites adicionales si corresponde',
    ],
  },
  'ajuste-de-estatus': {
    installments: true,
    requiresMinor: false,
    variants: [
      { label: 'Ajuste de Estatus', totalPrice: 2500 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y asistencia en el proceso de Ajuste de Estatus migratorio ante el Servicio de Ciudadania e Inmigracion de los Estados Unidos (USCIS), para la obtencion de la residencia permanente legal.',
    etapas: [
      'Evaluacion de elegibilidad y revision de historial migratorio',
      'Recopilacion de documentacion personal y evidencia de elegibilidad',
      'Preparacion del Formulario I-485 y formularios complementarios',
      'Preparacion del paquete de evidencia financiera (I-864 Affidavit of Support)',
      'Revision y organizacion del paquete completo de solicitud',
      'Presentacion de la solicitud ante USCIS',
      'Preparacion del cliente para la cita biometrica y entrevista',
      'Seguimiento del caso y respuesta a solicitudes de evidencia adicional (RFE)',
    ],
  },
  'asilo-afirmativo': {
    installments: true,
    requiresMinor: false,
    variants: [
      { label: 'Individual', totalPrice: 1500 },
      { label: 'Familiar', totalPrice: 2200 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y asistencia en el proceso de Asilo Afirmativo ante el Servicio de Ciudadania e Inmigracion de los Estados Unidos (USCIS), incluyendo la preparacion y presentacion de la solicitud de asilo.',
    etapas: [
      'Evaluacion inicial del caso y determinacion de elegibilidad',
      'Preparacion y redaccion de la declaracion jurada del solicitante',
      'Recopilacion y organizacion de evidencia de pais y persecucion',
      'Preparacion del Formulario I-589 y documentos de soporte',
      'Revision final y presentacion de la solicitud ante USCIS',
      'Preparacion del cliente para la entrevista con el Oficial de Asilo',
      'Acompanamiento y representacion en la entrevista de asilo',
      'Seguimiento post-entrevista y tramites adicionales si corresponde',
    ],
  },
  'visa-juvenil': {
    installments: true,
    requiresMinor: true,
    variants: [
      { label: 'Individual', totalPrice: 2500 },
      { label: 'Familiar', totalPrice: 3500 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y asistencia en el proceso de obtencion del Estatus Especial de Inmigrante Juvenil (SIJS) para el menor beneficiario, incluyendo la coordinacion con la corte estatal y la presentacion ante USCIS.',
    etapas: [
      'Evaluacion inicial del caso y determinacion de elegibilidad del menor',
      'Preparacion de la peticion ante la Corte Estatal para hallazgos de SIJS',
      'Coordinacion y representacion en procedimientos de la Corte Estatal',
      'Obtencion de la Orden de Hallazgos Especiales (Special Findings Order)',
      'Preparacion del Formulario I-360 (Petition for Amerasian, Widow(er), or Special Immigrant)',
      'Presentacion de la peticion I-360 ante USCIS',
      'Preparacion y presentacion del Ajuste de Estatus (I-485) cuando la visa este disponible',
      'Seguimiento del caso hasta la obtencion de la residencia permanente',
    ],
  },
  'mociones': {
    installments: false,
    requiresMinor: false,
    variants: [
      { label: 'Mociones', totalPrice: 400 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y asistencia en la preparacion y presentacion de una Mocion ante la Corte de Inmigracion o la Junta de Apelaciones de Inmigracion (BIA), segun corresponda al caso del CLIENTE.',
    etapas: [
      'Evaluacion del caso y determinacion del tipo de mocion apropiada',
      'Investigacion legal y recopilacion de precedentes aplicables',
      'Redaccion de la mocion con argumentos legales y evidencia de soporte',
      'Revision final y presentacion de la mocion ante la autoridad correspondiente',
      'Seguimiento del caso y respuesta a cualquier solicitud adicional',
    ],
  },
  'cambio-de-corte': {
    installments: false,
    requiresMinor: false,
    variants: [
      { label: 'Cambio de Corte', totalPrice: 250 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y asistencia en el proceso de solicitud de Cambio de Venue (cambio de jurisdiccion de la Corte de Inmigracion), para que el caso del CLIENTE sea transferido a una corte mas conveniente.',
    etapas: [
      'Evaluacion de elegibilidad para el cambio de corte',
      'Recopilacion de documentacion que justifique el cambio de jurisdiccion',
      'Preparacion de la mocion de cambio de venue',
      'Presentacion de la mocion ante la Corte de Inmigracion actual',
      'Seguimiento hasta la resolucion de la solicitud de transferencia',
    ],
  },
  'itin-number': {
    installments: false,
    requiresMinor: false,
    variants: [
      { label: 'ITIN Number', totalPrice: 250 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y asistencia en la obtencion del Numero de Identificacion Personal del Contribuyente (ITIN) ante el Servicio de Impuestos Internos (IRS).',
    etapas: [
      'Evaluacion de elegibilidad y revision de documentacion de identidad',
      'Preparacion del Formulario W-7 (Application for IRS Individual Taxpayer Identification Number)',
      'Certificacion o notarizacion de documentos de identidad requeridos',
      'Presentacion de la solicitud ante el IRS',
      'Seguimiento hasta la emision del numero ITIN',
    ],
  },
  'licencia-de-conducir': {
    installments: false,
    requiresMinor: false,
    variants: [
      { label: 'Licencia de Conducir', totalPrice: 100 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y asistencia en el proceso de obtencion de la licencia de conducir en el estado correspondiente, incluyendo la preparacion de documentacion requerida.',
    etapas: [
      'Evaluacion de elegibilidad y requisitos del estado',
      'Recopilacion y preparacion de documentos de identidad y residencia',
      'Asistencia con la solicitud y programacion de citas',
      'Preparacion del cliente para los examenes requeridos',
      'Seguimiento hasta la obtencion de la licencia',
    ],
  },
  'taxes': {
    installments: false,
    requiresMinor: false,
    variants: [
      { label: 'Declaracion de Impuestos', totalPrice: 150 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y asistencia en la preparacion y presentacion de la declaracion de impuestos federales y/o estatales del CLIENTE ante el Servicio de Impuestos Internos (IRS).',
    etapas: [
      'Recopilacion de documentacion financiera y formularios W-2, 1099, etc.',
      'Evaluacion de deducciones y creditos fiscales aplicables',
      'Preparacion de la declaracion de impuestos federal y/o estatal',
      'Revision final con el cliente y firma electronica',
      'Presentacion electronica (e-file) ante el IRS y autoridad estatal',
    ],
  },
  'cambio-de-estatus': {
    installments: true,
    requiresMinor: false,
    variants: [
      { label: 'Individual', totalPrice: 1500 },
      { label: 'Familiar', totalPrice: 2200 },
    ],
    objetoDelContrato:
      'El CONSULTOR se compromete a brindar asesoria y asistencia en el proceso de Cambio de Estatus Migratorio (de Visa de Turismo B-1/B-2 a Visa de Estudiante F-1) ante el Servicio de Ciudadania e Inmigracion de los Estados Unidos (USCIS), incluyendo la preparacion y presentacion del Formulario I-539 y la coordinacion con la institucion educativa para la obtencion del Formulario I-20.',
    etapas: [
      'Evaluacion de elegibilidad y revision del estatus migratorio actual',
      'Asistencia en la solicitud de admision a escuela certificada por SEVP y obtencion del Formulario I-20',
      'Orientacion para el pago de la tarifa SEVIS I-901',
      'Preparacion del Formulario I-539 y documentos de soporte (evidencia financiera, I-20, carta de admision)',
      'Presentacion de la solicitud ante USCIS',
      'Seguimiento del caso, preparacion para biometricos y respuesta a solicitudes de evidencia adicional (RFE)',
      'Asistencia post-aprobacion para activacion del estatus F-1 y registro con el DSO de la escuela',
    ],
  },
}

export function getContractTemplate(slug: string): ContractTemplate | null {
  return contracts[slug] || null
}
