import { useState } from 'react'
import { useData } from '../data/DataContext'
import { fmt } from '../data/store'
import { PageHeader, Card, Button, Badge, Modal, Input, Select, Textarea, ConfirmDialog, KPI } from '../components/UI'
import { Plus, Pencil, Trash2, Briefcase, Building2, ChevronRight, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const EMPTY = { nombre:'', rfc:'', tipo_persona:'moral', representante:'', telefono:'', email:'', notas:'' }

export default function Empresas() {
  const { groups, properties, documents } = useData()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const setF = (k,v) => setForm(p=>({...p,[k]:v}))

  const openNew = () => { setForm(EMPTY); setEditId(null); setModal('form') }
  const openEdit = (g) => { setForm({...g}); setEditId(g.id); setModal('form') }
  const handleSave = () => {
    if(!form.nombre) return alert('Nombre es requerido')
    editId ? groups.update(editId,form) : groups.add(form)
    setModal(null)
  }

  const handleAddDoc = async (grupoId, file) => {
    const reader = new FileReader()
    reader.onload = () => {
      documents.add({
        propiedad_id: null,
        tipo_doc: 'otro',
        nombre: file.name,
        descripcion: `Documento de empresa · ${file.name}`,
        fecha: new Date().toISOString().slice(0,10),
        grupo_id: grupoId
      })
    }
    reader.readAsDataURL(file)
  }

  return <div>
    <PageHeader title="Empresas" subtitle="Entidades propietarias de activos">
      <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5"/> Nueva empresa</Button>
    </PageHeader>

    <div className="grid grid-cols-3 gap-3 mb-5">
      <KPI label="Empresas registradas" value={groups.data.length} sub="propietarios activos" />
      <KPI label="Total propiedades" value={properties.data.length} sub="en todos los grupos" />
      <KPI label="Renta total" value={fmt(properties.data.filter(p=>p.estatus==='rentada').reduce((s,p)=>s+Number(p.renta),0))} sub="mensual administrada" />
    </div>

    <div className="grid grid-cols-1 gap-3">
      {groups.data.map((g, i) => {
        const gProps = properties.data.filter(p=>p.grupo_id===g.id)
        const gRentadas = gProps.filter(p=>p.estatus==='rentada')
        const gRenta = gRentadas.reduce((s,p)=>s+Number(p.renta),0)
        const gValor = gProps.reduce((s,p)=>s+Number(p.valor_comercial||0),0)
        return <Card key={g.id} className="overflow-hidden" style={{animation:`slideUp 0.3s ease-out ${i*40}ms both`}}>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><Briefcase className="w-5 h-5"/></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-slate-800 truncate">{g.nombre}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {g.rfc && <span>{g.rfc} · </span>}
                {g.tipo_persona==='moral'?'Persona moral':'Persona física'}
                {g.representante && ` · ${g.representante}`}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center shrink-0">
              <div><p className="text-lg font-semibold text-slate-800">{gProps.length}</p><p className="text-[10px] text-slate-400">Propiedades</p></div>
              <div><p className="text-lg font-semibold text-slate-800">{fmt(gRenta)}</p><p className="text-[10px] text-slate-400">Renta/mes</p></div>
              <div><p className="text-lg font-semibold text-slate-800">{fmt(gValor)}</p><p className="text-[10px] text-slate-400">Valor</p></div>
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
      {groups.data.length===0&&<Card className="p-16 text-center text-slate-400">No hay empresas — crea la primera</Card>}
    </div>

    <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editId?'Editar empresa':'Nueva empresa'}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo de persona" value={form.tipo_persona} onChange={e=>setF('tipo_persona',e.target.value)}>
            <option value="moral">Persona moral (empresa)</option>
            <option value="fisica">Persona física</option>
          </Select>
          <Input label="RFC" placeholder="Opcional" value={form.rfc} onChange={e=>setF('rfc',e.target.value.toUpperCase())} />
          <Input label="Nombre / Razón social *" className="col-span-2" value={form.nombre} onChange={e=>setF('nombre',e.target.value)} />
          <Input label="Representante legal" value={form.representante} onChange={e=>setF('representante',e.target.value)} />
          <Input label="Teléfono" value={form.telefono} onChange={e=>setF('telefono',e.target.value)} />
          <Input label="Email" type="email" className="col-span-2" value={form.email} onChange={e=>setF('email',e.target.value)} />
        </div>

        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Documentos de la empresa</p>
          <p className="text-[11px] text-slate-400 mb-2">Acta constitutiva, poderes, identificaciones, etc.</p>
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-[12px] text-slate-500">Seleccionar archivo para adjuntar</span>
            <input type="file" className="hidden" onChange={e => {
              if (e.target.files?.[0] && editId) handleAddDoc(editId, e.target.files[0])
              else if (e.target.files?.[0] && !editId) alert('Guarda la empresa primero, después podrás adjuntar documentos')
              e.target.value = ''
            }} />
          </label>
        </div>

        <Textarea label="Notas" value={form.notas} onChange={e=>setF('notas',e.target.value)} />
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={()=>setModal(null)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>{editId?'Guardar':'Crear empresa'}</Button>
        </div>
      </div>
    </Modal>
    <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>groups.remove(deleteId)} title="Eliminar empresa" message="¿Eliminar esta empresa?" />
  </div>
}
