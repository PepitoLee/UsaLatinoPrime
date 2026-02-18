/**
 * Información detallada de etapas, tiempos y filing fees gubernamentales
 * por cada servicio de UsaLatinoPrime.
 *
 * FUENTES:
 * - USCIS Fee Schedule G-1055 (edición 02/01/2026)
 * - EOIR Filing Fees FY2026
 * - IRS Form W-7 Instructions
 * - Utah DLD Driving Privilege Card fees
 *
 * NOTA: Los filing fees son pagos gubernamentales que el CLIENTE paga
 * directamente a la agencia correspondiente. Son independientes del
 * costo del servicio de acompañamiento de UsaLatinoPrime.
 */

export interface ServiceStage {
  step: number
  title: string
  description: string
  timeline: string
  filingFee?: string
  filingFeeNote?: string
  formNumber?: string
}

export interface ServiceInfo {
  slug: string
  stages: ServiceStage[]
  totalTimeline: string
  importantNotes: string[]
}

const serviceInfoMap: Record<string, ServiceInfo> = {
  'asilo-afirmativo': {
    slug: 'asilo-afirmativo',
    totalTimeline: '1 a 3+ años (depende del backlog de USCIS)',
    stages: [
      {
        step: 1,
        title: 'Evaluación inicial del caso',
        description: 'Revisión de su historia, documentación existente y determinación de elegibilidad para asilo afirmativo.',
        timeline: '1-2 semanas',
      },
      {
        step: 2,
        title: 'Preparación de declaración jurada',
        description: 'Redacción detallada de su declaración personal describiendo el temor fundado de persecución.',
        timeline: '2-4 semanas',
      },
      {
        step: 3,
        title: 'Recopilación de evidencia',
        description: 'Reunir informes de país, evidencia de persecución, documentos de identidad y cartas de apoyo.',
        timeline: '2-4 semanas',
      },
      {
        step: 4,
        title: 'Preparación y presentación del Formulario I-589',
        description: 'Completar la solicitud de asilo con todos los documentos de soporte y presentarla ante USCIS.',
        timeline: '1-2 semanas',
        formNumber: 'I-589',
        filingFee: '$0 (gratis)',
        filingFeeNote: 'No hay filing fee para el I-589. Sin embargo, hay un cargo de $100 por H.R. 1 para solicitudes presentadas después de octubre 2024, más $100/año (Annual Asylum Fee) mientras el caso esté pendiente.',
      },
      {
        step: 5,
        title: 'Cita biométrica',
        description: 'Asistir a la cita de huellas dactilares y fotografía en el centro de USCIS más cercano.',
        timeline: '4-8 semanas después de presentar',
        filingFee: 'Incluido',
      },
      {
        step: 6,
        title: 'Preparación para entrevista',
        description: 'Ensayo completo de la entrevista, revisión de preguntas comunes y preparación de respuestas claras.',
        timeline: '1-2 semanas antes de la entrevista',
      },
      {
        step: 7,
        title: 'Entrevista con Oficial de Asilo',
        description: 'Acompañamiento y representación durante la entrevista ante el Oficial de Asilo de USCIS.',
        timeline: '6 meses a 3+ años después de presentar (varía por oficina)',
      },
      {
        step: 8,
        title: 'Decisión y seguimiento',
        description: 'Recibir la decisión (aprobación, referido a corte, o denegación) y tramitar pasos adicionales según el resultado.',
        timeline: '2-4 semanas después de la entrevista',
      },
    ],
    importantNotes: [
      'Puede solicitar permiso de trabajo (EAD) 180 días después de presentar el I-589.',
      'El Formulario I-765 (EAD) tiene un costo de $520 como filing fee gubernamental.',
      'Si su caso es referido a la Corte de Inmigración, continúa como asilo defensivo.',
    ],
  },

  'asilo-defensivo': {
    slug: 'asilo-defensivo',
    totalTimeline: '1 a 3+ años (depende del calendario de la corte)',
    stages: [
      {
        step: 1,
        title: 'Evaluación del caso y comparecencia inicial',
        description: 'Revisión de su Notice to Appear (NTA) y planificación de la estrategia de defensa ante la Corte de Inmigración.',
        timeline: '1-2 semanas',
      },
      {
        step: 2,
        title: 'Preparación de declaración jurada',
        description: 'Redacción completa de su declaración personal con detalles de persecución y temor de regreso.',
        timeline: '2-4 semanas',
      },
      {
        step: 3,
        title: 'Recopilación de evidencia de país',
        description: 'Obtener informes del Departamento de Estado, reportes de derechos humanos y evidencia de condiciones en su país.',
        timeline: '2-4 semanas',
      },
      {
        step: 4,
        title: 'Presentación del I-589 ante la Corte',
        description: 'Presentar la solicitud de asilo como defensa ante el procedimiento de deportación.',
        timeline: 'Antes de la fecha límite del juez',
        formNumber: 'I-589',
        filingFee: '$0 (gratis)',
        filingFeeNote: 'No hay filing fee para el I-589 ante la Corte de Inmigración. El cargo de $100 por H.R. 1 aplica a solicitudes ante USCIS.',
      },
      {
        step: 5,
        title: 'Audiencia Master (preliminar)',
        description: 'Comparecer ante el Juez de Inmigración para establecer fechas y confirmar la solicitud de asilo.',
        timeline: 'Según calendario de la corte',
      },
      {
        step: 6,
        title: 'Preparación para audiencia individual',
        description: 'Ensayo intensivo de testimonio, preparación de testigos y organización final de evidencia.',
        timeline: '2-4 semanas antes de la audiencia',
      },
      {
        step: 7,
        title: 'Audiencia Individual (Merits Hearing)',
        description: 'Representación completa ante el Juez de Inmigración donde se presenta todo el caso de asilo.',
        timeline: '6 meses a 3+ años después de la primera audiencia',
      },
      {
        step: 8,
        title: 'Decisión y apelación si es necesario',
        description: 'El juez emite decisión oral o escrita. Si es denegado, se evalúa apelación ante la BIA.',
        timeline: 'Inmediato a 30 días',
        filingFeeNote: 'Si necesita apelar ante la BIA (Board of Immigration Appeals), el filing fee es de $1,010.',
      },
    ],
    importantNotes: [
      'Debe presentarse a TODAS las audiencias programadas. No asistir puede resultar en una orden de deportación en ausencia.',
      'Puede solicitar permiso de trabajo (EAD) 180 días después de presentar el I-589.',
      'La Corte de Inmigración es parte del DOJ (EOIR), no de USCIS.',
    ],
  },

  'visa-juvenil': {
    slug: 'visa-juvenil',
    totalTimeline: '6 a 18 meses (varía por estado y disponibilidad de visa)',
    stages: [
      {
        step: 1,
        title: 'Evaluación de elegibilidad del menor',
        description: 'Determinar si el menor califica para SIJS: debe ser menor de 21 años, soltero/a, y haber sufrido abuso, negligencia o abandono por uno o ambos padres.',
        timeline: '1-2 semanas',
      },
      {
        step: 2,
        title: 'Petición ante Corte Estatal',
        description: 'Preparar y presentar la petición ante la Corte Juvenil o de Familia del estado para obtener los hallazgos especiales requeridos por ley federal.',
        timeline: '2-6 semanas',
        filingFee: '$0-$365',
        filingFeeNote: 'El filing fee de la corte estatal varía según el estado y condado. En Utah puede ser entre $0-$365 dependiendo del tipo de petición. Se puede solicitar fee waiver.',
      },
      {
        step: 3,
        title: 'Audiencia en Corte Estatal',
        description: 'Comparecer ante el juez estatal para que emita la Special Findings Order determinando abuso/negligencia/abandono.',
        timeline: '1-3 meses después de presentar',
      },
      {
        step: 4,
        title: 'Obtención de Special Findings Order',
        description: 'Recibir la orden judicial con los hallazgos especiales que certifican la elegibilidad del menor para SIJS.',
        timeline: 'Mismo día o 1-2 semanas después de la audiencia',
      },
      {
        step: 5,
        title: 'Preparación y presentación del I-360',
        description: 'Completar la petición de inmigrante juvenil especial ante USCIS con la orden judicial y documentos de soporte.',
        timeline: '2-4 semanas',
        formNumber: 'I-360',
        filingFee: '$250',
        filingFeeNote: 'Filing fee de $250 para peticiones SIJS ante USCIS (tarifa establecida por H.R. 1).',
      },
      {
        step: 6,
        title: 'Aprobación del I-360',
        description: 'USCIS revisa y aprueba la petición. El menor queda clasificado como Inmigrante Juvenil Especial.',
        timeline: '2-6 meses',
      },
      {
        step: 7,
        title: 'Ajuste de Estatus (I-485)',
        description: 'Cuando haya visa disponible, presentar la solicitud de residencia permanente (Green Card) para el menor.',
        timeline: 'Depende de disponibilidad de visa',
        formNumber: 'I-485',
        filingFee: '$1,440',
        filingFeeNote: 'Filing fee de $1,440 para menores de 14 años o $1,440 + $85 (biométricos) para mayores de 14. Se puede solicitar fee waiver.',
      },
      {
        step: 8,
        title: 'Obtención de Green Card',
        description: 'Recibir la tarjeta de residencia permanente del menor beneficiario.',
        timeline: '4-12 meses después de presentar I-485',
      },
    ],
    importantNotes: [
      'El menor DEBE ser menor de 21 años y soltero/a durante todo el proceso.',
      'La Corte Estatal debe emitir la orden ANTES de que el menor cumpla 21 años.',
      'La disponibilidad de visa puede causar esperas adicionales según el país de nacimiento.',
    ],
  },

  'ajuste-de-estatus': {
    slug: 'ajuste-de-estatus',
    totalTimeline: '8 a 36 meses (varía por categoría y oficina local)',
    stages: [
      {
        step: 1,
        title: 'Evaluación de elegibilidad',
        description: 'Revisión completa de historial migratorio, base de elegibilidad (familia, empleo, SIJS, etc.) y posibles impedimentos.',
        timeline: '1-2 semanas',
      },
      {
        step: 2,
        title: 'Recopilación de documentación',
        description: 'Reunir actas de nacimiento, matrimonio, pasaportes, fotografías, historial de direcciones, empleo y educación.',
        timeline: '2-4 semanas',
      },
      {
        step: 3,
        title: 'Preparación del Affidavit of Support (I-864)',
        description: 'Completar la declaración jurada del patrocinador financiero con declaraciones de impuestos y evidencia de ingresos.',
        timeline: '1-2 semanas',
        formNumber: 'I-864',
        filingFee: '$0 (gratis)',
        filingFeeNote: 'No hay filing fee para el I-864. Se presenta como parte del paquete de ajuste.',
      },
      {
        step: 4,
        title: 'Preparación y presentación del I-485',
        description: 'Completar la solicitud de ajuste de estatus con todos los formularios complementarios (I-130, I-765, I-131) y presentar ante USCIS.',
        timeline: '2-3 semanas',
        formNumber: 'I-485',
        filingFee: '$1,440',
        filingFeeNote: 'Filing fee de $1,440 para solicitantes de 14+ años. Incluye el I-765 (permiso de trabajo) y el I-131 (permiso de viaje) cuando se presentan junto con el I-485. Biométricos: $85 adicionales.',
      },
      {
        step: 5,
        title: 'Cita biométrica',
        description: 'Asistir al Application Support Center (ASC) para huellas dactilares, fotografía y firma electrónica.',
        timeline: '3-8 semanas después de presentar',
        filingFee: '$85',
        filingFeeNote: 'Biométricos: $85 para solicitantes de 14 a 78 años.',
      },
      {
        step: 6,
        title: 'Recepción de EAD y Advance Parole',
        description: 'Recibir el permiso de trabajo (EAD) y el documento de viaje (Advance Parole) como combo card.',
        timeline: '3-6 meses después de presentar',
      },
      {
        step: 7,
        title: 'Entrevista en oficina local de USCIS',
        description: 'Preparación y acompañamiento a la entrevista donde el oficial revisa su solicitud y hace preguntas sobre su caso.',
        timeline: '8-24 meses después de presentar',
      },
      {
        step: 8,
        title: 'Decisión y recepción de Green Card',
        description: 'USCIS emite la decisión. Si es aprobado, recibirá su tarjeta de residencia permanente por correo.',
        timeline: '1-4 semanas después de aprobación',
      },
    ],
    importantNotes: [
      'Si presenta I-130 por separado (petición familiar), el filing fee es de $675.',
      'NO viaje fuera de EE.UU. sin Advance Parole aprobado, o perderá su caso.',
      'El permiso de trabajo se renueva automáticamente mientras el I-485 esté pendiente (con extensión de 540 días).',
    ],
  },

  'cambio-de-corte': {
    slug: 'cambio-de-corte',
    totalTimeline: '2 a 4 meses',
    stages: [
      {
        step: 1,
        title: 'Evaluación de elegibilidad',
        description: 'Determinar si califica para el cambio: mudanza a otra jurisdicción, conveniencia de las partes, o buen causa demostrada.',
        timeline: '1 semana',
      },
      {
        step: 2,
        title: 'Recopilación de documentación',
        description: 'Reunir prueba de nueva dirección (contrato de renta, utility bills), carta de empleador, u otra evidencia que justifique el cambio.',
        timeline: '1-2 semanas',
      },
      {
        step: 3,
        title: 'Preparación de la moción',
        description: 'Redactar la Moción de Cambio de Venue con argumentos legales y toda la evidencia de soporte.',
        timeline: '1-2 semanas',
        formNumber: 'Moción ante EOIR',
        filingFee: '$0 (gratis)',
        filingFeeNote: 'No hay filing fee para la moción de cambio de venue ante la Corte de Inmigración.',
      },
      {
        step: 4,
        title: 'Presentación ante la Corte',
        description: 'Presentar la moción ante la Corte de Inmigración actual y enviar copia al abogado del gobierno (ICE/DHS).',
        timeline: '1-2 días',
      },
      {
        step: 5,
        title: 'Decisión del juez y transferencia',
        description: 'El juez revisa la moción y decide. Si aprueba, el caso se transfiere a la nueva corte.',
        timeline: '2-8 semanas para la decisión, 2-4 semanas para la transferencia',
      },
    ],
    importantNotes: [
      'El cambio de venue no está garantizado; el juez tiene discreción.',
      'Debe demostrar "buena causa" para el cambio (ej: mudanza genuina).',
      'Su próxima audiencia será en la nueva corte después de la transferencia.',
    ],
  },

  'mociones': {
    slug: 'mociones',
    totalTimeline: '3 a 12 meses (depende del tipo de moción y la corte)',
    stages: [
      {
        step: 1,
        title: 'Evaluación del caso',
        description: 'Revisar la decisión original, identificar el tipo de moción apropiada (reabrir, reconsiderar, o apelar) y evaluar probabilidad de éxito.',
        timeline: '1-2 semanas',
      },
      {
        step: 2,
        title: 'Investigación legal',
        description: 'Investigar precedentes aplicables, cambios en la ley, y nueva evidencia que pueda apoyar la moción.',
        timeline: '1-3 semanas',
      },
      {
        step: 3,
        title: 'Redacción de la moción',
        description: 'Preparar el documento legal con argumentos, precedentes y evidencia de soporte.',
        timeline: '1-2 semanas',
        formNumber: 'Moción ante EOIR/BIA',
        filingFee: '$145 (Corte) / $1,010 (BIA)',
        filingFeeNote: 'Moción ante Corte de Inmigración: $145. Moción ante la BIA (Board of Immigration Appeals): $1,010 (incluye $900 de tarifa OBBBA FY2026). Se puede solicitar fee waiver si demuestra incapacidad de pago.',
      },
      {
        step: 4,
        title: 'Presentación de la moción',
        description: 'Presentar la moción ante la autoridad correspondiente (Corte de Inmigración o BIA) con todos los documentos de soporte.',
        timeline: '1-2 días',
      },
      {
        step: 5,
        title: 'Decisión y seguimiento',
        description: 'La corte o BIA revisa y emite decisión. Si se aprueba la reapertura, el caso se reprograma para nueva audiencia.',
        timeline: '1-6 meses para la decisión',
      },
    ],
    importantNotes: [
      'La Moción para Reabrir debe presentarse dentro de 90 días de la decisión final (con excepciones).',
      'La Moción para Reconsiderar debe presentarse dentro de 30 días.',
      'Hay excepciones de tiempo para asilo basado en condiciones cambiantes del país.',
      'Una orden de deportación en ausencia puede reabrirse si demuestra circunstancias excepcionales.',
    ],
  },

  'itin-number': {
    slug: 'itin-number',
    totalTimeline: '7 a 11 semanas',
    stages: [
      {
        step: 1,
        title: 'Evaluación y revisión de documentos',
        description: 'Verificar elegibilidad para ITIN y revisar documentos de identidad disponibles (pasaporte, matrícula consular, etc.).',
        timeline: '1 semana',
      },
      {
        step: 2,
        title: 'Preparación del Formulario W-7',
        description: 'Completar la solicitud de ITIN con todos los datos personales y razón de la solicitud.',
        timeline: '1 semana',
        formNumber: 'W-7',
        filingFee: '$0 (gratis)',
        filingFeeNote: 'El IRS NO cobra ningún filing fee por la solicitud de ITIN ni por su renovación.',
      },
      {
        step: 3,
        title: 'Certificación de documentos',
        description: 'Certificar o notarizar copias de documentos de identidad a través de un Certifying Acceptance Agent (CAA) o consulado.',
        timeline: '1-2 semanas',
        filingFee: '$0-$50',
        filingFeeNote: 'Los Acceptance Agents certificados pueden cobrar una tarifa de servicio (~$50). Si va al consulado, generalmente es gratis.',
      },
      {
        step: 4,
        title: 'Presentación ante el IRS',
        description: 'Enviar la solicitud W-7 con la declaración de impuestos (o excepción) y documentos certificados al IRS.',
        timeline: '1-2 días para enviar',
      },
      {
        step: 5,
        title: 'Procesamiento y emisión',
        description: 'El IRS procesa la solicitud y emite el número ITIN por correo.',
        timeline: '7 semanas (procesamiento estándar del IRS)',
      },
    ],
    importantNotes: [
      'El ITIN se presenta normalmente junto con la declaración de impuestos (tax return).',
      'Los ITINs que no se han usado en una declaración de impuestos en los últimos 3 años consecutivos vencen.',
      'NO envíe documentos originales a menos que quiera que se los devuelvan (tarda más).',
    ],
  },

  'licencia-de-conducir': {
    slug: 'licencia-de-conducir',
    totalTimeline: '2 a 6 semanas',
    stages: [
      {
        step: 1,
        title: 'Evaluación de requisitos del estado',
        description: 'Determinar elegibilidad según el estado de residencia. En Utah se emite la Driving Privilege Card (DPC) para personas sin estatus legal.',
        timeline: '1 semana',
      },
      {
        step: 2,
        title: 'Preparación de documentos',
        description: 'Reunir documentos requeridos: prueba de identidad (pasaporte, ITIN), prueba de residencia en Utah (utility bills, contrato de renta), y prueba de seguro de auto.',
        timeline: '1-2 semanas',
      },
      {
        step: 3,
        title: 'Programación de cita en DLD',
        description: 'Programar cita en el Driver License Division de Utah y preparar el pago.',
        timeline: '1-2 semanas',
        filingFee: '$32',
        filingFeeNote: 'Tarifa del estado de Utah para la Driving Privilege Card (DPC) original: $32. Renovación: $23.',
      },
      {
        step: 4,
        title: 'Exámenes y obtención',
        description: 'Asistir a la cita para el examen escrito (disponible en español), examen de la vista, y examen práctico de manejo.',
        timeline: '1 día (con cita)',
        filingFee: 'Incluido en los $32',
      },
    ],
    importantNotes: [
      'La Driving Privilege Card (DPC) de Utah NO es una identificación oficial — solo autoriza a conducir.',
      'Debe tener seguro de auto ANTES de obtener la DPC.',
      'El examen escrito está disponible en español.',
      'La DPC es válida por 1 año y debe renovarse.',
    ],
  },

  'taxes': {
    slug: 'taxes',
    totalTimeline: '2 a 4 semanas',
    stages: [
      {
        step: 1,
        title: 'Recopilación de documentación financiera',
        description: 'Reunir formularios W-2, 1099, recibos de pagos, ITIN o SSN, y cualquier otro documento de ingresos del año fiscal.',
        timeline: '1 semana',
      },
      {
        step: 2,
        title: 'Evaluación de deducciones y créditos',
        description: 'Analizar deducciones aplicables (estándar o detallada) y créditos fiscales como Child Tax Credit, Earned Income Credit, etc.',
        timeline: '2-3 días',
      },
      {
        step: 3,
        title: 'Preparación de la declaración',
        description: 'Completar la declaración de impuestos federal (Form 1040) y estatal (Utah TC-40) con toda la información financiera.',
        timeline: '1 semana',
        formNumber: '1040 + TC-40',
        filingFee: '$0 (gratis)',
        filingFeeNote: 'El IRS no cobra por presentar la declaración de impuestos electrónicamente (e-file). Utah tampoco cobra por el e-file estatal.',
      },
      {
        step: 4,
        title: 'Revisión y firma',
        description: 'Revisar la declaración completa con el cliente, confirmar exactitud de los datos, y obtener firma electrónica.',
        timeline: '1-2 días',
      },
      {
        step: 5,
        title: 'Presentación electrónica',
        description: 'Enviar la declaración (e-file) al IRS y al estado de Utah. Recibir confirmación de aceptación.',
        timeline: '24-48 horas para aceptación',
      },
    ],
    importantNotes: [
      'Si tiene ITIN, puede declarar impuestos normalmente.',
      'El reembolso típico se recibe en 2-3 semanas por depósito directo.',
      'Declarar impuestos crea un historial fiscal positivo que puede beneficiar procesos migratorios futuros.',
      'La fecha límite regular es el 15 de abril de cada año.',
    ],
  },
}

export function getServiceInfo(slug: string): ServiceInfo | null {
  return serviceInfoMap[slug] || null
}
