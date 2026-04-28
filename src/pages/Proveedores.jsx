import { useState } from 'react'
import { useData } from '../data/DataContext'
import { fmtDate } from '../data/store'
import { PageHeader, Card, CardHeader, Button, RatingStars, Modal, Input, Textarea, ConfirmDialog, Badge, Select } from '../components/UI'
import { Plus, Pencil, Trash2, Star, ChevronDown, ChevronUp } from 'lucide-react'

const EMPTY = { nombre:'', contacto:'', telefono:'', email:'', rfc:'', especialidades:[], certificaciones:[], calificacion:0, servicios_realizados:0, tarifa_promedio:'', tiempo_respuesta:'', notas:'' }

function StarInput({ label, value, onChange }) {
  return <div className="space-y-1"><label className="block text-[12px] font-medium text-slate-600">{label}</label><div className="flex gap-1">{[1,2,3,4,5].map(s=>
    <button key={s} type="button" onClick={()=>onChange(s)} className={`text-lg ${s<=value?'text-amber-400':'text-slate-200'} hover:text-amber-300 transition-colors`}>★</button>
  )}</div></div>
}

export default function Proveedores() {
  const { providers, evaluaciones, maintenance } = useData()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [evalModal, setEvalModal] = useState(null)
  const [evalForm, setEvalForm] = useState({ proveedor_id:'', orden_id:'', calidad:5, puntualidad:5, precio:5, limpieza:5, comunicacion:5, comentario:'', fecha:new Date().toISOString().slice(0,10) })
  const [expanded, setExpanded] = useState(null)
  const [espInput, setEspInput] = useState('')
  const [certInput, setCertInput] = useState('')
  const setF = (k,v) => setForm(p=>({...p,[k]:v}))

  const openNew = () => { setForm(EMPTY); setEditId(null); setEspInput(''); setCertInput(''); setModal('form') }
  const openEdit = (p) => { setForm({...p}); setEditId(p.id); setEspInput(''); setCertInput(''); setModal('form') }
  const handleSave = () => { if(!form.nombre) return alert('Nombre es requerido'); editId?providers.update(editId,form):providers.add(form); setModal(null) }

  const addEsp = () => { if(espInput.trim()){setF('especialidades',[...(form.especialidades||[]),espInput.trim()]);setEspInput('')} }
  const removeEsp = (i) => { setF('especialidades',(form.especialidades||[]).filter((_,idx)=>idx!==i)) }
  const addCert = () => { if(certInput.trim()){setF('certificaciones',[...(form.certificaciones||[]),certInput.trim()]);setCertInput('')} }
  const removeCert = (i) => { setF('certificaciones',(form.certificaciones||[]).filter((_,idx)=>idx!==i)) }

  const openEval = (provId) => {
    setEvalForm({ proveedor_id:provId, orden_id:'', calidad:5, puntualidad:5, precio:5, limpieza:5, comunicacion:5, comentario:'', fecha:new Date().toISOString().slice(0,10) })
    setEvalModal('form')
  }

  const handleSaveEval = async () => {
    const avg = (evalForm.calidad+evalForm.puntualidad+evalForm.precio+evalForm.limpieza+evalForm.comunicacion)/5
    await evaluaciones.add(evalForm)
    // Update provider average
    const provEvals = [...evaluaciones.data.filter(e=>e.proveedor_id===evalForm.proveedor_id), evalForm]
    const newAvg = provEvals.reduce((s,e)=>{
      const ea = ((e.calidad||5)+(e.puntualidad||5)+(e.precio||5)+(e.limpieza||5)+(e.comunicacion||5))/5
      return s+ea
    },0) / provEvals.length
    providers.update(evalForm.proveedor_id, { calificacion: Math.round(newAvg*10)/10, servicios_realizados: provEvals.length })
    setEvalModal(null)
  }

  const getProvEvals = (provId) => evaluaciones.data.filter(e=>e.proveedor_id===provId)

  return <div>
    <PageHeader title="Proveedores" subtitle={`${providers.data.length} proveedores registrados`}>
      <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5"/> Nuevo proveedor</Button>
    </PageHeader>

    <div className="space-y-2">
      {providers.data.map((p,i) => {
        const evals = getProvEvals(p.id)
        const isExpanded = expanded === p.id
        return <Card key={p.id} className="overflow-hidden" style={{animation:`slideUp 0.3s ease-out ${i*30}ms both`}}>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-700">{p.nombre}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{p.contacto} · {p.telefono}</p>
            </div>
            <div className="flex flex-wrap gap-1 max-w-[200px]">{(p.especialidades||[]).slice(0,3).map(e=><span key={e} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{e}</span>)}</div>
            <div className="text-center w-16"><RatingStars score={p.calificacion||0}/></div>
            <div className="text-center w-12"><p className="text-[12px] font-medium">{evals.length}</p><p className="text-[10px] text-slate-400">evals</p></div>
            <div className="text-right w-24"><p className="text-[12px] text-slate-600">{p.tarifa_promedio||'—'}</p></div>
            <div className="flex gap-1 shrink-0">
              <button onClick={()=>openEval(p.id)} className="p-1.5 hover:bg-amber-50 rounded-md" title="Evaluar"><Star className="w-3.5 h-3.5 text-amber-400"/></button>
              <button onClick={()=>setExpanded(isExpanded?null:p.id)} className="p-1.5 hover:bg-slate-100 rounded-md">{isExpanded?<ChevronUp className="w-3.5 h-3.5 text-slate-400"/>:<ChevronDown className="w-3.5 h-3.5 text-slate-400"/>}</button>
              <button onClick={()=>openEdit(p)} className="p-1.5 hover:bg-slate-100 rounded-md"><Pencil className="w-3.5 h-3.5 text-slate-400"/></button>
              <button onClick={()=>setDeleteId(p.id)} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
            </div>
          </div>
          {isExpanded&&<div className="border-t border-slate-100 bg-slate-50/30 px-5 py-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Información</p>
                <p className="text-[12px] text-slate-600">Email: {p.email||'—'}</p>
                <p className="text-[12px] text-slate-600">RFC: {p.rfc||'—'}</p>
                <p className="text-[12px] text-slate-600">Tiempo respuesta: {p.tiempo_respuesta||'—'}</p>
                {(p.certificaciones||[]).length>0&&<div className="flex gap-1 flex-wrap mt-2">{p.certificaciones.map(c=><span key={c} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">{c}</span>)}</div>}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Últimas evaluaciones</p>
                {evals.length===0?<p className="text-[12px] text-slate-400">Sin evaluaciones aún</p>:
                evals.slice(-5).reverse().map(ev=>{
                  const avg=((ev.calidad||0)+(ev.puntualidad||0)+(ev.precio||0)+(ev.limpieza||0)+(ev.comunicacion||0))/5
                  return <div key={ev.id} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-[10px] text-slate-400 w-16">{fmtDate(ev.fecha)}</span>
                    <span className="text-amber-400 text-[11px]">{'★'.repeat(Math.round(avg))}<span className="text-slate-200">{'★'.repeat(5-Math.round(avg))}</span></span>
                    <span className="text-[11px] font-medium text-slate-600">{avg.toFixed(1)}</span>
                    {ev.comentario&&<span className="text-[10px] text-slate-400 truncate flex-1">— {ev.comentario}</span>}
                  </div>
                })}
              </div>
            </div>
          </div>}
        </Card>
      })}
      {providers.data.length===0&&<Card className="p-16 text-center text-slate-400">No hay proveedores</Card>}
    </div>

    {/* Provider form */}
    <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editId?'Editar proveedor':'Nuevo proveedor'} width="max-w-3xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre *" value={form.nombre} onChange={e=>setF('nombre',e.target.value)}/>
          <Input label="RFC" value={form.rfc} onChange={e=>setF('rfc',e.target.value.toUpperCase())}/>
          <Input label="Contacto" value={form.contacto} onChange={e=>setF('contacto',e.target.value)}/>
          <Input label="Teléfono" value={form.telefono} onChange={e=>setF('telefono',e.target.value)}/>
          <Input label="Email" value={form.email} onChange={e=>setF('email',e.target.value)}/>
          <Input label="Tarifa promedio" placeholder="$2,400/visita" value={form.tarifa_promedio} onChange={e=>setF('tarifa_promedio',e.target.value)}/>
          <Input label="Tiempo de respuesta" placeholder="< 4 hrs" value={form.tiempo_respuesta} onChange={e=>setF('tiempo_respuesta',e.target.value)}/>
        </div>
        <div>
          <p className="text-[12px] font-medium text-slate-600 mb-1">Especialidades</p>
          <div className="flex gap-2 mb-2"><input className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px]" placeholder="Agregar..." value={espInput} onChange={e=>setEspInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addEsp())}/><Button size="sm" onClick={addEsp}>+</Button></div>
          <div className="flex flex-wrap gap-1">{(form.especialidades||[]).map((e,i)=><span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">{e}<button onClick={()=>removeEsp(i)} className="text-slate-400 hover:text-red-500">×</button></span>)}</div>
        </div>
        <div>
          <p className="text-[12px] font-medium text-slate-600 mb-1">Certificaciones</p>
          <div className="flex gap-2 mb-2"><input className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px]" placeholder="Agregar..." value={certInput} onChange={e=>setCertInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addCert())}/><Button size="sm" onClick={addCert}>+</Button></div>
          <div className="flex flex-wrap gap-1">{(form.certificaciones||[]).map((c,i)=><span key={i} className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">{c}<button onClick={()=>removeCert(i)} className="text-emerald-400 hover:text-red-500">×</button></span>)}</div>
        </div>
        <Textarea label="Notas" value={form.notas} onChange={e=>setF('notas',e.target.value)}/>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={()=>setModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>{editId?'Guardar':'Crear'}</Button></div>
      </div>
    </Modal>

    {/* Evaluation form */}
    <Modal open={evalModal==='form'} onClose={()=>setEvalModal(null)} title="Evaluar proveedor">
      <div className="space-y-4">
        <p className="text-[12px] text-slate-500">Califica al proveedor en cada categoría (1-5 estrellas). El promedio se calcula automáticamente.</p>
        <div className="grid grid-cols-2 gap-4">
          <StarInput label="Calidad del trabajo" value={evalForm.calidad} onChange={v=>setEvalForm(p=>({...p,calidad:v}))}/>
          <StarInput label="Puntualidad" value={evalForm.puntualidad} onChange={v=>setEvalForm(p=>({...p,puntualidad:v}))}/>
          <StarInput label="Precio justo" value={evalForm.precio} onChange={v=>setEvalForm(p=>({...p,precio:v}))}/>
          <StarInput label="Limpieza al terminar" value={evalForm.limpieza} onChange={v=>setEvalForm(p=>({...p,limpieza:v}))}/>
          <StarInput label="Comunicación" value={evalForm.comunicacion} onChange={v=>setEvalForm(p=>({...p,comunicacion:v}))}/>
          <div>
            <p className="text-[12px] font-medium text-slate-600 mb-1">Promedio</p>
            <p className="text-2xl font-semibold text-amber-500">{((evalForm.calidad+evalForm.puntualidad+evalForm.precio+evalForm.limpieza+evalForm.comunicacion)/5).toFixed(1)} ★</p>
          </div>
        </div>
        <Input label="Fecha" type="date" value={evalForm.fecha} onChange={e=>setEvalForm(p=>({...p,fecha:e.target.value}))}/>
        <Textarea label="Comentarios" value={evalForm.comentario} onChange={e=>setEvalForm(p=>({...p,comentario:e.target.value}))} placeholder="¿Cómo fue el servicio?"/>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={()=>setEvalModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSaveEval}>Guardar evaluación</Button></div>
      </div>
    </Modal>

    <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>providers.remove(deleteId)} title="Eliminar proveedor" message="¿Eliminar?"/>
  </div>
}
