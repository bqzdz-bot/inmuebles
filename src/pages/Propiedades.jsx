import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../data/DataContext'
import { fmt } from '../data/store'
import { PageHeader, Card, Button, FilterChip, StatusBadge, TipoBadge, Modal, Input, Select, Textarea, Checkbox, ConfirmDialog, Badge } from '../components/UI'
import { Plus, Search, MapPin, Pencil, Trash2, Eye, Layers, ChevronRight } from 'lucide-react'

const EMPTY={grupo_id:'',parent_id:'',clave:'',nombre:'',direccion:'',colonia:'',ciudad:'Hermosillo',estado:'Sonora',cp:'',tipo:'bodega',uso_suelo:'',renta:'',moneda:'MXN',estatus:'vacante',fecha_adquisicion:'',valor_catastral:'',valor_comercial:'',superficie_terreno:'',superficie_construccion:'',altura_m:'',andenes:'',kva:'',voltaje:'',hvac:false,hvac_desc:'',sprinklers:false,estacionamientos:'',acceso_trailer:false,predial_anual:'',notas:'',lat:'',lng:'',imagenes:[]}

export default function Propiedades(){
  const{properties,groups}=useData()
  const[tipo,setTipo]=useState('all')
  const[grupoF,setGrupoF]=useState('all')
  const[search,setSearch]=useState('')
  const[modal,setModal]=useState(null)
  const[form,setForm]=useState(EMPTY)
  const[editId,setEditId]=useState(null)
  const[deleteId,setDeleteId]=useState(null)
  const setF=(k,v)=>setForm(p=>({...p,[k]:v}))

  // Show parent properties + standalone (no parent_id)
  const parentProps = properties.data.filter(p=>!p.parent_id)
  const filtered = parentProps.filter(p=>{
    if(tipo!=='all'&&p.tipo!==tipo&&!(tipo==='local_comercial'&&p.tipo==='complejo'))return false
    if(grupoF!=='all'&&p.grupo_id!==grupoF)return false
    if(search){const s=search.toLowerCase();return p.nombre.toLowerCase().includes(s)||p.clave.toLowerCase().includes(s)||p.ciudad.toLowerCase().includes(s)}
    return true
  })

  const getSubunits=(pid)=>properties.data.filter(p=>p.parent_id===pid)
  const openNew=()=>{setForm(EMPTY);setEditId(null);setModal('form')}
  const openEdit=(p)=>{setForm({...p});setEditId(p.id);setModal('form')}
  const handleSave=()=>{if(!form.clave||!form.nombre)return alert('Clave y nombre son requeridos');editId?properties.update(editId,form):properties.add(form);setModal(null)}

  return<div>
    <PageHeader title="Propiedades" subtitle={`${parentProps.length} propiedades · ${properties.data.filter(p=>p.parent_id).length} subunidades`}>
      <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5"/> Nueva propiedad</Button>
    </PageHeader>

    <Card className="mb-4"><div className="px-4 py-3 flex gap-3 items-center flex-wrap">
      <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/><input className="w-full pl-9 pr-3 py-2 text-[12px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="flex gap-1.5">
        {[['all','Todas'],['bodega','Industrial'],['local_comercial','Comercial'],['residencial','Residencial']].map(([k,l])=>
          <FilterChip key={k} active={tipo===k} onClick={()=>setTipo(k)}>{l}</FilterChip>
        )}
      </div>
      <select className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white" value={grupoF} onChange={e=>setGrupoF(e.target.value)}>
        <option value="all">Todos los grupos</option>
        {groups.data.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}
      </select>
    </div></Card>

    <div className="space-y-2">
      {filtered.map((p,i)=>{
        const grupo=groups.data.find(g=>g.id===p.grupo_id)
        const subs=getSubunits(p.id)
        const isComplejo=p.tipo==='complejo'||subs.length>0
        const subsRenta=subs.reduce((s,u)=>s+Number(u.renta||0),0)
        const subsRentadas=subs.filter(u=>u.estatus==='rentada').length
        const displayRenta=isComplejo?subsRenta:Number(p.renta)

        return<Card key={p.id} className="overflow-hidden" style={{animation:`slideUp 0.3s ease-out ${i*25}ms both`}}>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50">
            <Link to={`/propiedades/${p.id}`} className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100">{p.clave}</Link>
            <Link to={`/propiedades/${p.id}`} className="flex-1 min-w-0">
              <p className="font-medium text-slate-700 hover:text-blue-600 truncate">{p.nombre}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{p.direccion}, {p.ciudad}</p>
            </Link>
            {grupo&&<span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0"><Layers className="w-3 h-3"/>{grupo.nombre.length>18?grupo.nombre.slice(0,18)+'…':grupo.nombre}</span>}
            <TipoBadge tipo={p.tipo}/>
            <div className="text-right w-20 shrink-0"><p className="text-[12px] font-medium">{p.superficie_terreno?Number(p.superficie_terreno).toLocaleString():''}</p><p className="text-[10px] text-slate-400">m² terreno</p></div>
            <div className="text-right w-20 shrink-0"><p className="text-[12px] font-medium">{p.superficie_construccion?Number(p.superficie_construccion).toLocaleString():''}</p><p className="text-[10px] text-slate-400">m² const.</p></div>
            <div className="text-right w-24 shrink-0"><p className="text-[12px] font-medium">{fmt(displayRenta)}</p><p className="text-[10px] text-slate-400">{p.moneda}/mes</p></div>
            {isComplejo?<Badge variant="purple">{subsRentadas}/{subs.length} locales</Badge>:<StatusBadge estatus={p.estatus}/>}
            <div className="flex gap-1 shrink-0">
              <Link to={`/propiedades/${p.id}`} className="p-1.5 hover:bg-slate-100 rounded-md"><Eye className="w-3.5 h-3.5 text-slate-400"/></Link>
              <button onClick={()=>openEdit(p)} className="p-1.5 hover:bg-slate-100 rounded-md"><Pencil className="w-3.5 h-3.5 text-slate-400"/></button>
              <button onClick={()=>setDeleteId(p.id)} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
            </div>
          </div>
          {subs.length>0&&<div className="border-t border-slate-100 bg-slate-50/30 px-4 py-2 space-y-1">
            {subs.map(u=><Link key={u.id} to={`/propiedades/${u.id}`} className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-white transition-all text-[11px]">
              <span className="font-mono text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{u.clave}</span>
              <span className="flex-1 text-slate-600">{u.nombre}</span>
              <span className="text-slate-500">{u.superficie_construccion?`${u.superficie_construccion} m²`:''}</span>
              <span className="font-medium w-20 text-right">{fmt(u.renta)}</span>
              <StatusBadge estatus={u.estatus}/>
              <ChevronRight className="w-3 h-3 text-slate-300"/>
            </Link>)}
          </div>}
        </Card>
      })}
      {filtered.length===0&&<Card className="p-16 text-center text-slate-400">No hay propiedades</Card>}
    </div>

    <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editId?'Editar propiedad':'Nueva propiedad'} width="max-w-3xl">
      <div className="space-y-5">
        <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Identificación</p>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Grupo / Propietario" value={form.grupo_id} onChange={e=>setF('grupo_id',e.target.value)}><option value="">Sin grupo</option>{groups.data.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}</Select>
            <Select label="Propiedad padre (si es subunidad)" value={form.parent_id} onChange={e=>setF('parent_id',e.target.value)}><option value="">Ninguna — es propiedad independiente</option>{properties.data.filter(p=>!p.parent_id&&p.id!==editId).map(p=><option key={p.id} value={p.id}>{p.clave} — {p.nombre}</option>)}</Select>
            <Input label="Clave interna *" placeholder="BOD-HMO-001" value={form.clave} onChange={e=>setF('clave',e.target.value)}/>
            <Input label="Nombre *" value={form.nombre} onChange={e=>setF('nombre',e.target.value)}/>
            <Select label="Tipo" value={form.tipo} onChange={e=>setF('tipo',e.target.value)}><option value="bodega">Bodega / Industrial</option><option value="local_comercial">Local Comercial</option><option value="complejo">Complejo / Plaza comercial</option><option value="residencial">Residencial</option><option value="terreno">Terreno</option></Select>
            <Input label="Uso de suelo" value={form.uso_suelo} onChange={e=>setF('uso_suelo',e.target.value)}/>
          </div>
        </div>
        <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Dirección y ubicación</p>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Calle y número" className="col-span-2" value={form.direccion} onChange={e=>setF('direccion',e.target.value)}/>
            <Input label="Colonia" value={form.colonia} onChange={e=>setF('colonia',e.target.value)}/>
            <Input label="Ciudad" value={form.ciudad} onChange={e=>setF('ciudad',e.target.value)}/>
            <Input label="Estado" value={form.estado} onChange={e=>setF('estado',e.target.value)}/>
            <Input label="C.P." value={form.cp} onChange={e=>setF('cp',e.target.value)}/>
            <Input label="Latitud" type="number" step="any" placeholder="29.0650" value={form.lat} onChange={e=>setF('lat',e.target.value)}/>
            <Input label="Longitud" type="number" step="any" placeholder="-110.5447" value={form.lng} onChange={e=>setF('lng',e.target.value)}/>
          </div>
        </div>
        <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Operación</p>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Renta mensual" type="number" value={form.renta} onChange={e=>setF('renta',e.target.value)}/>
            <Select label="Moneda" value={form.moneda} onChange={e=>setF('moneda',e.target.value)}><option value="MXN">MXN</option><option value="USD">USD</option></Select>
            <Select label="Estatus" value={form.estatus} onChange={e=>setF('estatus',e.target.value)}><option value="vacante">Vacante</option><option value="rentada">Rentada</option><option value="en_remodelacion">En remodelación</option><option value="en_venta">En venta</option><option value="propia">Propia</option></Select>
            <Input label="Valor catastral" type="number" value={form.valor_catastral} onChange={e=>setF('valor_catastral',e.target.value)}/>
            <Input label="Valor comercial" type="number" value={form.valor_comercial} onChange={e=>setF('valor_comercial',e.target.value)}/>
            <Input label="Fecha adquisición" type="date" value={form.fecha_adquisicion} onChange={e=>setF('fecha_adquisicion',e.target.value)}/>
            <Input label="Predial anual" type="number" value={form.predial_anual} onChange={e=>setF('predial_anual',e.target.value)}/>
          </div>
        </div>
        <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Superficies y construcción</p>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Superficie terreno (m²)" type="number" value={form.superficie_terreno} onChange={e=>setF('superficie_terreno',e.target.value)}/>
            <Input label="Superficie construcción (m²)" type="number" value={form.superficie_construccion} onChange={e=>setF('superficie_construccion',e.target.value)}/>
            <Input label="Altura libre (m)" type="number" step="0.1" value={form.altura_m} onChange={e=>setF('altura_m',e.target.value)}/>
            <Input label="Andenes" type="number" value={form.andenes} onChange={e=>setF('andenes',e.target.value)}/>
            <Input label="KVA" type="number" value={form.kva} onChange={e=>setF('kva',e.target.value)}/>
            <Input label="Voltaje" value={form.voltaje} onChange={e=>setF('voltaje',e.target.value)}/>
            <Input label="Estacionamientos" type="number" value={form.estacionamientos} onChange={e=>setF('estacionamientos',e.target.value)}/>
          </div>
          <div className="flex gap-6 mt-3">
            <Checkbox label="HVAC" checked={form.hvac} onChange={e=>setF('hvac',e.target.checked)}/>
            <Checkbox label="Sprinklers" checked={form.sprinklers} onChange={e=>setF('sprinklers',e.target.checked)}/>
            <Checkbox label="Acceso tráiler" checked={form.acceso_trailer} onChange={e=>setF('acceso_trailer',e.target.checked)}/>
          </div>
          {form.hvac&&<Input label="Descripción HVAC" className="mt-3" value={form.hvac_desc} onChange={e=>setF('hvac_desc',e.target.value)}/>}
        </div>
        <Textarea label="Notas" value={form.notas} onChange={e=>setF('notas',e.target.value)}/>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={()=>setModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>{editId?'Guardar':'Crear'}</Button></div>
      </div>
    </Modal>
    <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>properties.remove(deleteId)} title="Eliminar propiedad" message="¿Eliminar esta propiedad?"/>
  </div>
}
