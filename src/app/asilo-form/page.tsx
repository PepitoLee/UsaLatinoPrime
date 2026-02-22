'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Play, CheckCircle, Loader2, Plus, X } from 'lucide-react'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC','PR','GU','VI',
]

const LATIN_COUNTRIES = [
  'Mexico','Guatemala','Honduras','El Salvador','Nicaragua','Costa Rica','Panama',
  'Colombia','Venezuela','Ecuador','Peru','Bolivia','Brasil','Chile','Argentina',
  'Uruguay','Paraguay','Cuba','Republica Dominicana','Haiti','Otros',
]

const ENTRY_STATUSES = [
  'Visa de turista (B-1/B-2)','Visa de estudiante (F-1)','Visa de trabajo',
  'Parole','Sin inspeccion (cruzo la frontera)','TPS','Otro',
]

const PERSECUTION_GROUNDS = [
  'Raza','Religion','Nacionalidad','Opinion politica','Pertenencia a un grupo social particular',
]

interface ChildEntry {
  child_last_name: string; child_first_name: string; child_dob: string; child_gender: string;
  child_country_of_birth: string; child_nationality: string; child_a_number: string;
  child_in_us: boolean; child_include_in_application: boolean; child_marital_status: boolean;
}

interface ResidenceEntry { res_address: string; res_city: string; res_country: string; res_from: string; res_to: string }
interface EmploymentEntry { emp_employer: string; emp_address: string; emp_occupation: string; emp_from: string; emp_to: string }
interface EducationEntry { edu_school: string; edu_type: string; edu_location: string; edu_from: string; edu_to: string }
interface SiblingEntry { sibling_name: string; sibling_country_of_birth: string; sibling_deceased: boolean; sibling_current_location: string }
interface CountryVisited { country: string; duration: string; purpose: string }

const emptyChild: ChildEntry = { child_last_name: '', child_first_name: '', child_dob: '', child_gender: '', child_country_of_birth: '', child_nationality: '', child_a_number: '', child_in_us: false, child_include_in_application: false, child_marital_status: false }
const emptyResidence: ResidenceEntry = { res_address: '', res_city: '', res_country: '', res_from: '', res_to: '' }
const emptyEmployment: EmploymentEntry = { emp_employer: '', emp_address: '', emp_occupation: '', emp_from: '', emp_to: '' }
const emptyEducation: EducationEntry = { edu_school: '', edu_type: '', edu_location: '', edu_from: '', edu_to: '' }
const emptySibling: SiblingEntry = { sibling_name: '', sibling_country_of_birth: '', sibling_deceased: false, sibling_current_location: '' }
const emptyCountry: CountryVisited = { country: '', duration: '', purpose: '' }

const sections = [
  { id: 1, title: 'Informacion Personal' },
  { id: 2, title: 'Informacion de Inmigracion' },
  { id: 3, title: 'Conyuge e Hijos' },
  { id: 4, title: 'Historial de Residencia, Empleo y Familia' },
  { id: 5, title: 'Historia de Persecucion' },
  { id: 6, title: 'Informacion Adicional' },
  { id: 7, title: 'Historial de Viajes' },
]

