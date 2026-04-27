import { useData } from '../data/DataContext'
import { fmt, fmtDate } from '../data/store'
import { Card, CardHeader, KPI, Badge, StatusBadge, TipoBadge, Button, MapEmbed, ImageGallery, DetailRow, SectionLabel } from '../components/UI'
import { Building2, MapPin, DollarSign, FileText, Wrench, ArrowLeft } from 'lucide-react'
import { Link, Outlet, useParams } from 'react-router-dom'

const CLIENT_GROUP = 'g1' // Simulated: Inmuebles del Norte is logged in

export function ClientDashboard() {
  const { properties, contracts, maintenance, collections, groups } = useData()
  const grupo = groups.data.find(g => g.id === CLIENT_GROUP)
  const props = properties.data.filter(p => p.grupo_id === CLIENT_GROUP)
  const rentadas = props.filter(p => p.estatus === 'rentada')
  const rentaTotal = rentadas.reduce((s, p) => s + Number(p.renta), 0)
  const cobros = collections.data.filter(c => props.some(p => p.id === c.propiedad_id))
  const cobrados = cobros.filter(c => c.estatus === 'pagado')
  const comision = Math.round(rentaTotal * 0.089)
  const mantos = maintenance.data.filter(m => props.some(p => p.id === m.propiedad_id) && m.estatus !== 'completada')

  return <div>
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-slate-800">Hola, {grupo?.representante || grupo?.nombre}</h1>
      <p className="text-sm text-slate-400 mt-0.5">Resumen de tu portafolio · {grupo?.nombre}</p>
    </div>

    <div className="grid grid-cols-4 gap-3 mb-5">
      <KPI label="Mis propiedades" value={props.length} sub={`${rentadas.length} rentadas · ${props.length - rentadas.length} disponibles`} />
      <KPI label="Ingreso bruto/mes" value={fmt(rentaTotal)} sub={`${rentadas.length} contratos activos`} />
      <KPI label="Comisión admin." value={fmt(comision)} sub="8.9% promedio" />
      <KPI label="Ingreso neto" value={fmt(rentaTotal - comision)} sub="a tu cuenta" subColor="text-emerald-500" />
    </div>

    <h2 className="text-[13px] font-semibold text-slate-600 mb-3">Mis propiedades</h2>
    <div className="grid grid-cols-2 gap-3 mb-5">
      {props.map(p => {
        const inq = collections.data.find(c => c.propiedad_id === p.id)
        return <Link to={`/cliente/propiedades/${p.id}`} key={p.id}>
          <Card className="p-4 hover:border-emerald-300 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div><p className="text-[13px] font-medium text-slate-700">{p.nombre}</p><p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{p.direccion}, {p.ciudad}</p></div>
              <StatusBadge estatus={p.estatus} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[10px] text-slate-400">Renta mensual</p><p className="text-[14px] font-semibold text-slate-800">{fmt(p.renta)} <span className="text-[10px] text-slate-400">{p.moneda}</span></p></div>
              <div><p className="text-[10px] text-slate-400">Tipo</p><p className="mt-0.5"><TipoBadge tipo={p.tipo}/></p></div>
            </div>
          </Card>
        </Link>
      })}
    </div>

    {mantos.length > 0 && <Card className="mb-5">
      <CardHeader title="Mantenimientos en proceso" />
      {mantos.map(m => {
        const prop = props.find(p => p.id === m.propiedad_id)
        return <div key={m.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0">
          <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1"><p className="text-[12px] font-medium text-slate-700">{m.titulo}</p><p className="text-[10px] text-slate-400">{prop?.clave} · {m.proveedor}</p></div>
          <Badge variant={m.estatus === 'en_proceso' ? 'default' : 'amber'}>{m.estatus}</Badge>
          <span className="text-[12px] font-medium text-slate-600">{fmt(m.costo)}</span>
        </div>
      })}
    </Card>}
  </div>
}

export function ClientPropiedades() {
  const { properties } = useData()
  const props = properties.data.filter(p => p.grupo_id === CLIENT_GROUP)
  return <div>
    <div className="mb-6"><h1 className="text-xl font-semibold text-slate-800">Mis propiedades</h1><p className="text-sm text-slate-400">{props.length} propiedades en tu portafolio</p></div>
    <div className="grid grid-cols-1 gap-3">
      {props.map(p => <Link to={`/cliente/propiedades/${p.id}`} key={p.id}>
        <Card className="p-4 flex items-center gap-4 hover:border-emerald-300 transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Building2 className="w-5 h-5"/></div>
          <div className="flex-1">
            <div className="flex items-center gap-2"><span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{p.clave}</span><TipoBadge tipo={p.tipo}/><StatusBadge estatus={p.estatus}/></div>
            <p className="text-[13px] font-medium text-slate-700 mt-1">{p.nombre}</p>
            <p className="text-[10px] text-slate-400">{p.direccion}, {p.ciudad}</p>
          </div>
          <div className="text-right"><p className="text-lg font-semibold text-slate-800">{fmt(p.renta)}</p><p className="text-[10px] text-slate-400">{p.moneda}/mes</p></div>
        </Card>
      </Link>)}
    </div>
  </div>
}

export function ClientPropDetalle() {
  const { id } = useParams()
  const { properties, contracts, maintenance, collections, tenants, documents } = useData()
  const p = properties.data.find(x => x.id === id)
  if (!p) return <div className="text-center py-20 text-slate-400">Propiedad no encontrada</div>
  const contrato = contracts.data.find(c => c.propiedad_id === p.id)
  const inquilino = tenants.data.find(t => t.propiedad_id === p.id)
  const mantos = maintenance.data.filter(m => m.propiedad_id === p.id)
  const cobros = collections.data.filter(c => c.propiedad_id === p.id)
  const neto = Number(p.renta) - Math.round(Number(p.renta) * 0.089)

  return <div>
    <Link to="/cliente/propiedades" className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-emerald-500 mb-3"><ArrowLeft className="w-3.5 h-3.5"/> Volver</Link>
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Building2 className="w-6 h-6"/></div>
      <div>
        <div className="flex items-center gap-2 mb-1"><span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{p.clave}</span><TipoBadge tipo={p.tipo}/><StatusBadge estatus={p.estatus}/></div>
        <h1 className="text-xl font-semibold text-slate-800">{p.nombre}</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">{p.direccion}, {p.ciudad}</p>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-3 mb-5">
      <KPI label="Renta mensual" value={`${fmt(p.renta)} ${p.moneda}`} sub="bruta" />
      <KPI label="Tu ingreso neto" value={fmt(neto)} sub="después de comisión" subColor="text-emerald-500" />
      <KPI label="Superficie" value={p.superficie_m2 ? `${Number(p.superficie_m2).toLocaleString()} m²` : '—'} />
      <KPI label="Valor comercial" value={p.valor_comercial ? fmt(p.valor_comercial) : '—'} />
    </div>

    <div className="grid grid-cols-2 gap-3 mb-5">
      <Card className="p-4"><p className="text-[12px] font-semibold text-slate-600 mb-3">Fotos</p><ImageGallery images={p.imagenes}/></Card>
      <Card className="p-4"><p className="text-[12px] font-semibold text-slate-600 mb-3">Ubicación</p><MapEmbed lat={p.lat} lng={p.lng} name={p.nombre}/></Card>
    </div>

    {inquilino && <Card className="mb-5 p-5"><SectionLabel>Inquilino actual</SectionLabel><DetailRow label="Nombre" value={inquilino.nombre}/><DetailRow label="RFC" value={inquilino.rfc}/><DetailRow label="Contacto" value={`${inquilino.contacto} · ${inquilino.telefono}`}/>
      {contrato && <><DetailRow label="Modalidad" value={contrato.tipo_contrato}/><DetailRow label="Vencimiento" value={fmtDate(contrato.fin)}/><DetailRow label="Escalación" value={contrato.escalacion}/></>}
    </Card>}

    {cobros.length > 0 && <Card className="overflow-hidden mb-5">
      <CardHeader title="Historial de cobranza"/>
      <table className="w-full text-[12px]"><thead className="bg-slate-50/80"><tr>{['Renta','Vencimiento','Pago','Estatus'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-slate-400 text-[10px] uppercase">{h}</th>)}</tr></thead>
      <tbody>{cobros.map(c=><tr key={c.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{fmt(c.renta)}</td><td className="px-4 py-3 text-slate-500">{fmtDate(c.fecha_vencimiento)}</td><td className="px-4 py-3 text-slate-500">{c.fecha_pago?fmtDate(c.fecha_pago):'—'}</td><td className="px-4 py-3"><Badge variant={c.estatus==='pagado'?'green':'amber'}>{c.estatus}</Badge></td></tr>)}</tbody></table>
    </Card>}
  </div>
}

export function ClientFinanzas() {
  const { properties, collections } = useData()
  const props = properties.data.filter(p => p.grupo_id === CLIENT_GROUP)
  const rentaTotal = props.filter(p=>p.estatus==='rentada').reduce((s,p)=>s+Number(p.renta),0)
  const comision = Math.round(rentaTotal * 0.089)
  const predial = props.reduce((s,p)=>s+Number(p.predial_anual||0)/12,0)
  const neto = rentaTotal - comision - predial

  return <div>
    <div className="mb-6"><h1 className="text-xl font-semibold text-slate-800">Estado financiero</h1><p className="text-sm text-slate-400">Febrero 2026</p></div>
    <div className="grid grid-cols-4 gap-3 mb-5">
      <KPI label="Ingreso bruto" value={fmt(rentaTotal)} sub={`${props.filter(p=>p.estatus==='rentada').length} propiedades cobrando`}/>
      <KPI label="Comisión admin." value={fmt(comision)} sub="8.9% promedio"/>
      <KPI label="Predial (prorrata)" value={fmt(predial)} sub="estimado mensual"/>
      <KPI label="Ingreso neto" value={fmt(neto)} sub="a tu cuenta" subColor="text-emerald-500"/>
    </div>
    <Card className="p-5">
      <SectionLabel>Desglose del mes</SectionLabel>
      <DetailRow label="Renta cobrada" value={`+ ${fmt(rentaTotal)}`}/>
      <DetailRow label="— Comisión administración" value={`- ${fmt(comision)}`}/>
      <DetailRow label="— Predial prorrata" value={`- ${fmt(predial)}`}/>
      <div className="flex justify-between py-3 mt-2 border-t border-slate-200 font-medium"><span className="text-slate-700">Depósito a tu cuenta</span><span className="text-emerald-600 text-lg">{fmt(neto)}</span></div>
      <div className="mt-4 p-3 bg-emerald-50 rounded-lg text-[11px] text-emerald-700">Depositado el 28 feb a cuenta BBVA *4421</div>
    </Card>
  </div>
}

export function ClientDocumentos() {
  const { properties, documents } = useData()
  const props = properties.data.filter(p => p.grupo_id === CLIENT_GROUP)
  const docs = documents.data.filter(d => props.some(p => p.id === d.propiedad_id))

  return <div>
    <div className="mb-6"><h1 className="text-xl font-semibold text-slate-800">Mis documentos</h1><p className="text-sm text-slate-400">{docs.length} documentos disponibles</p></div>
    <Card>{docs.length > 0 ? docs.map(d => {
      const prop = props.find(p => p.id === d.propiedad_id)
      return <div key={d.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center"><FileText className="w-4 h-4"/></div>
        <div className="flex-1"><p className="text-[12px] font-medium text-slate-700">{d.nombre}</p><p className="text-[10px] text-slate-400">{d.descripcion}{prop?` · ${prop.clave}`:''}</p></div>
        <Badge variant={{escritura:'default',contrato:'green',permiso:'amber',cfdi:'purple',poliza:'teal'}[d.tipo_doc]||'gray'}>{d.tipo_doc}</Badge>
        <span className="text-[11px] text-slate-400">{fmtDate(d.fecha)}</span>
      </div>
    }) : <p className="p-16 text-center text-slate-400">Sin documentos</p>}</Card>
  </div>
}
