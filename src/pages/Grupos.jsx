import { useState } from 'react'
import { useData } from '../data/DataContext'
import { fmt } from '../data/store'
import { PageHeader, Card, Button, Badge, Modal, Input, Select, Textarea, ConfirmDialog, KPI } from '../components/UI'
import { Plus, Pencil, Trash2, Layers, Building2, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const EMPTY = { nombre:'', rfc:'', tipo_persona:'moral', representante:'', telefono:'', email:'', plan:'estandar', notas:'' }

export default function Grupos() {
  const { groups, properties } = useData()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const setF = (k,v) => setForm(p=>({...p,[k]:v}))

  const openNew = () => { setForm(EMPTY); setEditId(null); setModal('form') }
  const openEdit = (g) => { setForm({...g}); setEditId(g.id); setModal('form') }
  const handleSave = () => { if(!form.nombre||!form.rfc) return alert('Nombre y RFC son requeridos'); editId ? groups.update(editId,form) : groups.add(form); setModal(null) }

  const totalProps = properties.data.length
  const totalRenta = properties.data.filter(p=>p.estatus==='rentada').reduce((s,p)=>s+Number(p.renta),0)

  return <div>
    <PageHeader title="Grupos / Propietarios" subtitle="Agrupaciones por entidad propietaria">
      <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5"/> Nuevo grupo</Button>
    </PageHeader>

    <div className="grid grid-cols-3 gap-3 mb-5">
      <KPI label="Grupos activos" value={groups.data.length} sub="propietarios registrados" />
      <KPI label="Total propiedades" value={totalProps} sub="en todos los grupos" />
      <KPI label="Renta total" value={fmt(totalRenta)} sub="mensual administrada" />
    </div>

    <div className="grid grid-cols-1 gap-3">
      {groups.data.map((g, i) => {
        const gProps = properties.data.filter(p=>p.grupo_id===g.id)
        const gRentadas = gProps.filter(p=>p.estatus==='rentada')
        const gRenta = gRentadas.reduce((s,p)=>s+Number(p.renta),0)
        const gValor = gProps.reduce((s,p)=>s+Number(p.valor_comercial||0),0)
        return <Card key={g.id} className="overflow-hidden" style={{animation:`slideUp 0.3s ease-out ${i*40}ms both`}}>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><Layers className="w-5 h-5"/></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><h3 className="text-[14px] font-semibold text-slate-800 truncate">{g.nombre}</h3><Badge variant={g.plan==='premium'?'purple':g.plan==='estandar'?'default':'gray'}>{g.plan}</Badge></div>
              <p className="text-[11px] text-slate-400 mt-0.5">{g.rfc} · {g.tipo_persona==='moral'?'Persona moral':'Persona física'}{g.representante?` · ${g.representante}`:''}</p>
            </div>
            <div className="grid grid-cols-4 gap-6 text-center shrink-0">
              <div><p className="text-lg font-semibold text-slate-800">{gProps.length}</p><p className="text-[10px] text-slate-400">Propiedades</p></div>
              <div><p className="text-lg font-semibold text-emerald-600">{gRentadas.length}</p><p className="text-[10px] text-slate-400">Rentadas</p></div>
              <div><p className="text-lg font-semibold text-slate-800">{fmt(gRenta)}</p><p className="text-[10px] text-slate-400">Renta/mes</p></div>
              <div><p className="text-lg font-semibold text-slate-800">{fmt(gValor)}</p><p className="text-[10px] text-slate-400">Valor portafolio</p></div>
            </div>
            <div className="flex gap-1 ml-2 shrink-0">
              <button onClick={()=>openEdit(g)} className="p-2 hover:bg-slate-100 rounded-lg"><Pencil className="w-3.5 h-3.5 text-slate-400"/></button>
              <button onClick={()=>setDeleteId(g.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
            </div>
          </div>
          {gProps.length > 0 && <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2">
            <div className="flex gap-2 flex-wrap">
              {gProps.map(p => <Link key={p.id} to={`/propiedades/${p.id}`} className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-blue-600 bg-white px-2 py-1 rounded-md border border-slate-100 hover:border-blue-200 transition-all">
                <Building2 className="w-3 h-3"/>{p.clave}<ChevronRight className="w-3 h-3"/>
              </Link>)}
            </div>
          </div>}
        </Card>
      })}
      {groups.data.length===0&&<Card className="p-16 text-center text-slate-400">No hay grupos — crea el primero</Card>}
    </div>

    <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editId?'Editar grupo':'Nuevo grupo / propietario'}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo de persona" value={form.tipo_persona} onChange={e=>setF('tipo_persona',e.target.value)}><option value="moral">Persona moral (empresa)</option><option value="fisica">Persona física</option></Select>
          <Select label="Plan de servicio" value={form.plan} onChange={e=>setF('plan',e.target.value)}><option value="basico">Básico (6.5%)</option><option value="estandar">Estándar (9%)</option><option value="premium">Premium (13.5%)</option></Select>
          <Input label="Nombre / Razón social *" className="col-span-2" value={form.nombre} onChange={e=>setF('nombre',e.target.value)} />
          <Input label="RFC *" value={form.rfc} onChange={e=>setF('rfc',e.target.value.toUpperCase())} />
          <Input label="Representante legal" value={form.representante} onChange={e=>setF('representante',e.target.value)} />
          <Input label="Teléfono" value={form.telefono} onChange={e=>setF('telefono',e.target.value)} />
          <Input label="Email" type="email" value={form.email} onChange={e=>setF('email',e.target.value)} />
        </div>
        <Textarea label="Notas" value={form.notas} onChange={e=>setF('notas',e.target.value)} />
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={()=>setModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>{editId?'Guardar':'Crear grupo'}</Button></div>
      </div>
    </Modal>
    <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>groups.remove(deleteId)} title="Eliminar grupo" message="¿Eliminar este grupo y desasociar sus propiedades?" />
  </div>
}
