import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../data/DataContext'
import { fmt, fmtDate } from '../data/store'
import { Card, CardHeader, Button, Badge, StatusBadge, TipoBadge, DetailRow, SectionLabel, MapEmbed, ImageGallery, ConfirmDialog, Modal, Input, Select, Textarea } from '../components/UI'
import { ArrowLeft, Pencil, Trash2, Building2, MapPin, FileText, Wrench, DollarSign, Layers, Box, Plus, ChevronRight, History } from 'lucide-react'
import { useState } from 'react'

export default function PropiedadDetalle(){
  const{id}=useParams()
  const nav=useNavigate()
  const{properties,tenants,contracts,maintenance,documents,groups,collections,assets}=useData()
  const[tab,setTab]=useState('general')
  const[deleteOpen,setDeleteOpen]=useState(false)
  const[assetModal,setAssetModal]=useState(null)
  const[assetForm,setAssetForm]=useState({})
  const[assetEditId,setAssetEditId]=useState(null)

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
  const totalAssetValue=propAssets.reduce((s,a)=>s+Number(a.valor_actual||0),0)
  const totalDepreciation=propAssets.reduce((s,a)=>s+Number(a.depreciacion_anual||0),0)

  const handleAddImage=(dataUrl)=>{properties.update(p.id,{imagenes:[...(p.imagenes||[]),dataUrl]})}
  const handleRemoveImage=(idx)=>{properties.update(p.id,{imagenes:(p.imagenes||[]).filter((_,i)=>i!==idx)})}

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

  const tabs=[
    {id:'general',label:'General',icon:Building2},
    ...(subunits.length>0?[{id:'unidades',label:`Unidades (${subunits.length})`,icon:Layers}]:[]),
    {id:'contrato',label:'Contratos',icon:FileText,count:allContracts.length},
    {id:'activos',label:'Activos fijos',icon:Box,count:propAssets.length},
    {id:'mantenimiento',label:'Mantenimiento',icon:Wrench,count:mantos.length},
    {id:'cobranza',label:'Cobranza',icon:DollarSign,count:cobros.length},
    {id:'documentos',label:'Documentos',icon:FileText,count:docs.length},
  ]

  const valorComercial=Number(p.valor_comercial)||0
  const rentaAnual=Number(p.renta)*12||(subunits.reduce((s,u)=>s+Number(u.renta||0),0)*12)
  const yieldPct=valorComercial>0?(rentaAnual/valorComercial*100).toFixed(1):'—'

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
          <p className="text-[12px] text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3"/>{p.direccion}, {p.colonia} · {p.ciudad}, {p.estado}</p>
          {grupo&&<p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"><Layers className="w-3 h-3"/>Grupo: <span className="text-slate-600 font-medium">{grupo.nombre}</span></p>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="danger" onClick={()=>setDeleteOpen(true)}><Trash2 className="w-3 h-3"/></Button>
      </div>
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-5 gap-3 mb-5">
      <div className="bg-white border border-slate-200/80 rounded-xl p-4"><p className="text-[10px] text-slate-400 uppercase mb-1">Renta mensual</p><p className="text-xl font-semibold">{fmt(p.renta||subunits.reduce((s,u)=>s+Number(u.renta),0))} <span className="text-sm text-slate-400">{p.moneda}</span></p></div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-4"><p className="text-[10px] text-slate-400 uppercase mb-1">Valor comercial</p><p className="text-xl font-semibold">{valorComercial?fmt(valorComercial):'—'}</p></div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-4"><p className="text-[10px] text-slate-400 uppercase mb-1">Rendimiento</p><p className="text-xl font-semibold text-emerald-600">{yieldPct}%</p><p className="text-[10px] text-slate-400">anual</p></div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-4"><p className="text-[10px] text-slate-400 uppercase mb-1">Activos fijos</p><p className="text-xl font-semibold">{fmt(totalAssetValue)}</p><p className="text-[10px] text-slate-400">valor actual</p></div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-4"><p className="text-[10px] text-slate-400 uppercase mb-1">Depreciación</p><p className="text-xl font-semibold text-red-500">{fmt(totalDepreciation)}</p><p className="text-[10px] text-slate-400">/año</p></div>
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
        {p.notas&&<div className="mt-3 pt-3 border-t border-slate-100"><p className="text-[10px] text-slate-400 mb-1">Notas</p><p className="text-[12px] text-slate-600">{p.notas}</p></div>}
      </Card>
      <Card className="p-5">
        <SectionLabel>Superficies y construcción</SectionLabel>
        <DetailRow label="Superficie terreno" value={p.superficie_terreno?`${Number(p.superficie_terreno).toLocaleString()} m²`:null}/>
        <DetailRow label="Superficie construcción" value={p.superficie_construccion?`${Number(p.superficie_construccion).toLocaleString()} m²`:null}/>
        <DetailRow label="Altura libre" value={p.altura_m?`${p.altura_m} m`:null}/>
        <DetailRow label="Andenes" value={p.andenes||null}/><DetailRow label="KVA" value={p.kva?`${p.kva} KVA`:null}/>
        <DetailRow label="Voltaje" value={p.voltaje}/><DetailRow label="Estacionamientos" value={p.estacionamientos||null}/>
        <DetailRow label="HVAC" value={p.hvac?`Sí — ${p.hvac_desc}`:'No'}/>
        <DetailRow label="Sprinklers" value={p.sprinklers?'Sí':'No'}/><DetailRow label="Acceso tráiler" value={p.acceso_trailer?'Sí':'No'}/>
      </Card>
      {inquilino&&<Card className="p-5 col-span-2"><SectionLabel>Inquilino actual</SectionLabel><div className="grid grid-cols-2 gap-x-6"><DetailRow label="Nombre" value={inquilino.nombre}/><DetailRow label="RFC" value={inquilino.rfc}/><DetailRow label="Contacto" value={inquilino.contacto}/><DetailRow label="Teléfono" value={inquilino.telefono}/><DetailRow label="Email" value={inquilino.email}/></div></Card>}
    </div>}

    {/* SUBUNITS */}
    {tab==='unidades'&&<Card className="overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-700">{subunits.length} unidades en este complejo</h3>
        <div className="text-[12px]"><span className="text-emerald-600 font-medium">{subunits.filter(u=>u.estatus==='rentada').length} rentadas</span> · <span className="text-amber-600">{subunits.filter(u=>u.estatus!=='rentada').length} disponibles</span> · Total: <span className="font-medium">{fmt(subunits.reduce((s,u)=>s+Number(u.renta),0))}/mes</span></div>
      </div>
      <table className="w-full text-[12px]">
        <thead className="bg-slate-50/80"><tr>{['Clave','Unidad','m² const.','Renta','Inquilino','Estatus',''].map(h=><th key={h} className={`${h==='Renta'||h==='m² const.'?'text-right':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase tracking-wider`}>{h}</th>)}</tr></thead>
        <tbody>{subunits.map(u=>{
          const uInq=tenants.data.find(t=>t.propiedad_id===u.id)
          return<tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50">
            <td className="px-4 py-3"><Link to={`/propiedades/${u.id}`} className="font-mono text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded hover:bg-violet-100">{u.clave}</Link></td>
            <td className="px-4 py-3 font-medium text-slate-700">{u.nombre}</td>
            <td className="px-4 py-3 text-right">{u.superficie_construccion||'—'}</td>
            <td className="px-4 py-3 text-right font-medium">{fmt(u.renta)} <span className="text-[10px] text-slate-400">{u.moneda}</span></td>
            <td className="px-4 py-3 text-slate-600">{uInq?.nombre||<span className="text-slate-300">—</span>}</td>
            <td className="px-4 py-3"><StatusBadge estatus={u.estatus}/></td>
            <td className="px-4 py-3"><Link to={`/propiedades/${u.id}`} className="text-blue-500 text-[11px] font-medium hover:text-blue-600">Ver →</Link></td>
          </tr>
        })}</tbody>
      </table>
    </Card>}

    {/* CONTRACTS - with historical */}
    {tab==='contrato'&&<div className="space-y-4">
      {activeContract?<Card className="p-5"><SectionLabel>Contrato activo</SectionLabel><div className="grid grid-cols-2 gap-x-6">
        <DetailRow label="Modalidad" value={activeContract.tipo_contrato}/><DetailRow label="Renta" value={`${fmt(activeContract.renta)} ${activeContract.moneda}`}/>
        <DetailRow label="Inicio" value={fmtDate(activeContract.inicio)}/><DetailRow label="Vencimiento" value={fmtDate(activeContract.fin)}/>
        <DetailRow label="Escalación" value={activeContract.escalacion}/><DetailRow label="Depósito" value={fmt(activeContract.deposito)}/>
        <DetailRow label="Estatus" value={activeContract.estatus}/>
        {activeContract.notas&&<DetailRow label="Notas" value={activeContract.notas}/>}
      </div></Card>:<Card className="p-10 text-center text-slate-400">Sin contrato activo</Card>}
      {historicalContracts.length>0&&<Card className="overflow-hidden">
        <CardHeader title={<span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5"/>Histórico de contratos ({historicalContracts.length})</span>}/>
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50/80"><tr>{['Modalidad','Renta','Inicio','Fin','Escalación','Notas'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-slate-400 text-[10px] uppercase">{h}</th>)}</tr></thead>
          <tbody>{historicalContracts.map(c=><tr key={c.id} className="border-t border-slate-100">
            <td className="px-4 py-3"><Badge variant="gray">{c.tipo_contrato}</Badge></td>
            <td className="px-4 py-3 font-medium">{fmt(c.renta)} {c.moneda}</td>
            <td className="px-4 py-3 text-slate-500">{fmtDate(c.inicio)}</td>
            <td className="px-4 py-3 text-slate-500">{fmtDate(c.fin)}</td>
            <td className="px-4 py-3 text-slate-500">{c.escalacion}</td>
            <td className="px-4 py-3 text-slate-500 text-[11px]">{c.notas||'—'}</td>
          </tr>)}</tbody>
        </table>
      </Card>}
    </div>}

    {/* ASSETS */}
    {tab==='activos'&&<div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-slate-500">{propAssets.length} activos · Valor actual: <span className="font-medium text-slate-700">{fmt(totalAssetValue)}</span> · Depreciación: <span className="font-medium text-red-500">{fmt(totalDepreciation)}/año</span></p>
        <Button variant="primary" size="sm" onClick={openNewAsset}><Plus className="w-3 h-3"/> Nuevo activo</Button>
      </div>
      <Card className="overflow-hidden">
        {propAssets.length>0?<table className="w-full text-[12px]">
          <thead className="bg-slate-50/80"><tr>{['Activo','Categoría','Valor original','Vida útil','Dep. anual','Valor actual','Próx. mantto.',''].map(h=><th key={h} className={`${['Valor original','Dep. anual','Valor actual'].includes(h)?'text-right':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase tracking-wider`}>{h}</th>)}</tr></thead>
          <tbody>{propAssets.map(a=>{
            const pctUsed=Number(a.valor_original)>0?(1-Number(a.valor_actual)/Number(a.valor_original))*100:0
            return<tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/50 group">
              <td className="px-4 py-3"><p className="font-medium text-slate-700">{a.nombre}</p>{a.mantenimiento_preventivo&&<p className="text-[10px] text-slate-400 mt-0.5">{a.mantenimiento_preventivo}</p>}</td>
              <td className="px-4 py-3"><Badge variant={{HVAC:'default',Seguridad:'red',Eléctrico:'amber',Infraestructura:'teal'}[a.categoria]||'gray'}>{a.categoria}</Badge></td>
              <td className="px-4 py-3 text-right">{fmt(a.valor_original)}</td>
              <td className="px-4 py-3">{a.vida_util_anios} años<div className="w-full bg-slate-100 rounded-full h-1.5 mt-1"><div className={`h-1.5 rounded-full ${pctUsed>80?'bg-red-400':pctUsed>50?'bg-amber-400':'bg-emerald-400'}`} style={{width:`${pctUsed}%`}}/></div></td>
              <td className="px-4 py-3 text-right text-red-500">{fmt(a.depreciacion_anual)}</td>
              <td className="px-4 py-3 text-right font-medium">{fmt(a.valor_actual)}</td>
              <td className="px-4 py-3">{a.prox_mantenimiento?<span className="text-[11px] text-slate-500">{fmtDate(a.prox_mantenimiento)}</span>:'—'}</td>
              <td className="px-4 py-3"><div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={()=>openEditAsset(a)} className="p-1 hover:bg-slate-100 rounded"><Pencil className="w-3 h-3 text-slate-400"/></button><button onClick={()=>assets.remove(a.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 text-red-400"/></button></div></td>
            </tr>
          })}</tbody>
        </table>:<p className="p-10 text-center text-slate-400">Sin activos fijos registrados</p>}
      </Card>
    </div>}

    {/* MAINTENANCE */}
    {tab==='mantenimiento'&&<Card className="overflow-hidden">{mantos.length>0?<table className="w-full text-[12px]">
      <thead className="bg-slate-50/80"><tr>{['Servicio','Tipo','Prioridad','Proveedor','Costo','Estatus'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-slate-400 text-[10px] uppercase">{h}</th>)}</tr></thead>
      <tbody>{mantos.map(m=><tr key={m.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium text-slate-700">{m.titulo}</td><td className="px-4 py-3"><Badge variant={m.tipo==='preventivo'?'teal':'amber'}>{m.tipo}</Badge></td><td className="px-4 py-3"><Badge variant={m.prioridad==='urgente'?'red':m.prioridad==='programada'?'amber':'default'}>{m.prioridad}</Badge></td><td className="px-4 py-3 text-slate-600">{m.proveedor}</td><td className="px-4 py-3 font-medium">{fmt(m.costo)}</td><td className="px-4 py-3"><Badge variant={m.estatus==='completada'?'green':m.estatus==='programada'?'amber':'default'}>{m.estatus}</Badge></td></tr>)}</tbody>
    </table>:<p className="p-10 text-center text-slate-400">Sin mantenimientos</p>}</Card>}

    {/* COBRANZA */}
    {tab==='cobranza'&&<Card className="overflow-hidden">{cobros.length>0?<table className="w-full text-[12px]">
      <thead className="bg-slate-50/80"><tr>{['Renta','Vencimiento','Pago','Estatus','CFDI'].map(h=><th key={h} className="text-left px-4 py-3 font-medium text-slate-400 text-[10px] uppercase">{h}</th>)}</tr></thead>
      <tbody>{cobros.map(c=><tr key={c.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{fmt(c.renta)} {c.moneda}</td><td className="px-4 py-3 text-slate-500">{fmtDate(c.fecha_vencimiento)}</td><td className="px-4 py-3 text-slate-500">{c.fecha_pago?fmtDate(c.fecha_pago):'—'}</td><td className="px-4 py-3"><Badge variant={c.estatus==='pagado'?'green':c.estatus==='vencido'?'red':'amber'}>{c.estatus}</Badge></td><td className="px-4 py-3">{c.cfdi_folio?<Badge variant="default">{c.cfdi_folio}</Badge>:<Badge variant="gray">Pendiente</Badge>}</td></tr>)}</tbody>
    </table>:<p className="p-10 text-center text-slate-400">Sin registros</p>}</Card>}

    {/* DOCS */}
    {tab==='documentos'&&<Card>{docs.length>0?docs.map(d=><div key={d.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><FileText className="w-4 h-4"/></div><div className="flex-1"><p className="text-[12px] font-medium text-slate-700">{d.nombre}</p><p className="text-[10px] text-slate-400">{d.descripcion}</p></div><Badge variant={{escritura:'default',contrato:'green',permiso:'amber',cfdi:'purple',poliza:'teal'}[d.tipo_doc]||'gray'}>{d.tipo_doc}</Badge><span className="text-[11px] text-slate-400">{fmtDate(d.fecha)}</span></div>):<p className="p-10 text-center text-slate-400">Sin documentos</p>}</Card>}

    {/* Asset modal */}
    <Modal open={assetModal==='form'} onClose={()=>setAssetModal(null)} title={assetEditId?'Editar activo':'Nuevo activo fijo'}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre del activo *" className="col-span-2" value={assetForm.nombre||''} onChange={e=>setAssetForm(p=>({...p,nombre:e.target.value}))} placeholder="Ej: Sistema HVAC Carrier 10 ton"/>
          <Select label="Categoría" value={assetForm.categoria||'HVAC'} onChange={e=>setAssetForm(p=>({...p,categoria:e.target.value}))}><option value="HVAC">HVAC</option><option value="Eléctrico">Eléctrico</option><option value="Seguridad">Seguridad</option><option value="Infraestructura">Infraestructura</option><option value="Otro">Otro</option></Select>
          <Input label="Valor original ($)" type="number" value={assetForm.valor_original||''} onChange={e=>setAssetForm(p=>({...p,valor_original:e.target.value}))}/>
          <Input label="Fecha adquisición" type="date" value={assetForm.fecha_adquisicion||''} onChange={e=>setAssetForm(p=>({...p,fecha_adquisicion:e.target.value}))}/>
          <Input label="Vida útil (años)" type="number" value={assetForm.vida_util_anios||10} onChange={e=>setAssetForm(p=>({...p,vida_util_anios:e.target.value}))}/>
          <Input label="Mantenimiento preventivo" value={assetForm.mantenimiento_preventivo||''} onChange={e=>setAssetForm(p=>({...p,mantenimiento_preventivo:e.target.value}))} placeholder="Ej: Servicio trimestral"/>
          <Input label="Próximo mantenimiento" type="date" value={assetForm.prox_mantenimiento||''} onChange={e=>setAssetForm(p=>({...p,prox_mantenimiento:e.target.value}))}/>
        </div>
        <Textarea label="Notas" value={assetForm.notas||''} onChange={e=>setAssetForm(p=>({...p,notas:e.target.value}))}/>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={()=>setAssetModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSaveAsset}>{assetEditId?'Guardar':'Crear activo'}</Button></div>
      </div>
    </Modal>

    <ConfirmDialog open={deleteOpen} onClose={()=>setDeleteOpen(false)} onConfirm={()=>{properties.remove(p.id);nav('/propiedades')}} title="Eliminar propiedad" message="Esta acción es permanente."/>
  </div>
}
