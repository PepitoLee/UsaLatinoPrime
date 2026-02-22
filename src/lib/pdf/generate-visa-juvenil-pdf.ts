import jsPDF from 'jspdf'

export interface VisaJuvenilPDFInput {
  // Minor info
  minor_first_name: string
  minor_last_name: string
  minor_middle_name?: string
  minor_dob: string
  minor_age: number
  minor_gender: string
  minor_country_of_birth: string
  minor_nationality: string
  minor_native_language: string
  minor_speaks_english: boolean
  minor_current_address: string
  minor_city: string
  minor_state: string
  minor_zip: string
  minor_phone?: string
  minor_email?: string
  minor_entry_date: string
  minor_entry_manner: string
  minor_a_number?: string
  minor_in_removal: boolean
  minor_current_guardian: string
  minor_guardian_relationship: string
  minor_school_enrolled: boolean
  minor_school_name?: string
  minor_grade?: string

  // Parents info
  father_first_name?: string
  father_last_name?: string
  father_dob?: string
  father_country_of_birth?: string
  father_location?: string
  father_relationship_status?: string
  father_abuse_neglect: boolean
  father_abuse_details?: string
  mother_first_name?: string
  mother_last_name?: string
  mother_dob?: string
  mother_country_of_birth?: string
  mother_location?: string
  mother_relationship_status?: string
  mother_abuse_neglect: boolean
  mother_abuse_details?: string
  parents_marital_status?: string
  reunification_viable: boolean
  reunification_explanation: string

  // Abuse history
  abuse_types: string
  abuse_narrative: string
  abuse_start_date: string
  abuse_ongoing: string
  abuse_reported: boolean
  abuse_report_details?: string
  therapy_received: boolean
  therapy_details?: string
  state_court_involved: boolean
  state_court_details?: string
  state_court_state?: string
  best_interest_in_us: string

  created_at: string
}

function formatDateSpanish(dateStr: string): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'))
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
}

const NAVY = [0, 40, 85] as const
const BODY_COLOR = [40, 40, 40] as const
const BODY_SIZE = 9.5
const SECTION_TITLE_SIZE = 11
const FONT = 'helvetica'
const WEIGHT = 'normal'

