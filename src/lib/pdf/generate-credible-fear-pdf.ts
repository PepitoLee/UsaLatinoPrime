import jsPDF from 'jspdf'

export interface CredibleFearPDFInput {
  full_name: string
  date_of_birth: string
  country_of_origin: string
  entry_date: string
  entry_method: string
  reason_for_leaving: string
  who_harmed: string
  what_happened: string
  when_happened: string
  where_happened: string
  had_witnesses: boolean
  witnesses_detail?: string
  has_evidence: boolean
  evidence_detail?: string
  went_to_police: boolean
  why_not_police?: string
  police_response?: string
  fear_if_return: string
  who_would_look: string
  still_receiving_threats: boolean
  threats_detail?: string
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

export function generateCredibleFearPDF(input: CredibleFearPDFInput): jsPDF {
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
    doc.text('UsaLatinoPrime - Declaracion de Miedo Creible', margin, pageHeight - 12)
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
    doc.text(value, margin + 2 + labelWidth, y)
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
    // Light background for text blocks
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
  doc.text('DECLARACION DE MIEDO CREIBLE', pageWidth / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text(`Enviado: ${formatDateSpanish(input.created_at)}`, pageWidth / 2, y, { align: 'center' })
  y += 10

  // === SECCION 1: INFO PERSONAL ===
  sectionTitle('1. INFORMACION PERSONAL')
  fieldLine('Nombre completo:', input.full_name)
  fieldLine('Fecha de nacimiento:', formatDateSpanish(input.date_of_birth))
  fieldLine('Pais de origen:', input.country_of_origin)
  fieldLine('Fecha de entrada a EE.UU.:', formatDateSpanish(input.entry_date))
  fieldLine('Metodo de entrada:', input.entry_method)
  y += 4

  // === SECCION 2: MOTIVO DE SALIDA ===
  sectionTitle('2. MOTIVO DE SALIDA DE SU PAIS')
  textBlock('¿Por que salio de su pais?', input.reason_for_leaving)

  // === SECCION 3: EVENTOS DE PERSECUCION ===
  sectionTitle('3. EVENTOS DE PERSECUCION')
  textBlock('¿Quien le hizo dano o lo amenazo?', input.who_harmed)
  textBlock('¿Que paso exactamente?', input.what_happened)
  fieldLine('¿Cuando paso?', input.when_happened)
  fieldLine('¿Donde paso?', input.where_happened)
  y += 2
  boolField('¿Hubo testigos?', input.had_witnesses)
  if (input.had_witnesses && input.witnesses_detail) {
    textBlock('Detalle de testigos:', input.witnesses_detail)
  }
  boolField('¿Tiene pruebas o evidencia?', input.has_evidence)
  if (input.has_evidence && input.evidence_detail) {
    textBlock('Detalle de evidencia:', input.evidence_detail)
  }

  // === SECCION 4: PROTECCION EN SU PAIS ===
  sectionTitle('4. PROTECCION EN SU PAIS')
  boolField('¿Acudio a la policia u otras autoridades?', input.went_to_police)
  if (!input.went_to_police && input.why_not_police) {
    textBlock('¿Por que no acudio a la policia?', input.why_not_police)
  }
  if (input.went_to_police && input.police_response) {
    textBlock('¿Que hizo la policia?', input.police_response)
  }

  // === SECCION 5: TEMOR ACTUAL ===
  sectionTitle('5. TEMOR ACTUAL')
  textBlock('¿Que le pasaria si regresa a su pais?', input.fear_if_return)
  textBlock('¿Quien lo buscaria o perseguiria?', input.who_would_look)
  boolField('¿Sigue recibiendo amenazas?', input.still_receiving_threats)
  if (input.still_receiving_threats && input.threats_detail) {
    textBlock('Detalle de amenazas actuales:', input.threats_detail)
  }

  // Footer on last page
  addFooter()

  return doc
}
