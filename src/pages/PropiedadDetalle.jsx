import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../data/DataContext'
import { fmt, fmtDate } from '../data/store'
import { Card, CardHeader, Button, Badge, StatusBadge, TipoBadge, DetailRow, SectionLabel, MapEmbed, ImageGallery, ConfirmDialog, Modal, Input, Select, Textarea } from '../components/UI'
import { ArrowLeft, Pencil, Trash2, Building2, MapPin, FileText, Wrench, DollarSign, Layers, Box, Plus, ChevronRight, History, Info } from 'lucide-react'
import { useState } from 'react'

export default function PropiedadDetalle(){
  const{id}=useParams()
  const nav=useNavigate()
  const{properties,tenants,contracts,maintenance,documents,groups,collections,assets,valuaciones}=useData()
  const[tab,setTab]=useState('general')
  const[deleteOpen,setDeleteOpen]=useState(false)
  const[assetModal,setAssetModal]=useState(null)
  const[assetForm,setAssetForm]=useState({})
  const[assetEditId,setAssetEditId]=useState(null)
  const[valModal,setValModal]=useState(null)
  const[valForm,setValForm]=useState({fecha:'',tipo:'avaluo',monto:'',fuente:'',notas:''})

  const p=properties.data.find(x=>x.id===id)
  if(!p)return<div className="text-center py-20 text-slate-400"><p>Propiedad no encontrada</p><Link to="/propiedades" className="text-blue-500 text-sm mt-2 inline-block">← Volver</Link></div>

  const grupo=groups.data.find(g=>g.id===p.grupo_id)
  const parent=p.parent_id?properties.data.find(x=>x.id===p.parent_id):null
  const subunits=properties.data.filter(x=>x.parent_id===p.id)
  const inquilino=tenants.data.find(t=>t.propiedad_id===p.id)
  const allContracts=contracts.data.filter(c=>c.propiedad_id===p.id)
  const activeContract=allContracts.find(c=>['vigente','por_vencer','moroso'].includes(c.estatus))
  const historicalContracts=allContracts.filter(c=>c.estatus==='finalizado')
  const mantos=maintenance.data.filter(m=>m.propiedad_id===p.id)
  const docs=documents.data.filter(d=>d.propiedad_id===p.id)
  const cobros=collections.data.filter(c=>c.propiedad_id===p.id)
  const propAssets=assets.data.filter(a=>a.propiedad_id===p.id)
  const propValuaciones=(valuaciones?.data||[]).filter(v=>v.propiedad_id===p.id).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))
  const totalAssetValue=propAssets.reduce((s,a)=>s+Number(a.valor_actual||0),0)
  const totalDepreciation=propAssets.reduce((s,a)=>s+Number(a.depreciacion_anual||0),0)

  // ── Rent logic: contract rent takes priority ──
  const rentaContrato = activeContract ? Number(activeContract.renta) : 0
  const rentaPropiedad = Number(p.renta) || 0
  const rentaEfectiva = rentaContrato || rentaPropiedad
  const rentaSource = rentaContrato ? 'contrato' : 'referencia'
  const monedaEfectiva = activeContract ? activeContract.moneda : p.moneda

  // ── Subunits rent (for complexes) ──
  const subsRentaTotal = subunits.reduce((s,u) => {
    const uContract = contracts.data.find(c => c.propiedad_id === u.id && ['vigente','por_vencer','moroso'].includes(c.estatus))
    return s + (uContract ? Number(uContract.renta) : Number(u.renta) || 0)
  }, 0)
  const displayRenta = subunits.length > 0 ? subsRentaTotal : rentaEfectiva

  // ── Price per m² ──
  const supConst = Number(p.superficie_construccion) || 0
  const supTerr = Number(p.superficie_terreno) || 0
  const precioM2Const = supConst > 0 && displayRenta > 0 ? Math.round(displayRenta / supConst) : 0
  const precioM2Terr = supTerr > 0 && displayRenta > 0 ? Math.round(displayRenta / supTerr) : 0
  const valorM2Const = supConst > 0 && Number(p.valor_comercial) > 0 ? Math.round(Number(p.valor_comercial) / supConst) : 0

  // ── Yield ──
  const valorComercial = Number(p.valor_comercial) || 0
  const rentaAnual = displayRenta * 12
  const yieldPct = valorComercial > 0 ? (rentaAnual / valorComercial * 100).toFixed(1) : '—'

  const handleAddImage=(dataUrl)=>{properties.update(p.id,{imagenes:[...(p.imagenes||[]),dataUrl]})}
  const handleRemoveImage=(idx)=>{properties.update(p.id,{imagenes:(p.imagenes||[]).filter((_,i)=>i!==idx)})}

  // ── Asset CRUD ──
  const EMPTY_ASSET={propiedad_id:p.id,nombre:'',categoria:'HVAC',valor_original:'',fecha_adquisicion:'',vida_util_anios:10,depreciacion_anual:'',valor_actual:'',mantenimiento_preventivo:'',prox_mantenimiento:'',notas:''}
  const openNewAsset=()=>{setAssetForm(EMPTY_ASSET);setAssetEditId(null);setAssetModal('form')}
  const openEditAsset=(a)=>{setAssetForm({...a});setAssetEditId(a.id);setAssetModal('form')}
  const handleSaveAsset=()=>{
    if(!assetForm.nombre)return alert('Nombre es requerido')
    const vo=Number(assetForm.valor_original)||0
    const vu=Number(assetForm.vida_util_anios)||10
    const dep=Math.round(vo/vu)
    const fa=assetForm.fecha_adquisicion
    const yearsElapsed=fa?Math.max(0,(new Date().getFullYear()-new Date(fa).getFullYear())):0
    const va=Math.max(0,vo-dep*yearsElapsed)
    const data={...assetForm,depreciacion_anual:dep,valor_actual:va}
    assetEditId?assets.update(assetEditId,data):assets.add(data)
    setAssetModal(null)
  }

  // ── Valuacion CRUD ──
  const handleSaveVal=()=>{
    if(!valForm.fecha||!valForm.monto)return alert('Fecha y monto son requeridos')
    valuaciones.add({...valForm, propiedad_id:p.id})
    setValModal(null)
    setValForm({fecha:'',tipo:'avaluo',monto:'',fuente:'',notas:''})
  }

  const tabs=[
    {id:'general',label:'General',icon:Building2},
    ...(subunits.length>0?[{id:'unidades',label:`Unidades (${subunits.length})`,icon:Layers}]:[]),
    {id:'contrato',label:'Contratos',icon:FileText,count:allContracts.length},
    {id:'valoracion',label:'Valoración',icon:DollarSign,count:propValuaciones.length},
    {id:'activos',label:'Activos fijos',icon:Box,count:propAssets.length},
    {id:'mantenimiento',label:'Mantenimiento',icon:Wrench,count:mantos.length},
    {id:'cobranza',label:'Cobranza',icon:DollarSign,count:cobros.length},
    {id:'documentos',label:'Documentos',icon:FileText,count:docs.length},
  ]

  return<div>
    {/* Breadcrumb */}
    <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-3">
      <Link to="/propiedades" className="hover:text-blue-500">Propiedades</Link>
      {parent&&<><ChevronRight className="w-3 h-3"/><Link to={`/propiedades/${parent.id}`} className="hover:text-blue-500">{parent.clave}</Link></>}
      <ChevronRight className="w-3 h-3"/><span className="text-slate-600">{p.clave}</span>
    </div>

    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center"><Building2 className="w-7 h-7"/></div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.clave}</span>
            <TipoBadge tipo={p.tipo}/><StatusBadge estatus={p.estatus}/>
            {parent&&<Badge variant="purple">Subunidad de {parent.clave}</Badge>}
          </div>
          <h1 className="text-xl font-semibold text-slate-800">{p.nombre}</h1>
          <p className="text-[12px] text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3"/>{p.direccion}, {p.colonia} · {p.ciudad}, {p.estado}{p.pais&&p.pais!=='México'?`, ${p.pais}`:''}</p>
          {grupo&&<p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"><Layers className="w-3 h-3"/>Empresa: <span className="text-slate-600 font-medium">{grupo.nombre}</span></p>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="danger" onClick={()=>setDeleteOpen(true)}><Trash2 className="w-3 h-3"/></Button>
      </div>
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-6 gap-3 mb-5">
      <div className="bg-white border border-slate-200/80 rounded-xl p-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Renta mensual</p>
        <p className="text-xl font-semibold text-slate-800">{fmt(displayRenta)} <span className="text-sm text-slate-400">{monedaEfectiva}</span></p>
        <p className="text-[10px] mt-0.5 flex items-center gap-1 {rentaSource==='contrato'?'text-emerald-500':'text-amber-500'}">
          {rentaSource==='contrato'?<><span className="text-emerald-500">Según contrato activo</span></>:<><span className="text-amber-500">Renta de referencia</span></>}
        </p>
      </div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-4">
        <p className="text-[10px] text-slate-400 uppercase mb-1">Valor comercial</p>
        <p className="text-xl font-semibold text-slate-800">{valorComercial?fmt(valorComercial):'—'}</p>
      </div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-4">
        <p className="text-[10px] text-slate-400 uppercase mb-1">Rendimiento</p>
        <p className="text-xl font-semibold text-emerald-600">{yieldPct}%</p>
        <p className="text-[10px] text-slate-400">anual</p>
      </div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-4">
        <p className="text-[10px] text-slate-400 uppercase mb-1">Precio / m² const.</p>
        <p className="text-xl font-semibold text-slate-800">{precioM2Const?fmt(precioM2Const):'—'}</p>
        <p className="text-[10px] text-slate-400">renta/m²</p>
      </div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-4">
        <p className="text-[10px] text-slate-400 uppercase mb-1">Valor / m² const.</p>
        <p className="text-xl font-semibold text-slate-800">{valorM2Const?fmt(valorM2Const):'—'}</p>
        <p className="text-[10px] text-slate-400">valor comercial/m²</p>
      </div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-4">
        <p className="text-[10px] text-slate-400 uppercase mb-1">Activos fijos</p>
        <p className="text-xl font-semibold text-slate-800">{fmt(totalAssetValue)}</p>
        <p className="text-[10px] text-red-400">Dep. {fmt(totalDepreciation)}/año</p>
      </div>
    </div>

    {/* Images & Map */}
    <div className="grid grid-cols-2 gap-3 mb-5">
      <Card className="p-4"><p className="text-[12px] font-semibold text-slate-600 mb-3">Fotos de la propiedad</p><ImageGallery images={p.imagenes} onAdd={handleAddImage} onRemove={handleRemoveImage}/></Card>
      <Card className="p-4"><p className="text-[12px] font-semibold text-slate-600 mb-3">Ubicación</p><MapEmbed lat={p.lat} lng={p.lng} name={p.nombre}/>{p.lat&&Number(p.lat)?<p className="text-[10px] text-slate-400 mt-2 font-mono">{p.lat}, {p.lng}</p>:null}</Card>
    </div>

    {/* Tabs */}
    <div className="flex gap-1 mb-4 border-b border-slate-200 overflow-x-auto">
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${tab===t.id?'border-blue-500 text-blue-600':'border-transparent text-slate-400 hover:text-slate-600'}`}>
        <t.icon className="w-3.5 h-3.5"/>{t.label}{t.count>0&&<span className="bg-slate-100 text-[10px] px-1.5 py-0.5 rounded-full">{t.count}</span>}
      </button>)}
    </div>

    {/* GENERAL */}
    {tab==='general'&&<div className="grid grid-cols-2 gap-3">
      <Card className="p-5">
        <SectionLabel>Información general</SectionLabel>
        <DetailRow label="Tipo" value={{bodega:'Bodega / Industrial',local_comercial:'Local Comercial',residencial:'Residencial',terreno:'Terreno',complejo:'Complejo / Plaza'}[p.tipo]}/>
        <DetailRow label="Uso de suelo" value={p.uso_suelo}/><DetailRow label="Moneda" value={p.moneda}/>
        <DetailRow label="Adquisición" value={fmtDate(p.fecha_adquisicion)}/>
        <DetailRow label="Valor catastral" value={p.valor_catastral?fmt(p.valor_catastral):null}/>
        <DetailRow label="Predial anual" value={p.predial_anual?fmt(p.predial_anual):null}/>
        <DetailRow label="País" value={p.pais}/>
        {p.notas&&<div className="mt-3 pt-3 border-t border-slate-100"><p className="text-[10px] text-slate-400 mb-1">Notas</p><p className="text-[12px] text-slate-600">{p.notas}</p></div>}
      </Card>
      <Card className="p-5">
        <SectionLabel>Superficies y construcción</SectionLabel>
        <DetailRow label="Superficie terreno" value={supTerr?`${supTerr.toLocaleString()} m²`:null}/>
        <DetailRow label="Superficie construcción" value={supConst?`${supConst.toLocaleString()} m²`:null}/>
        <DetailRow label="Altura libre" value={p.altura_m?`${p.altura_m} m`:null}/>
        <DetailRow label="Andenes" value={p.andenes||null}/><DetailRow label="KVA" value={p.kva?`${p.kva} KVA`:null}/>
        <DetailRow label="Voltaje" value={p.voltaje}/><DetailRow label="Estacionamientos" value={p.estacionamientos||null}/>
        <DetailRow label="HVAC" value={p.hvac?`Sí — ${p.hvac_desc}`:'No'}/>
        <DetailRow label="Sprinklers" value={p.sprinklers?'Sí':'No'}/><DetailRow label="Acceso tráiler" value={p.acceso_trailer?'Sí':'No'}/>
        {precioM2Const>0&&<div className="mt-3 pt-3 border-t border-slate-100">
          <DetailRow label="Renta / m² construcción" value={`${fmt(precioM2Const)}/m²`}/>
          {precioM2Terr>0&&<DetailRow label="Renta / m² terreno" value={`${fmt(precioM2Terr)}/m²`}/>}
          {valorM2Const>0&&<DetailRow label="Valor comercial / m²" value={`${fmt(valorM2Const)}/m²`}/>}
        </div>}
      </Card>
      {inquilino&&<Card className="p-5 col-span-2"><SectionLabel>Inquilino actual</SectionLabel><div className="grid grid-cols-2 gap-x-6"><DetailRow label="Nombre" value={inquilino.nombre}/><DetailRow label="RFC" value={inquilino.rfc}/><DetailRow label="Contacto" value={inquilino.contacto}/><DetailRow label="Teléfono" value={inquilino.telefono}/><DetailRow label="Email" value={inquilino.email}/></div></Card>}
    </div>}

    {/* SUBUNITS */}
    {tab==='unidades'&&<Card className="overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-700">{subunits.length} unidades</h3>
        <div className="text-[12px]"><span className="text-emerald-600 font-medium">{subunits.filter(u=>u.estatus==='rentada').length} rentadas</span> · Total: <span className="font-medium">{fmt(subsRentaTotal)}/mes</span></div>
      </div>
      <table className="w-full text-[12px]"><thead className="bg-slate-50/80"><tr>{['Clave','Unidad','m²','Renta','Inquilino','Estatus',''].map(h=><th key={h} className={`${h==='Renta'||h==='m²'?'text-right':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase`}>{h}</th>)}</tr></thead>
      <tbody>{subunits.map(u=>{const uInq=tenants.data.find(t=>t.propiedad_id===u.id);return<tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50"><td className="px-4 py-3"><Link to={`/propiedades/${u.id}`} className="font-mono text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded hover:bg-violet-100">{u.clave}</Link></td><td className="px-4 py-3 font-medium text-slate-700">{u.nombre}</td><td className="px-4 py-3 text-right">{u.superficie_construccion||'—'}</td><td className="px-4 py-3 text-right font-medium">{fmt(u.renta)}</td><td className="px-4 py-3 text-slate-600">{uInq?.nombre||'—'}</td><td className="px-4 py-3"><StatusBadge estatus={u.estatus}/></td><td className="px-4 py-3"><Link to={`/propiedades/${u.id}`} className="text-blue-500 text-[11px]">Ver →</Link></td></tr>})}</tbody></table>
    </Card>}

    {/* CONTRACTS */}
    {tab==='contrato'&&<div className="space-y-4">
      {activeContract?<Card className="p-5">
        <SectionLabel>Contrato activo</SectionLabel>
        <div className="grid grid-cols-2 gap-x-6">
          <DetailRow label="Modalidad" value={activeContract.tipo_contrato}/>
          <DetailRow label="Renta contrato" value={`${fmt(activeContract.renta)} ${activeContract.moneda}`}/>
          <DetailRow label="Inicio" value={fmtDate(activeContract.inicio)}/>
          <DetailRow label="Vencimiento" value={fmtDate(activeContract.fin)}/>
          <DetailRow label="Escalación" value={activeContract.escalacion}/>
          <DetailRow label="Depósito" value={fmt(activeContract.deposito)}/>
          <DetailRow label="Estatus" value={activeContract.estatus}/>
        </div>
        {rentaPropiedad>0&&rentaContrato>0&&rentaPropiedad!==rentaContrato&&<div className="mt-3 p-3 bg-amber-50 rounded-lg flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"/>
          <div><p className="text-[11px] text-amber-700 font-medium">La renta de referencia ({fmt(rentaPropiedad)}) difiere de la renta del contrato ({fmt(rentaContrato)})</p><p className="text-[10px] text-amber-600 mt-0.5">Los KPIs y rendimiento usan la renta del contrato activo.</p></div>
        </div>}
      </Card>:<Card className="p-10 text-center text-slate-400">Sin contrato activo</Card>}
      {historicalContracts.length>0&&<Card className="overflow-hidden">
        <CardHeader title={<span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5"/>Histórico de contratos ({historicalContracts.length})</span>}/>
        <table className="w-full text-[12px]"><thead className="bg-slate-50/80"><tr>{['Modalidad','Renta','Inicio','Fin','Escalación','Notas'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-slate-400 text-[10px] uppercase">{h}</th>)}</tr></thead>
        <tbody>{historicalContracts.map(c=><tr key={c.id} className="border-t border-slate-100"><td className="px-4 py-3"><Badge variant="gray">{c.tipo_contrato}</Badge></td><td className="px-4 py-3 font-medium">{fmt(c.renta)} {c.moneda}</td><td className="px-4 py-3 text-slate-500">{fmtDate(c.inicio)}</td><td className="px-4 py-3 text-slate-500">{fmtDate(c.fin)}</td><td className="px-4 py-3 text-slate-500">{c.escalacion}</td><td className="px-4 py-3 text-slate-500 text-[11px]">{c.notas||'—'}</td></tr>)}</tbody></table>
      </Card>}
    </div>}

    {/* VALORACION */}
    {tab==='valoracion'&&<div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-slate-500">Historial de valor del activo a través del tiempo</p>
        <Button variant="primary" size="sm" onClick={()=>setValModal('form')}><Plus className="w-3 h-3"/> Registrar avalúo</Button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4"><p className="text-[10px] text-slate-400 uppercase mb-1">Valor de adquisición</p><p className="text-lg font-semibold text-slate-800">{p.valor_catastral?fmt(p.valor_catastral):'—'}</p><p className="text-[10px] text-slate-400">{fmtDate(p.fecha_adquisicion)}</p></div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4"><p className="text-[10px] text-slate-400 uppercase mb-1">Valor comercial actual</p><p className="text-lg font-semibold text-slate-800">{valorComercial?fmt(valorComercial):'—'}</p><p className="text-[10px] text-slate-400">registrado en ficha</p></div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4"><p className="text-[10px] text-slate-400 uppercase mb-1">Último avalúo</p><p className="text-lg font-semibold text-slate-800">{propValuaciones.length>0?fmt(propValuaciones[propValuaciones.length-1].monto):'—'}</p><p className="text-[10px] text-slate-400">{propValuaciones.length>0?fmtDate(propValuaciones[propValuaciones.length-1].fecha):'Sin avalúos'}</p></div>
      </div>
      <Card className="overflow-hidden">
        <CardHeader title="Historial de valuaciones"/>
        {propValuaciones.length>0?<table className="w-full text-[12px]">
          <thead className="bg-slate-50/80"><tr>{['Fecha','Tipo','Monto','Fuente','Variación','Notas'].map(h=><th key={h} className={`${h==='Monto'||h==='Variación'?'text-right':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase`}>{h}</th>)}</tr></thead>
          <tbody>{propValuaciones.map((v,i)=>{
            const prev=i>0?Number(propValuaciones[i-1].monto):Number(p.valor_catastral)||0
            const curr=Number(v.monto)
            const variation=prev>0?((curr-prev)/prev*100).toFixed(1):null
            return<tr key={v.id} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-600">{fmtDate(v.fecha)}</td>
              <td className="px-4 py-3"><Badge variant={v.tipo==='avaluo'?'default':v.tipo==='compra'?'green':'gray'}>{v.tipo==='avaluo'?'Avalúo':v.tipo==='compra'?'Compra':v.tipo}</Badge></td>
              <td className="px-4 py-3 text-right font-medium text-slate-800">{fmt(v.monto)}</td>
              <td className="px-4 py-3 text-slate-500">{v.fuente||'—'}</td>
              <td className="px-4 py-3 text-right">{variation?<span className={Number(variation)>=0?'text-emerald-600':'text-red-500'}>{Number(variation)>=0?'+':''}{variation}%</span>:'—'}</td>
              <td className="px-4 py-3 text-slate-500 text-[11px]">{v.notas||'—'}</td>
            </tr>
          })}</tbody>
        </table>:<div className="p-10 text-center text-slate-400">
          <p className="mb-2">Sin valuaciones registradas</p>
          <p className="text-[11px]">Registra avalúos periódicos para ver la evolución del valor de esta propiedad</p>
        </div>}
      </Card>
    </div>}

    {/* ASSETS */}
    {tab==='activos'&&<div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-slate-500">{propAssets.length} activos · Valor: {fmt(totalAssetValue)} · Dep: {fmt(totalDepreciation)}/año</p>
        <Button variant="primary" size="sm" onClick={openNewAsset}><Plus className="w-3 h-3"/> Nuevo activo</Button>
      </div>
      <Card className="overflow-hidden">
        {propAssets.length>0?<table className="w-full text-[12px]">
          <thead className="bg-slate-50/80"><tr>{['Activo','Categoría','Valor orig.','Vida útil','Dep. anual','Valor actual','Próx. mantto.',''].map(h=><th key={h} className={`${['Valor orig.','Dep. anual','Valor actual'].includes(h)?'text-right':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase`}>{h}</th>)}</tr></thead>
          <tbody>{propAssets.map(a=>{const pctUsed=Number(a.valor_original)>0?(1-Number(a.valor_actual)/Number(a.valor_original))*100:0;return<tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/50 group"><td className="px-4 py-3"><p className="font-medium text-slate-700">{a.nombre}</p>{a.mantenimiento_preventivo&&<p className="text-[10px] text-slate-400 mt-0.5">{a.mantenimiento_preventivo}</p>}</td><td className="px-4 py-3"><Badge variant={{HVAC:'default',Seguridad:'red',Eléctrico:'amber',Infraestructura:'teal'}[a.categoria]||'gray'}>{a.categoria}</Badge></td><td className="px-4 py-3 text-right">{fmt(a.valor_original)}</td><td className="px-4 py-3">{a.vida_util_anios} años<div className="w-full bg-slate-100 rounded-full h-1.5 mt-1"><div className={`h-1.5 rounded-full ${pctUsed>80?'bg-red-400':pctUsed>50?'bg-amber-400':'bg-emerald-400'}`} style={{width:`${pctUsed}%`}}/></div></td><td className="px-4 py-3 text-right text-red-500">{fmt(a.depreciacion_anual)}</td><td className="px-4 py-3 text-right font-medium">{fmt(a.valor_actual)}</td><td className="px-4 py-3">{a.prox_mantenimiento?<span className="text-[11px] text-slate-500">{fmtDate(a.prox_mantenimiento)}</span>:'—'}</td><td className="px-4 py-3"><div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={()=>openEditAsset(a)} className="p-1 hover:bg-slate-100 rounded"><Pencil className="w-3 h-3 text-slate-400"/></button><button onClick={()=>assets.remove(a.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 text-red-400"/></button></div></td></tr>})}</tbody>
        </table>:<p className="p-10 text-center text-slate-400">Sin activos fijos</p>}
      </Card>
    </div>}

    {/* MAINTENANCE */}
    {tab==='mantenimiento'&&<Card className="overflow-hidden">{mantos.length>0?<table className="w-full text-[12px]"><thead className="bg-slate-50/80"><tr>{['Servicio','Tipo','Prioridad','Proveedor','Costo','Estatus'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-slate-400 text-[10px] uppercase">{h}</th>)}</tr></thead><tbody>{mantos.map(m=><tr key={m.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium text-slate-700">{m.titulo}</td><td className="px-4 py-3"><Badge variant={m.tipo==='preventivo'?'teal':'amber'}>{m.tipo}</Badge></td><td className="px-4 py-3"><Badge variant={m.prioridad==='urgente'?'red':m.prioridad==='programada'?'amber':'default'}>{m.prioridad}</Badge></td><td className="px-4 py-3 text-slate-600">{m.proveedor}</td><td className="px-4 py-3 font-medium">{fmt(m.costo)}</td><td className="px-4 py-3"><Badge variant={m.estatus==='completada'?'green':m.estatus==='programada'?'amber':'default'}>{m.estatus}</Badge></td></tr>)}</tbody></table>:<p className="p-10 text-center text-slate-400">Sin mantenimientos</p>}</Card>}

    {/* COBRANZA */}
    {tab==='cobranza'&&<Card className="overflow-hidden">{cobros.length>0?<table className="w-full text-[12px]"><thead className="bg-slate-50/80"><tr>{['Renta','Vencimiento','Pago','Estatus','CFDI'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-slate-400 text-[10px] uppercase">{h}</th>)}</tr></thead><tbody>{cobros.map(c=><tr key={c.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{fmt(c.renta)} {c.moneda}</td><td className="px-4 py-3 text-slate-500">{fmtDate(c.fecha_vencimiento)}</td><td className="px-4 py-3 text-slate-500">{c.fecha_pago?fmtDate(c.fecha_pago):'—'}</td><td className="px-4 py-3"><Badge variant={c.estatus==='pagado'?'green':c.estatus==='vencido'?'red':'amber'}>{c.estatus}</Badge></td><td className="px-4 py-3">{c.cfdi_folio?<Badge variant="default">{c.cfdi_folio}</Badge>:<Badge variant="gray">Pendiente</Badge>}</td></tr>)}</tbody></table>:<p className="p-10 text-center text-slate-400">Sin registros</p>}</Card>}

    {/* DOCS */}
    {tab==='documentos'&&<Card>{docs.length>0?docs.map(d=><div key={d.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><FileText className="w-4 h-4"/></div><div className="flex-1"><p className="text-[12px] font-medium text-slate-700">{d.nombre}</p><p className="text-[10px] text-slate-400">{d.descripcion}</p></div><Badge variant={{escritura:'default',contrato:'green',permiso:'amber',cfdi:'purple',poliza:'teal'}[d.tipo_doc]||'gray'}>{d.tipo_doc}</Badge><span className="text-[11px] text-slate-400">{fmtDate(d.fecha)}</span></div>):<p className="p-10 text-center text-slate-400">Sin documentos</p>}</Card>}

    {/* Modals */}
    <Modal open={assetModal==='form'} onClose={()=>setAssetModal(null)} title={assetEditId?'Editar activo':'Nuevo activo fijo'}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre *" className="col-span-2" value={assetForm.nombre||''} onChange={e=>setAssetForm(p=>({...p,nombre:e.target.value}))} placeholder="Ej: Sistema HVAC Carrier"/>
          <Select label="Categoría" value={assetForm.categoria||'HVAC'} onChange={e=>setAssetForm(p=>({...p,categoria:e.target.value}))}><option value="HVAC">HVAC</option><option value="Eléctrico">Eléctrico</option><option value="Seguridad">Seguridad</option><option value="Infraestructura">Infraestructura</option><option value="Otro">Otro</option></Select>
          <Input label="Valor original ($)" type="number" value={assetForm.valor_original||''} onChange={e=>setAssetForm(p=>({...p,valor_original:e.target.value}))}/>
          <Input label="Fecha adquisición" type="date" value={assetForm.fecha_adquisicion||''} onChange={e=>setAssetForm(p=>({...p,fecha_adquisicion:e.target.value}))}/>
          <Input label="Vida útil (años)" type="number" value={assetForm.vida_util_anios||10} onChange={e=>setAssetForm(p=>({...p,vida_util_anios:e.target.value}))}/>
          <Input label="Mantto. preventivo" value={assetForm.mantenimiento_preventivo||''} onChange={e=>setAssetForm(p=>({...p,mantenimiento_preventivo:e.target.value}))}/>
          <Input label="Próximo mantto." type="date" value={assetForm.prox_mantenimiento||''} onChange={e=>setAssetForm(p=>({...p,prox_mantenimiento:e.target.value}))}/>
        </div>
        <Textarea label="Notas" value={assetForm.notas||''} onChange={e=>setAssetForm(p=>({...p,notas:e.target.value}))}/>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={()=>setAssetModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSaveAsset}>{assetEditId?'Guardar':'Crear'}</Button></div>
      </div>
    </Modal>

    <Modal open={valModal==='form'} onClose={()=>setValModal(null)} title="Registrar valuación">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha *" type="date" value={valForm.fecha} onChange={e=>setValForm(p=>({...p,fecha:e.target.value}))}/>
          <Select label="Tipo" value={valForm.tipo} onChange={e=>setValForm(p=>({...p,tipo:e.target.value}))}><option value="avaluo">Avalúo</option><option value="compra">Compra</option><option value="estimacion">Estimación interna</option></Select>
          <Input label="Monto *" type="number" value={valForm.monto} onChange={e=>setValForm(p=>({...p,monto:e.target.value}))}/>
          <Input label="Fuente / Perito" value={valForm.fuente} onChange={e=>setValForm(p=>({...p,fuente:e.target.value}))} placeholder="Nombre del perito o fuente"/>
        </div>
        <Textarea label="Notas" value={valForm.notas} onChange={e=>setValForm(p=>({...p,notas:e.target.value}))}/>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={()=>setValModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSaveVal}>Registrar</Button></div>
      </div>
    </Modal>

    <ConfirmDialog open={deleteOpen} onClose={()=>setDeleteOpen(false)} onConfirm={()=>{properties.remove(p.id);nav('/propiedades')}} title="Eliminar propiedad" message="Esta acción es permanente."/>
  </div>
}