export function generateVisaJuvenilPDF(input: VisaJuvenilPDFInput): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function bodyStyle() {
    doc.setFont(FONT, WEIGHT)
    doc.setFontSize(BODY_SIZE)
    doc.setTextColor(...BODY_COLOR)
  }

  function checkPageBreak(neededSpace: number) {
    if (y + neededSpace > pageHeight - 25) {
      addFooter()
      doc.addPage()
      y = margin
    }
  }

  function addFooter() {
    doc.setFont(FONT, WEIGHT)
    doc.setFontSize(7)
    doc.setTextColor(160, 160, 160)
    doc.text('UsaLatinoPrime - Formulario Visa Juvenil (SIJS)', margin, pageHeight - 12)
    const genDate = new Date().toLocaleString('es-US')
    doc.text(`Generado: ${genDate}`, pageWidth - margin, pageHeight - 12, { align: 'right' })
    doc.setDrawColor(230, 230, 230)
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16)
  }

  function sectionTitle(text: string) {
    checkPageBreak(15)
    doc.setFont(FONT, WEIGHT)
    doc.setFontSize(SECTION_TITLE_SIZE)
    doc.setTextColor(...NAVY)
    doc.text(text, margin, y)
    y += 1.5
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6
    bodyStyle()
  }

  function fieldLine(label: string, value: string) {
    checkPageBreak(8)
    bodyStyle()
    doc.setFont(FONT, 'bold')
    doc.text(label, margin + 2, y)
    const labelWidth = doc.getTextWidth(label + '  ')
    doc.setFont(FONT, WEIGHT)
    doc.text(value || 'N/A', margin + 2 + labelWidth, y)
    y += 6
  }

  function textBlock(label: string, value: string) {
    checkPageBreak(12)
    doc.setFont(FONT, 'bold')
    doc.setFontSize(BODY_SIZE)
    doc.setTextColor(...BODY_COLOR)
    doc.text(label, margin + 2, y)
    y += 5
    bodyStyle()
    const lines = doc.splitTextToSize(value || 'N/A', contentWidth - 8)
    checkPageBreak(lines.length * 4 + 6)
    doc.setFillColor(248, 248, 248)
    doc.roundedRect(margin + 2, y - 3, contentWidth - 4, lines.length * 4 + 4, 1, 1, 'F')
    doc.text(lines, margin + 4, y)
    y += lines.length * 4 + 6
  }

  function boolField(label: string, value: boolean) {
    checkPageBreak(8)
    bodyStyle()
    doc.setFont(FONT, 'bold')
    doc.text(label, margin + 2, y)
    const labelWidth = doc.getTextWidth(label + '  ')
    doc.setFont(FONT, WEIGHT)
    doc.text(value ? 'Si' : 'No', margin + 2 + labelWidth, y)
    y += 6
  }

  // === HEADER ===
  doc.setFont(FONT, WEIGHT)
  doc.setFontSize(18)
  doc.setTextColor(...NAVY)
  doc.text('UsaLatinoPrime', margin, y)
  y += 8

  // Gold line
  doc.setDrawColor(242, 169, 0)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // Title
  doc.setFont(FONT, WEIGHT)
  doc.setFontSize(13)
  doc.setTextColor(...NAVY)
  doc.text('FORMULARIO VISA JUVENIL (SIJS)', pageWidth / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text(`Enviado: ${formatDateSpanish(input.created_at)}`, pageWidth / 2, y, { align: 'center' })
  y += 10

  // === SECCION 1: INFO DEL MENOR ===
  sectionTitle('1. INFORMACION DEL MENOR')
  const fullName = [input.minor_first_name, input.minor_middle_name, input.minor_last_name].filter(Boolean).join(' ')
  fieldLine('Nombre completo:', fullName)
  fieldLine('Fecha de nacimiento:', formatDateSpanish(input.minor_dob))
  fieldLine('Edad:', `${input.minor_age} anos`)
  fieldLine('Sexo:', input.minor_gender)
  fieldLine('Pais de nacimiento:', input.minor_country_of_birth)
  fieldLine('Nacionalidad:', input.minor_nationality)
  fieldLine('Idioma nativo:', input.minor_native_language)
  boolField('¿Habla ingles?', input.minor_speaks_english)
  y += 2
  fieldLine('Direccion:', `${input.minor_current_address}, ${input.minor_city}, ${input.minor_state} ${input.minor_zip}`)
  if (input.minor_phone) fieldLine('Telefono:', input.minor_phone)
  if (input.minor_email) fieldLine('Email:', input.minor_email)
  y += 2
  fieldLine('Fecha de entrada a EE.UU.:', formatDateSpanish(input.minor_entry_date))
  fieldLine('Manera de entrada:', input.minor_entry_manner)
  if (input.minor_a_number) fieldLine('Numero A:', input.minor_a_number)
  boolField('¿En proceso de deportacion?', input.minor_in_removal)
  y += 2
  fieldLine('Guardian actual:', input.minor_current_guardian)
  fieldLine('Relacion con guardian:', input.minor_guardian_relationship)
  boolField('¿Inscrito en escuela?', input.minor_school_enrolled)
  if (input.minor_school_enrolled && input.minor_school_name) {
    fieldLine('Escuela:', input.minor_school_name)
    if (input.minor_grade) fieldLine('Grado:', input.minor_grade)
  }
  y += 4

  // === SECCION 2: INFO DE LOS PADRES ===
  sectionTitle('2. INFORMACION DE LOS PADRES')

  // Padre
  const fatherName = [input.father_first_name, input.father_last_name].filter(Boolean).join(' ')
  if (fatherName) {
    doc.setFont(FONT, 'bold')
    doc.setFontSize(BODY_SIZE)
    doc.setTextColor(...NAVY)
    checkPageBreak(8)
    doc.text('PADRE', margin + 2, y)
    y += 6
    bodyStyle()
    fieldLine('Nombre:', fatherName)
    if (input.father_dob) fieldLine('Fecha de nacimiento:', input.father_dob)
    if (input.father_country_of_birth) fieldLine('Pais de nacimiento:', input.father_country_of_birth)
    if (input.father_location) fieldLine('Ubicacion actual:', input.father_location)
    if (input.father_relationship_status) fieldLine('Relacion con el menor:', input.father_relationship_status)
    boolField('¿Abuso/abandono/negligencia?', input.father_abuse_neglect)
    if (input.father_abuse_neglect && input.father_abuse_details) {
      textBlock('Detalles del abuso del padre:', input.father_abuse_details)
    }
    y += 2
  }

  // Madre
  const motherName = [input.mother_first_name, input.mother_last_name].filter(Boolean).join(' ')
  if (motherName) {
    doc.setFont(FONT, 'bold')
    doc.setFontSize(BODY_SIZE)
    doc.setTextColor(...NAVY)
    checkPageBreak(8)
    doc.text('MADRE', margin + 2, y)
    y += 6
    bodyStyle()
    fieldLine('Nombre:', motherName)
    if (input.mother_dob) fieldLine('Fecha de nacimiento:', input.mother_dob)
    if (input.mother_country_of_birth) fieldLine('Pais de nacimiento:', input.mother_country_of_birth)
    if (input.mother_location) fieldLine('Ubicacion actual:', input.mother_location)
    if (input.mother_relationship_status) fieldLine('Relacion con el menor:', input.mother_relationship_status)
    boolField('¿Abuso/abandono/negligencia?', input.mother_abuse_neglect)
    if (input.mother_abuse_neglect && input.mother_abuse_details) {
      textBlock('Detalles del abuso de la madre:', input.mother_abuse_details)
    }
    y += 2
  }

  if (input.parents_marital_status) fieldLine('Estado civil de los padres:', input.parents_marital_status)
  boolField('¿Reunificacion viable?', input.reunification_viable)
  textBlock('Explicacion de reunificacion:', input.reunification_explanation)

  // === SECCION 3: HISTORIA DE ABUSO ===
  sectionTitle('3. HISTORIA DE ABUSO, ABANDONO O NEGLIGENCIA')
  fieldLine('Tipos de maltrato:', input.abuse_types)
  textBlock('Narrativa del abuso:', input.abuse_narrative)
  fieldLine('¿Cuando comenzo?', input.abuse_start_date)
  fieldLine('Estado actual:', input.abuse_ongoing)
  y += 2
  boolField('¿Reportado a autoridades?', input.abuse_reported)
  if (input.abuse_reported && input.abuse_report_details) {
    textBlock('Detalles del reporte:', input.abuse_report_details)
  }
  boolField('¿Recibio terapia?', input.therapy_received)
  if (input.therapy_received && input.therapy_details) {
    textBlock('Detalles de terapia:', input.therapy_details)
  }
  boolField('¿Caso en tribunal estatal?', input.state_court_involved)
  if (input.state_court_involved) {
    if (input.state_court_details) textBlock('Detalles del tribunal:', input.state_court_details)
    if (input.state_court_state) fieldLine('Estado del tribunal:', input.state_court_state)
  }
  y += 2
  textBlock('¿Por que debe permanecer en EE.UU.?', input.best_interest_in_us)

  // Footer on last page
  addFooter()

  return doc
}