export default function AsiloFormPage() {
  // Step 1
  const [legalLastName, setLegalLastName] = useState('')
  const [legalFirstName, setLegalFirstName] = useState('')
  const [legalMiddleName, setLegalMiddleName] = useState('')
  const [otherNames, setOtherNames] = useState<string[]>([])
  const [resStreet, setResStreet] = useState('')
  const [resCity, setResCity] = useState('')
  const [resState, setResState] = useState('')
  const [resZip, setResZip] = useState('')
  const [resPhone, setResPhone] = useState('')
  const [mailingSame, setMailingSame] = useState(true)
  const [mailingStreet, setMailingStreet] = useState('')
  const [mailingCity, setMailingCity] = useState('')
  const [mailingState, setMailingState] = useState('')
  const [mailingZip, setMailingZip] = useState('')
  const [gender, setGender] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [dob, setDob] = useState('')
  const [cityOfBirth, setCityOfBirth] = useState('')
  const [countryOfBirth, setCountryOfBirth] = useState('')
  const [nationality, setNationality] = useState('')
  const [raceEthnicity, setRaceEthnicity] = useState('')
  const [religion, setReligion] = useState('')
  const [nativeLanguage, setNativeLanguage] = useState('')
  const [speaksEnglish, setSpeaksEnglish] = useState(false)
  const [otherLanguages, setOtherLanguages] = useState('')

  // Step 2
  const [courtProceedings, setCourtProceedings] = useState(false)
  const [lastEntryDate, setLastEntryDate] = useState('')
  const [i94Number, setI94Number] = useState('')
  const [entryStatus, setEntryStatus] = useState('')
  const [entryStatusOther, setEntryStatusOther] = useState('')
  const [entryPlace, setEntryPlace] = useState('')
  const [statusExpires, setStatusExpires] = useState('')
  const [passportNumber, setPassportNumber] = useState('')
  const [passportCountry, setPassportCountry] = useState('')
  const [passportExpiry, setPassportExpiry] = useState('')
  const [travelDocNumber, setTravelDocNumber] = useState('')
  const [aNumber, setANumber] = useState('')
  const [ssnNumber, setSsnNumber] = useState('')
  const [uscisAccount, setUscisAccount] = useState('')

  // Step 3
  const [hasSpouse, setHasSpouse] = useState(false)
  const [spouseLastName, setSpouseLastName] = useState('')
  const [spouseFirstName, setSpouseFirstName] = useState('')
  const [spouseMiddleName, setSpouseMiddleName] = useState('')
  const [spouseOtherNames, setSpouseOtherNames] = useState('')
  const [spouseDob, setSpouseDob] = useState('')
  const [spouseGender, setSpouseGender] = useState('')
  const [spouseNationality, setSpouseNationality] = useState('')
  const [spouseANumber, setSpouseANumber] = useState('')
  const [spouseSsn, setSpouseSsn] = useState('')
  const [spouseInUs, setSpouseInUs] = useState(false)
  const [spouseInclude, setSpouseInclude] = useState(false)
  const [spouseImmStatus, setSpouseImmStatus] = useState('')
  const [marriageDate, setMarriageDate] = useState('')
  const [marriagePlace, setMarriagePlace] = useState('')
  const [hasChildren, setHasChildren] = useState(false)
  const [children, setChildren] = useState<ChildEntry[]>([])

  // Step 4
  const [lastAddrStreet, setLastAddrStreet] = useState('')
  const [lastAddrCity, setLastAddrCity] = useState('')
  const [lastAddrState, setLastAddrState] = useState('')
  const [lastAddrCountry, setLastAddrCountry] = useState('')
  const [lastAddrFrom, setLastAddrFrom] = useState('')
  const [lastAddrTo, setLastAddrTo] = useState('')
  const [residences, setResidences] = useState<ResidenceEntry[]>([])
  const [employments, setEmployments] = useState<EmploymentEntry[]>([])
  const [educationList, setEducationList] = useState<EducationEntry[]>([])
  const [motherName, setMotherName] = useState('')
  const [motherCountry, setMotherCountry] = useState('')
  const [motherDeceased, setMotherDeceased] = useState(false)
  const [motherLocation, setMotherLocation] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [fatherCountry, setFatherCountry] = useState('')
  const [fatherDeceased, setFatherDeceased] = useState(false)
  const [fatherLocation, setFatherLocation] = useState('')
  const [siblings, setSiblings] = useState<SiblingEntry[]>([])

  // Step 5
  const [persecutionGrounds, setPersecutionGrounds] = useState<string[]>([])
  const [pastHarm, setPastHarm] = useState(false)
  const [pastHarmDesc, setPastHarmDesc] = useState('')
  const [fearOfReturn, setFearOfReturn] = useState(false)
  const [fearDesc, setFearDesc] = useState('')
  const [harmPerpetrators, setHarmPerpetrators] = useState('')
  const [reportedAuth, setReportedAuth] = useState(false)
  const [authResponse, setAuthResponse] = useState('')
  const [whyNotReported, setWhyNotReported] = useState('')
  const [orgMembership, setOrgMembership] = useState('')
  const [continuedMembership, setContinuedMembership] = useState(false)

  // Step 6
  const [priorAsylum, setPriorAsylum] = useState(false)
  const [priorAsylumDetails, setPriorAsylumDetails] = useState('')
  const [arrested, setArrested] = useState(false)
  const [arrestedDetails, setArrestedDetails] = useState('')
  const [causedHarm, setCausedHarm] = useState(false)
  const [causedHarmDetails, setCausedHarmDetails] = useState('')
  const [returnOther, setReturnOther] = useState(false)
  const [returnOtherExpl, setReturnOtherExpl] = useState('')
  const [cat, setCat] = useState(false)
  const [govAffiliation, setGovAffiliation] = useState(false)
  const [govDetails, setGovDetails] = useState('')

  // Step 7
  const [travelToUs, setTravelToUs] = useState('')
  const [countriesVisited, setCountriesVisited] = useState<CountryVisited[]>([])
  const [asylumOtherCountry, setAsylumOtherCountry] = useState(false)
  const [otherCountryDetails, setOtherCountryDetails] = useState('')

  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]))
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleSection(id: number) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function togglePersecutionGround(ground: string) {
    setPersecutionGrounds(prev =>
      prev.includes(ground) ? prev.filter(g => g !== ground) : [...prev, ground]
    )
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!legalLastName.trim()) e.legalLastName = 'Apellido requerido'
    if (!legalFirstName.trim()) e.legalFirstName = 'Nombre requerido'
    if (!resStreet.trim()) e.resStreet = 'Direccion requerida'
    if (!resCity.trim()) e.resCity = 'Ciudad requerida'
    if (!resState) e.resState = 'Estado requerido'
    if (!resZip.trim()) e.resZip = 'Codigo postal requerido'
    if (!resPhone.trim()) e.resPhone = 'Telefono requerido'
    if (!gender) e.gender = 'Sexo requerido'
    if (!maritalStatus) e.maritalStatus = 'Estado civil requerido'
    if (!dob) e.dob = 'Fecha de nacimiento requerida'
    if (!cityOfBirth.trim()) e.cityOfBirth = 'Ciudad de nacimiento requerida'
    if (!countryOfBirth) e.countryOfBirth = 'Pais requerido'
    if (!nationality) e.nationality = 'Nacionalidad requerida'
    if (!nativeLanguage.trim()) e.nativeLanguage = 'Idioma requerido'
    if (!lastEntryDate) e.lastEntryDate = 'Fecha de entrada requerida'
    if (!entryStatus) e.entryStatus = 'Estatus requerido'
    if (!entryPlace.trim()) e.entryPlace = 'Lugar de entrada requerido'
    if (persecutionGrounds.length === 0) e.persecutionGrounds = 'Seleccione al menos una base'
    if (!harmPerpetrators.trim()) e.harmPerpetrators = 'Indique quien le causo dano'
    if (!travelToUs.trim()) e.travelToUs = 'Describa su viaje'

    setErrors(e)
    if (Object.keys(e).length > 0) {
      const sectionErrors = new Set<number>()
      const s1 = ['legalLastName','legalFirstName','resStreet','resCity','resState','resZip','resPhone','gender','maritalStatus','dob','cityOfBirth','countryOfBirth','nationality','nativeLanguage']
      const s2 = ['lastEntryDate','entryStatus','entryPlace']
      const s5 = ['persecutionGrounds','harmPerpetrators']
      const s7 = ['travelToUs']
      for (const key of Object.keys(e)) {
        if (s1.includes(key)) sectionErrors.add(1)
        if (s2.includes(key)) sectionErrors.add(2)
        if (s5.includes(key)) sectionErrors.add(5)
        if (s7.includes(key)) sectionErrors.add(7)
      }
      setOpenSections(prev => new Set([...prev, ...sectionErrors]))
      return false
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) { toast.error('Por favor complete los campos requeridos'); return }

    const body = {
      legal_last_name: legalLastName, legal_first_name: legalFirstName, legal_middle_name: legalMiddleName,
      other_names: otherNames.filter(Boolean),
      residence_address_street: resStreet, residence_address_city: resCity,
      residence_address_state: resState, residence_address_zip: resZip, residence_phone: resPhone,
      mailing_same_as_residence: mailingSame,
      ...(!mailingSame ? { mailing_address: { street: mailingStreet, city: mailingCity, state: mailingState, zip: mailingZip } } : {}),
      gender, marital_status: maritalStatus, date_of_birth: dob,
      city_of_birth: cityOfBirth, country_of_birth: countryOfBirth, nationality,
      race_ethnicity: raceEthnicity, religion, native_language: nativeLanguage,
      speaks_english: speaksEnglish, other_languages: otherLanguages,
      immigration_court_proceedings: courtProceedings, last_entry_date: lastEntryDate,
      i94_number: i94Number, entry_status: entryStatus, entry_status_other: entryStatusOther,
      entry_place: entryPlace, status_expires: statusExpires,
      passport_number: passportNumber, passport_country: passportCountry, passport_expiry: passportExpiry,
      travel_document_number: travelDocNumber, a_number: aNumber, ssn: ssnNumber, uscis_account: uscisAccount,
      has_spouse: hasSpouse,
      ...(hasSpouse ? { spouse_info: {
        spouse_last_name: spouseLastName, spouse_first_name: spouseFirstName, spouse_middle_name: spouseMiddleName,
        spouse_other_names: spouseOtherNames, spouse_dob: spouseDob, spouse_gender: spouseGender,
        spouse_nationality: spouseNationality, spouse_a_number: spouseANumber, spouse_ssn: spouseSsn,
        spouse_in_us: spouseInUs, spouse_include_in_application: spouseInclude,
        spouse_immigration_status: spouseImmStatus, marriage_date: marriageDate, marriage_place: marriagePlace,
      }} : {}),
      has_children: hasChildren, children,
      last_address_before_us: { street: lastAddrStreet, city: lastAddrCity, state: lastAddrState, country: lastAddrCountry, from: lastAddrFrom, to: lastAddrTo },
      residences_last_5_years: residences, employment_last_5_years: employments,
      education: educationList, mother_name: motherName, mother_country_of_birth: motherCountry,
      mother_deceased: motherDeceased, mother_current_location: motherLocation,
      father_name: fatherName, father_country_of_birth: fatherCountry,
      father_deceased: fatherDeceased, father_current_location: fatherLocation, siblings,
      persecution_grounds: persecutionGrounds, past_harm: pastHarm, past_harm_description: pastHarmDesc,
      fear_of_return: fearOfReturn, fear_description: fearDesc, harm_perpetrators: harmPerpetrators,
      reported_to_authorities: reportedAuth, authority_response: authResponse, why_not_reported: whyNotReported,
      organization_membership: orgMembership, continued_membership: continuedMembership,
      prior_asylum_application: priorAsylum, prior_asylum_details: priorAsylumDetails,
      arrested_detained: arrested, arrested_details: arrestedDetails,
      caused_harm: causedHarm, caused_harm_details: causedHarmDetails,
      return_other_country: returnOther, return_other_country_explanation: returnOtherExpl,
      convention_against_torture: cat, us_government_affiliation: govAffiliation, us_government_details: govDetails,
      travel_to_us: travelToUs, countries_visited: countriesVisited,
      applied_asylum_other_country: asylumOtherCountry, other_country_asylum_details: otherCountryDetails,
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/asilo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const data = await res.json(); toast.error(data.error || 'Error al enviar'); return }
      setSubmitted(true)
      toast.success('Formulario enviado exitosamente')
    } catch { toast.error('Error de conexion. Intente de nuevo.') }
    finally { setSubmitting(false) }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#002855] mb-2">Formulario Enviado</h2>
          <p className="text-gray-600 mb-6">
            Su formulario I-589 de asilo ha sido recibido exitosamente.
            Un representante de UsaLatinoPrime lo contactara pronto para revisar su caso.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-[#002855]">
            <p className="font-medium">¿Tiene preguntas?</p>
            <p className="mt-1">Contactenos al <span className="font-semibold">801-941-3479</span></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <header className="bg-[#002855] text-white py-4 px-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F2A900] rounded-lg flex items-center justify-center font-bold text-[#002855] text-lg">U</div>
          <div>
            <h1 className="text-lg font-bold leading-tight">UsaLatinoPrime</h1>
            <p className="text-xs text-blue-200">Formulario I-589 — Solicitud de Asilo</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Video Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="aspect-video bg-gradient-to-br from-[#002855] to-[#003d7a] flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <p className="text-sm font-medium">Video de instrucciones</p>
            <p className="text-xs text-blue-200 mt-1">Proximamente</p>
          </div>
        </div>

        <div className="bg-[#F2A900]/10 border border-[#F2A900]/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-[#002855] font-medium mb-1">Instrucciones:</p>
          <p className="text-sm text-gray-700">
            Complete las 7 secciones del formulario I-589 con la mayor cantidad de detalle posible.
            Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios.
            Esta informacion es confidencial y sera utilizada unicamente para su solicitud de asilo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Section 1: Info Personal ── */}
          <SectionAccordion section={sections[0]} isOpen={openSections.has(1)} onToggle={() => toggleSection(1)}
            hasErrors={['legalLastName','legalFirstName','resStreet','resCity','resState','resZip','resPhone','gender','maritalStatus','dob','cityOfBirth','countryOfBirth','nationality','nativeLanguage'].some(k => errors[k])}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Apellido legal" error={errors.legalLastName} required>
                  <input type="text" value={legalLastName} onChange={e => setLegalLastName(e.target.value)} placeholder="Apellido" className={inputClass(errors.legalLastName)} />
                </Field>
                <Field label="Nombre legal" error={errors.legalFirstName} required>
                  <input type="text" value={legalFirstName} onChange={e => setLegalFirstName(e.target.value)} placeholder="Nombre" className={inputClass(errors.legalFirstName)} />
                </Field>
                <Field label="Segundo nombre">
                  <input type="text" value={legalMiddleName} onChange={e => setLegalMiddleName(e.target.value)} className={inputClass()} />
                </Field>
              </div>

              <RepeatableText label="Otros nombres usados" items={otherNames} setItems={setOtherNames} placeholder="Alias, nombre de soltera..." />

              <Field label="Direccion de residencia (calle)" error={errors.resStreet} required>
                <input type="text" value={resStreet} onChange={e => setResStreet(e.target.value)} className={inputClass(errors.resStreet)} />
              </Field>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Ciudad" error={errors.resCity} required>
                  <input type="text" value={resCity} onChange={e => setResCity(e.target.value)} className={inputClass(errors.resCity)} />
                </Field>
                <Field label="Estado" error={errors.resState} required>
                  <select value={resState} onChange={e => setResState(e.target.value)} className={inputClass(errors.resState)}>
                    <option value="">Seleccione</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Codigo postal" error={errors.resZip} required>
                  <input type="text" value={resZip} onChange={e => setResZip(e.target.value)} className={inputClass(errors.resZip)} />
                </Field>
                <Field label="Telefono" error={errors.resPhone} required>
                  <input type="tel" value={resPhone} onChange={e => setResPhone(e.target.value)} placeholder="801-000-0000" className={inputClass(errors.resPhone)} />
                </Field>
              </div>

              <Checkbox label="¿La direccion postal es la misma que la de residencia?" checked={mailingSame} onChange={setMailingSame} />
              {!mailingSame && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <Field label="Calle postal"><input type="text" value={mailingStreet} onChange={e => setMailingStreet(e.target.value)} className={inputClass()} /></Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Ciudad"><input type="text" value={mailingCity} onChange={e => setMailingCity(e.target.value)} className={inputClass()} /></Field>
                    <Field label="Estado"><input type="text" value={mailingState} onChange={e => setMailingState(e.target.value)} className={inputClass()} /></Field>
                    <Field label="ZIP"><input type="text" value={mailingZip} onChange={e => setMailingZip(e.target.value)} className={inputClass()} /></Field>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Sexo" error={errors.gender} required>
                  <select value={gender} onChange={e => setGender(e.target.value)} className={inputClass(errors.gender)}>
                    <option value="">Seleccione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </Field>
                <Field label="Estado civil" error={errors.maritalStatus} required>
                  <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className={inputClass(errors.maritalStatus)}>
                    <option value="">Seleccione</option>
                    {['Soltero/a','Casado/a','Divorciado/a','Viudo/a'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Fecha de nacimiento" error={errors.dob} required>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputClass(errors.dob)} />
                </Field>
                <Field label="Ciudad de nacimiento" error={errors.cityOfBirth} required>
                  <input type="text" value={cityOfBirth} onChange={e => setCityOfBirth(e.target.value)} className={inputClass(errors.cityOfBirth)} />
                </Field>
                <Field label="Pais de nacimiento" error={errors.countryOfBirth} required>
                  <select value={countryOfBirth} onChange={e => setCountryOfBirth(e.target.value)} className={inputClass(errors.countryOfBirth)}>
                    <option value="">Seleccione</option>
                    {LATIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Nacionalidad" error={errors.nationality} required>
                  <select value={nationality} onChange={e => setNationality(e.target.value)} className={inputClass(errors.nationality)}>
                    <option value="">Seleccione</option>
                    {LATIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Raza / Etnicidad"><input type="text" value={raceEthnicity} onChange={e => setRaceEthnicity(e.target.value)} className={inputClass()} /></Field>
                <Field label="Religion"><input type="text" value={religion} onChange={e => setReligion(e.target.value)} className={inputClass()} /></Field>
                <Field label="Idioma nativo" error={errors.nativeLanguage} required>
                  <input type="text" value={nativeLanguage} onChange={e => setNativeLanguage(e.target.value)} placeholder="Ej: Espanol" className={inputClass(errors.nativeLanguage)} />
                </Field>
              </div>
              <Checkbox label="¿Habla ingles con fluidez?" checked={speaksEnglish} onChange={setSpeaksEnglish} />
              <Field label="Otros idiomas"><input type="text" value={otherLanguages} onChange={e => setOtherLanguages(e.target.value)} className={inputClass()} /></Field>
            </div>
          </SectionAccordion>

          {/* ── Section 2: Inmigracion ── */}
          <SectionAccordion section={sections[1]} isOpen={openSections.has(2)} onToggle={() => toggleSection(2)}
            hasErrors={['lastEntryDate','entryStatus','entryPlace'].some(k => errors[k])}>
            <div className="space-y-4">
              <Checkbox label="¿Esta en proceso ante tribunal de inmigracion?" checked={courtProceedings} onChange={setCourtProceedings} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Fecha de ultima entrada a EE.UU." error={errors.lastEntryDate} required>
                  <input type="date" value={lastEntryDate} onChange={e => setLastEntryDate(e.target.value)} className={inputClass(errors.lastEntryDate)} />
                  <p className="text-xs text-amber-700 mt-1 font-medium">CRITICA — debe aplicar dentro de 1 ano de su ultima entrada</p>
                </Field>
                <Field label="Numero I-94"><input type="text" value={i94Number} onChange={e => setI94Number(e.target.value)} className={inputClass()} /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Estatus de entrada" error={errors.entryStatus} required>
                  <select value={entryStatus} onChange={e => setEntryStatus(e.target.value)} className={inputClass(errors.entryStatus)}>
                    <option value="">Seleccione</option>
                    {ENTRY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                {entryStatus === 'Otro' && (
                  <Field label="Especifique"><input type="text" value={entryStatusOther} onChange={e => setEntryStatusOther(e.target.value)} className={inputClass()} /></Field>
                )}
                <Field label="Lugar de entrada" error={errors.entryPlace} required>
                  <input type="text" value={entryPlace} onChange={e => setEntryPlace(e.target.value)} placeholder="Puerto de entrada, aeropuerto..." className={inputClass(errors.entryPlace)} />
                </Field>
              </div>
              <Field label="Fecha expiracion del estatus"><input type="date" value={statusExpires} onChange={e => setStatusExpires(e.target.value)} className={inputClass()} /></Field>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Numero de pasaporte"><input type="text" value={passportNumber} onChange={e => setPassportNumber(e.target.value)} className={inputClass()} /></Field>
                <Field label="Pais del pasaporte">
                  <select value={passportCountry} onChange={e => setPassportCountry(e.target.value)} className={inputClass()}>
                    <option value="">Seleccione</option>
                    {LATIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Expiracion pasaporte"><input type="date" value={passportExpiry} onChange={e => setPassportExpiry(e.target.value)} className={inputClass()} /></Field>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Doc. viaje"><input type="text" value={travelDocNumber} onChange={e => setTravelDocNumber(e.target.value)} className={inputClass()} /></Field>
                <Field label="Numero A"><input type="text" value={aNumber} onChange={e => setANumber(e.target.value)} placeholder="A-000000000" className={inputClass()} /></Field>
                <Field label="SSN"><input type="text" value={ssnNumber} onChange={e => setSsnNumber(e.target.value)} className={inputClass()} /></Field>
                <Field label="Cuenta USCIS"><input type="text" value={uscisAccount} onChange={e => setUscisAccount(e.target.value)} className={inputClass()} /></Field>
              </div>
            </div>
          </SectionAccordion>

          {/* ── Section 3: Conyuge e Hijos ── */}
          <SectionAccordion section={sections[2]} isOpen={openSections.has(3)} onToggle={() => toggleSection(3)}>
            <div className="space-y-4">
              <Checkbox label="¿Tiene conyuge?" checked={hasSpouse} onChange={setHasSpouse} />
              {hasSpouse && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <p className="text-sm font-medium text-[#002855]">Informacion del Conyuge</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Field label="Apellido"><input type="text" value={spouseLastName} onChange={e => setSpouseLastName(e.target.value)} className={inputClass()} /></Field>
                    <Field label="Nombre"><input type="text" value={spouseFirstName} onChange={e => setSpouseFirstName(e.target.value)} className={inputClass()} /></Field>
                    <Field label="Segundo nombre"><input type="text" value={spouseMiddleName} onChange={e => setSpouseMiddleName(e.target.value)} className={inputClass()} /></Field>
                  </div>
                  <Field label="Otros nombres"><input type="text" value={spouseOtherNames} onChange={e => setSpouseOtherNames(e.target.value)} className={inputClass()} /></Field>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Field label="Fecha nacimiento"><input type="date" value={spouseDob} onChange={e => setSpouseDob(e.target.value)} className={inputClass()} /></Field>
                    <Field label="Sexo">
                      <select value={spouseGender} onChange={e => setSpouseGender(e.target.value)} className={inputClass()}>
                        <option value="">Seleccione</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option>
                      </select>
                    </Field>
                    <Field label="Nacionalidad">
                      <select value={spouseNationality} onChange={e => setSpouseNationality(e.target.value)} className={inputClass()}>
                        <option value="">Seleccione</option>
                        {LATIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Numero A"><input type="text" value={spouseANumber} onChange={e => setSpouseANumber(e.target.value)} className={inputClass()} /></Field>
                    <Field label="SSN"><input type="text" value={spouseSsn} onChange={e => setSpouseSsn(e.target.value)} className={inputClass()} /></Field>
                  </div>
                  <Checkbox label="¿El conyuge esta en EE.UU.?" checked={spouseInUs} onChange={setSpouseInUs} />
                  <Checkbox label="¿Incluir conyuge en solicitud?" checked={spouseInclude} onChange={setSpouseInclude} />
                  <Field label="Estatus migratorio del conyuge"><input type="text" value={spouseImmStatus} onChange={e => setSpouseImmStatus(e.target.value)} className={inputClass()} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Fecha de matrimonio"><input type="date" value={marriageDate} onChange={e => setMarriageDate(e.target.value)} className={inputClass()} /></Field>
                    <Field label="Lugar de matrimonio"><input type="text" value={marriagePlace} onChange={e => setMarriagePlace(e.target.value)} className={inputClass()} /></Field>
                  </div>
                </div>
              )}

              <Checkbox label="¿Tiene hijos?" checked={hasChildren} onChange={setHasChildren} />
              {hasChildren && (
                <RepeatableGroup<ChildEntry> label="Hijos" items={children} setItems={setChildren} emptyItem={emptyChild}
                  renderItem={(child, i, update) => (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Apellido"><input type="text" value={child.child_last_name} onChange={e => update('child_last_name', e.target.value)} className={inputClass()} /></Field>
                        <Field label="Nombre"><input type="text" value={child.child_first_name} onChange={e => update('child_first_name', e.target.value)} className={inputClass()} /></Field>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Field label="Fecha nac."><input type="date" value={child.child_dob} onChange={e => update('child_dob', e.target.value)} className={inputClass()} /></Field>
                        <Field label="Sexo">
                          <select value={child.child_gender} onChange={e => update('child_gender', e.target.value)} className={inputClass()}>
                            <option value="">-</option><option value="Masculino">M</option><option value="Femenino">F</option>
                          </select>
                        </Field>
                        <Field label="Pais nac.">
                          <select value={child.child_country_of_birth} onChange={e => update('child_country_of_birth', e.target.value)} className={inputClass()}>
                            <option value="">-</option>{LATIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                        <Field label="Nacionalidad">
                          <select value={child.child_nationality} onChange={e => update('child_nationality', e.target.value)} className={inputClass()}>
                            <option value="">-</option>{LATIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Numero A"><input type="text" value={child.child_a_number} onChange={e => update('child_a_number', e.target.value)} className={inputClass()} /></Field>
                      <Checkbox label="¿En EE.UU.?" checked={child.child_in_us} onChange={v => update('child_in_us', v)} />
                      <Checkbox label="¿Incluir en solicitud?" checked={child.child_include_in_application} onChange={v => update('child_include_in_application', v)} />
                      <Checkbox label="¿Soltero/a y menor de 21?" checked={child.child_marital_status} onChange={v => update('child_marital_status', v)} />
                    </div>
                  )} />
              )}
            </div>
          </SectionAccordion>

          {/* ── Section 4: Historial ── */}
          <SectionAccordion section={sections[3]} isOpen={openSections.has(4)} onToggle={() => toggleSection(4)}>
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#002855]">Ultima direccion antes de venir a EE.UU.</p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <Field label="Calle"><input type="text" value={lastAddrStreet} onChange={e => setLastAddrStreet(e.target.value)} className={inputClass()} /></Field>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Field label="Ciudad"><input type="text" value={lastAddrCity} onChange={e => setLastAddrCity(e.target.value)} className={inputClass()} /></Field>
                  <Field label="Depto/Estado"><input type="text" value={lastAddrState} onChange={e => setLastAddrState(e.target.value)} className={inputClass()} /></Field>
                  <Field label="Pais">
                    <select value={lastAddrCountry} onChange={e => setLastAddrCountry(e.target.value)} className={inputClass()}>
                      <option value="">-</option>{LATIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Desde"><input type="text" value={lastAddrFrom} onChange={e => setLastAddrFrom(e.target.value)} placeholder="MM/AAAA" className={inputClass()} /></Field>
                    <Field label="Hasta"><input type="text" value={lastAddrTo} onChange={e => setLastAddrTo(e.target.value)} placeholder="MM/AAAA" className={inputClass()} /></Field>
                  </div>
                </div>
              </div>

              <RepeatableGroup<ResidenceEntry> label="Residencias ultimos 5 anos" items={residences} setItems={setResidences} emptyItem={emptyResidence}
                renderItem={(r, i, update) => (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Field label="Direccion"><input type="text" value={r.res_address} onChange={e => update('res_address', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Ciudad"><input type="text" value={r.res_city} onChange={e => update('res_city', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Pais"><input type="text" value={r.res_country} onChange={e => update('res_country', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Desde"><input type="text" value={r.res_from} onChange={e => update('res_from', e.target.value)} placeholder="MM/AAAA" className={inputClass()} /></Field>
                    <Field label="Hasta"><input type="text" value={r.res_to} onChange={e => update('res_to', e.target.value)} placeholder="MM/AAAA" className={inputClass()} /></Field>
                  </div>
                )} />

              <RepeatableGroup<EmploymentEntry> label="Empleos ultimos 5 anos" items={employments} setItems={setEmployments} emptyItem={emptyEmployment}
                renderItem={(emp, i, update) => (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Field label="Empleador"><input type="text" value={emp.emp_employer} onChange={e => update('emp_employer', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Direccion"><input type="text" value={emp.emp_address} onChange={e => update('emp_address', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Ocupacion"><input type="text" value={emp.emp_occupation} onChange={e => update('emp_occupation', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Desde"><input type="text" value={emp.emp_from} onChange={e => update('emp_from', e.target.value)} placeholder="MM/AAAA" className={inputClass()} /></Field>
                    <Field label="Hasta"><input type="text" value={emp.emp_to} onChange={e => update('emp_to', e.target.value)} placeholder="MM/AAAA" className={inputClass()} /></Field>
                  </div>
                )} />

              <RepeatableGroup<EducationEntry> label="Educacion" items={educationList} setItems={setEducationList} emptyItem={emptyEducation}
                renderItem={(edu, i, update) => (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Field label="Escuela"><input type="text" value={edu.edu_school} onChange={e => update('edu_school', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Tipo"><input type="text" value={edu.edu_type} onChange={e => update('edu_type', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Ubicacion"><input type="text" value={edu.edu_location} onChange={e => update('edu_location', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Desde"><input type="text" value={edu.edu_from} onChange={e => update('edu_from', e.target.value)} placeholder="MM/AAAA" className={inputClass()} /></Field>
                    <Field label="Hasta"><input type="text" value={edu.edu_to} onChange={e => update('edu_to', e.target.value)} placeholder="MM/AAAA" className={inputClass()} /></Field>
                  </div>
                )} />

              <p className="text-sm font-medium text-[#002855] pt-2">Informacion de los padres</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <p className="text-xs font-semibold text-gray-500">Madre</p>
                  <Field label="Nombre completo"><input type="text" value={motherName} onChange={e => setMotherName(e.target.value)} placeholder="Apellido Nombre" className={inputClass()} /></Field>
                  <Field label="Pais de nacimiento">
                    <select value={motherCountry} onChange={e => setMotherCountry(e.target.value)} className={inputClass()}>
                      <option value="">-</option>{LATIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Checkbox label="¿Ha fallecido?" checked={motherDeceased} onChange={setMotherDeceased} />
                  {!motherDeceased && <Field label="Ubicacion actual"><input type="text" value={motherLocation} onChange={e => setMotherLocation(e.target.value)} className={inputClass()} /></Field>}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <p className="text-xs font-semibold text-gray-500">Padre</p>
                  <Field label="Nombre completo"><input type="text" value={fatherName} onChange={e => setFatherName(e.target.value)} placeholder="Apellido Nombre" className={inputClass()} /></Field>
                  <Field label="Pais de nacimiento">
                    <select value={fatherCountry} onChange={e => setFatherCountry(e.target.value)} className={inputClass()}>
                      <option value="">-</option>{LATIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Checkbox label="¿Ha fallecido?" checked={fatherDeceased} onChange={setFatherDeceased} />
                  {!fatherDeceased && <Field label="Ubicacion actual"><input type="text" value={fatherLocation} onChange={e => setFatherLocation(e.target.value)} className={inputClass()} /></Field>}
                </div>
              </div>

              <RepeatableGroup<SiblingEntry> label="Hermanos/as" items={siblings} setItems={setSiblings} emptyItem={emptySibling}
                renderItem={(s, i, update) => (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="Nombre completo"><input type="text" value={s.sibling_name} onChange={e => update('sibling_name', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Pais nac."><input type="text" value={s.sibling_country_of_birth} onChange={e => update('sibling_country_of_birth', e.target.value)} className={inputClass()} /></Field>
                    <Checkbox label="¿Fallecido/a?" checked={s.sibling_deceased} onChange={v => update('sibling_deceased', v)} />
                    <Field label="Ubicacion"><input type="text" value={s.sibling_current_location} onChange={e => update('sibling_current_location', e.target.value)} className={inputClass()} /></Field>
                  </div>
                )} />
            </div>
          </SectionAccordion>

          {/* ── Section 5: Persecucion ── */}
          <SectionAccordion section={sections[4]} isOpen={openSections.has(5)} onToggle={() => toggleSection(5)}
            hasErrors={['persecutionGrounds','harmPerpetrators'].some(k => errors[k])}>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800">Esta es la seccion mas importante de su solicitud. Proporcione la mayor cantidad de detalle posible.</p>
              </div>
              <Field label="Bases de persecucion" error={errors.persecutionGrounds} required>
                <div className="space-y-2">
                  {PERSECUTION_GROUNDS.map(g => (
                    <label key={g} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={persecutionGrounds.includes(g)} onChange={() => togglePersecutionGround(g)}
                        className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
                      <span className="text-sm text-gray-700">{g}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <Checkbox label="¿Ha sufrido dano o persecucion en el pasado?" checked={pastHarm} onChange={setPastHarm} />
              {pastHarm && (
                <Field label="Descripcion del dano sufrido">
                  <textarea value={pastHarmDesc} onChange={e => setPastHarmDesc(e.target.value)} rows={5} placeholder="Incluya: QUIEN le hizo dano, QUE le hicieron, CUANDO ocurrio, DONDE ocurrio, POR QUE cree que le persiguieron" className={inputClass()} />
                  <p className="text-xs text-gray-500 mt-1">{pastHarmDesc.length} caracteres (minimo recomendado: 200)</p>
                </Field>
              )}
              <Checkbox label="¿Tiene miedo de regresar a su pais?" checked={fearOfReturn} onChange={setFearOfReturn} />
              {fearOfReturn && (
                <Field label="Descripcion del miedo">
                  <textarea value={fearDesc} onChange={e => setFearDesc(e.target.value)} rows={4} className={inputClass()} />
                  <p className="text-xs text-gray-500 mt-1">{fearDesc.length} caracteres (minimo recomendado: 150)</p>
                </Field>
              )}
              <Field label="¿Quien le causo dano o amenazo?" error={errors.harmPerpetrators} required>
                <textarea value={harmPerpetrators} onChange={e => setHarmPerpetrators(e.target.value)} rows={3} placeholder="Identifique personas u organizaciones responsables" className={inputClass(errors.harmPerpetrators)} />
              </Field>
              <Checkbox label="¿Reporto los hechos a las autoridades?" checked={reportedAuth} onChange={setReportedAuth} />
              {reportedAuth && (
                <Field label="¿Que hicieron las autoridades?">
                  <textarea value={authResponse} onChange={e => setAuthResponse(e.target.value)} rows={3} className={inputClass()} />
                </Field>
              )}
              {!reportedAuth && (
                <Field label="¿Por que no reporto a las autoridades?">
                  <textarea value={whyNotReported} onChange={e => setWhyNotReported(e.target.value)} rows={3} className={inputClass()} />
                </Field>
              )}
              <Field label="Membresia en organizaciones">
                <textarea value={orgMembership} onChange={e => setOrgMembership(e.target.value)} rows={2} placeholder="Liste cada organizacion con fechas" className={inputClass()} />
              </Field>
              <Checkbox label="¿Continua siendo miembro?" checked={continuedMembership} onChange={setContinuedMembership} />
            </div>
          </SectionAccordion>

          {/* ── Section 6: Adicional ── */}
          <SectionAccordion section={sections[5]} isOpen={openSections.has(6)} onToggle={() => toggleSection(6)}>
            <div className="space-y-4">
              <Checkbox label="¿Ha solicitado asilo anteriormente en EE.UU.?" checked={priorAsylum} onChange={setPriorAsylum} />
              {priorAsylum && <Field label="Detalles"><textarea value={priorAsylumDetails} onChange={e => setPriorAsylumDetails(e.target.value)} rows={2} className={inputClass()} /></Field>}
              <Checkbox label="¿Ha sido arrestado, detenido o encarcelado?" checked={arrested} onChange={setArrested} />
              {arrested && <Field label="Detalles"><textarea value={arrestedDetails} onChange={e => setArrestedDetails(e.target.value)} rows={2} className={inputClass()} /></Field>}
              <Checkbox label="¿Ha causado dano a otra persona?" checked={causedHarm} onChange={setCausedHarm} />
              {causedHarm && <Field label="Detalles"><textarea value={causedHarmDetails} onChange={e => setCausedHarmDetails(e.target.value)} rows={2} className={inputClass()} /></Field>}
              <Checkbox label="¿Podria regresar a otro pais ademas de su pais de origen?" checked={returnOther} onChange={setReturnOther} />
              {returnOther && <Field label="Explicacion"><textarea value={returnOtherExpl} onChange={e => setReturnOtherExpl(e.target.value)} rows={2} className={inputClass()} /></Field>}
              <Checkbox label="¿Solicita proteccion bajo la Convencion Contra la Tortura (CAT)?" checked={cat} onChange={setCat} />
              <Checkbox label="¿Ha tenido afiliacion con el gobierno de EE.UU.?" checked={govAffiliation} onChange={setGovAffiliation} />
              {govAffiliation && <Field label="Detalles"><textarea value={govDetails} onChange={e => setGovDetails(e.target.value)} rows={2} className={inputClass()} /></Field>}
            </div>
          </SectionAccordion>

          {/* ── Section 7: Viajes ── */}
          <SectionAccordion section={sections[6]} isOpen={openSections.has(7)} onToggle={() => toggleSection(7)}
            hasErrors={!!errors.travelToUs}>
            <div className="space-y-4">
              <Field label="Describa su viaje a EE.UU." error={errors.travelToUs} required>
                <textarea value={travelToUs} onChange={e => setTravelToUs(e.target.value)} rows={4} placeholder="¿Desde que pais salio? ¿Por que paises paso? ¿Como viajo?" className={inputClass(errors.travelToUs)} />
              </Field>
              <RepeatableGroup<CountryVisited> label="Paises visitados antes de llegar a EE.UU." items={countriesVisited} setItems={setCountriesVisited} emptyItem={emptyCountry}
                renderItem={(cv, i, update) => (
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Pais"><input type="text" value={cv.country} onChange={e => update('country', e.target.value)} className={inputClass()} /></Field>
                    <Field label="Duracion"><input type="text" value={cv.duration} onChange={e => update('duration', e.target.value)} placeholder="Ej: 3 dias" className={inputClass()} /></Field>
                    <Field label="Proposito"><input type="text" value={cv.purpose} onChange={e => update('purpose', e.target.value)} placeholder="Ej: Transito" className={inputClass()} /></Field>
                  </div>
                )} />
              <Checkbox label="¿Solicito asilo en otro pais?" checked={asylumOtherCountry} onChange={setAsylumOtherCountry} />
              {asylumOtherCountry && <Field label="Detalles"><textarea value={otherCountryDetails} onChange={e => setOtherCountryDetails(e.target.value)} rows={2} className={inputClass()} /></Field>}
            </div>
          </SectionAccordion>

          <button type="submit" disabled={submitting}
            className="w-full bg-[#002855] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#001d3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
            {submitting ? (<><Loader2 className="w-5 h-5 animate-spin" />Enviando...</>) : 'Enviar Formulario I-589'}
          </button>
          <p className="text-xs text-center text-gray-500 mt-4 pb-8">
            Su informacion es confidencial y esta protegida. Solo sera utilizada para su solicitud de asilo.
          </p>
        </form>
      </main>
    </div>
  )
}

// ── Helper Components ──

function inputClass(error?: string) {
  return `w-full px-3 py-2.5 rounded-lg border ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'} text-sm focus:outline-none focus:ring-2 focus:ring-[#002855]/30 focus:border-[#002855] transition-colors`
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-lg p-3">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-gray-300 text-[#002855] focus:ring-[#002855]" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function SectionAccordion({ section, isOpen, onToggle, hasErrors, children }: {
  section: { id: number; title: string }; isOpen: boolean; onToggle: () => void; hasErrors?: boolean; children: React.ReactNode
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border ${hasErrors ? 'border-red-300' : 'border-gray-200'} overflow-hidden`}>
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${hasErrors ? 'bg-red-100 text-red-700' : 'bg-[#002855] text-white'}`}>{section.id}</div>
          <span className="font-semibold text-[#002855]">{section.title}</span>
          {hasErrors && <span className="text-xs text-red-600 font-medium">Campos pendientes</span>}
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  )
}

function RepeatableText({ label, items, setItems, placeholder }: { label: string; items: string[]; setItems: (v: string[]) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input type="text" value={item} onChange={e => { const next = [...items]; next[i] = e.target.value; setItems(next) }} placeholder={placeholder} className={inputClass()} />
          <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 px-2"><X className="w-4 h-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, ''])} className="text-xs text-[#002855] font-medium flex items-center gap-1 hover:underline">
        <Plus className="w-3.5 h-3.5" /> Agregar otro nombre
      </button>
    </div>
  )
}

function RepeatableGroup<T extends Record<string, any>>({ label, items, setItems, emptyItem, renderItem }: {
  label: string; items: T[]; setItems: (v: T[]) => void; emptyItem: T;
  renderItem: (item: T, index: number, update: (field: string, value: any) => void) => React.ReactNode
}) {
  function addItem() { setItems([...items, { ...emptyItem }]) }
  function removeItem(index: number) { setItems(items.filter((_, i) => i !== index)) }
  function updateItem(index: number, field: string, value: any) {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">#{i + 1}</span>
            <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
          {renderItem(item, i, (field, value) => updateItem(i, field, value))}
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-xs text-[#002855] font-medium flex items-center gap-1 hover:underline mt-1">
        <Plus className="w-3.5 h-3.5" /> Agregar otro
      </button>
    </div>
  )
}
