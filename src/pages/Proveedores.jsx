import { useState } from 'react'
import { useData } from '../data/DataContext'
import { PageHeader, Card, Button, RatingStars, Modal, Input, Textarea, ConfirmDialog } from '../components/UI'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'

const EMPTY = { nombre: '', contacto: '', telefono: '', email: '', rfc: '', especialidades: [], certificaciones: [], calificacion: 4.5, servicios_realizados: 0, tarifa_promedio: '', tiempo_respuesta: '', notas: '' }

export default function Proveedores() {
  const { providers } = useData()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [espInput, setEspInput] = useState('')
  const [certInput, setCertInput] = useState('')
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openNew = () => { setForm(EMPTY); setEditId(null); setEspInput(''); setCertInput(''); setModal('form') }
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); setEspInput(''); setCertInput(''); setModal('form') }
  const handleSave = () => {
    if (!form.nombre) return alert('Nombre es requerido')
    if (editId) providers.update(editId, form); else providers.add(form)
    setModal(null)
  }

  const addEsp = () => { if (espInput.trim()) { setF('especialidades', [...(form.especialidades || []), espInput.trim()]); setEspInput('') } }
  const removeEsp = (i) => { setF('especialidades', (form.especialidades || []).filter((_, idx) => idx !== i)) }
  const addCert = () => { if (certInput.trim()) { setF('certificaciones', [...(form.certificaciones || []), certInput.trim()]); setCertInput('') } }
  const removeCert = (i) => { setF('certificaciones', (form.certificaciones || []).filter((_, idx) => idx !== i)) }

  return (
    <div>
      <PageHeader title="Proveedores" subtitle={`${providers.data.length} proveedores registrados`}>
        <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5" /> Nuevo proveedor</Button>
      </PageHeader>
      <Card className="overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50/80">
            <tr>{['Proveedor', 'Especialidades', 'Servicios', 'Calificación', 'Tarifa', 'Respuesta', 'Certificaciones', ''].map(h => <th key={h} className={`${h==='Servicios'?'text-center':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase tracking-wider`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {providers.data.map((p, i) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50 group" style={{ animation: `slideUp 0.3s ease-out ${i*30}ms both` }}>
                <td className="px-4 py-3"><p className="font-medium text-slate-700">{p.nombre}</p><p className="text-[10px] text-slate-400 mt-0.5">{p.contacto}</p></td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{(p.especialidades || []).map(e => <span key={e} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{e}</span>)}</div></td>
                <td className="px-4 py-3 text-center font-medium">{p.servicios_realizados || 0}</td>
                <td className="px-4 py-3"><RatingStars score={p.calificacion || 0} /></td>
                <td className="px-4 py-3 text-slate-600">{p.tarifa_promedio || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{p.tiempo_respuesta || '—'}</td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{(p.certificaciones || []).map(c => <span key={c} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">{c}</span>)}</div></td>
                <td className="px-4 py-3"><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEdit(p)} className="p-1.5 hover:bg-slate-100 rounded-md"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button><button onClick={() => setDeleteId(p.id)} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></div></td>
              </tr>
            ))}
            {providers.data.length === 0 && <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-400">No hay proveedores</td></tr>}
          </tbody>
        </table>
      </Card>
      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Editar proveedor' : 'Nuevo proveedor'} width="max-w-3xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre / Razón social *" value={form.nombre} onChange={e => setF('nombre', e.target.value)} />
            <Input label="RFC" value={form.rfc} onChange={e => setF('rfc', e.target.value.toUpperCase())} />
            <Input label="Contacto principal" value={form.contacto} onChange={e => setF('contacto', e.target.value)} />
            <Input label="Teléfono" value={form.telefono} onChange={e => setF('telefono', e.target.value)} />
            <Input label="Email" value={form.email} onChange={e => setF('email', e.target.value)} />
            <Input label="Tarifa promedio" placeholder="$2,400/visita" value={form.tarifa_promedio} onChange={e => setF('tarifa_promedio', e.target.value)} />
            <Input label="Tiempo de respuesta" placeholder="< 4 hrs" value={form.tiempo_respuesta} onChange={e => setF('tiempo_respuesta', e.target.value)} />
            <Input label="Calificación (1-5)" type="number" min="1" max="5" step="0.1" value={form.calificacion} onChange={e => setF('calificacion', e.target.value)} />
            <Input label="Servicios realizados" type="number" value={form.servicios_realizados} onChange={e => setF('servicios_realizados', e.target.value)} />
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-600 mb-1">Especialidades</p>
            <div className="flex gap-2 mb-2"><input className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="Agregar especialidad..." value={espInput} onChange={e => setEspInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEsp())} /><Button size="sm" onClick={addEsp}>Agregar</Button></div>
            <div className="flex flex-wrap gap-1">{(form.especialidades || []).map((e, i) => <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">{e}<button onClick={() => removeEsp(i)} className="text-slate-400 hover:text-red-500">×</button></span>)}</div>
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-600 mb-1">Certificaciones</p>
            <div className="flex gap-2 mb-2"><input className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="Agregar certificación..." value={certInput} onChange={e => setCertInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())} /><Button size="sm" onClick={addCert}>Agregar</Button></div>
            <div className="flex flex-wrap gap-1">{(form.certificaciones || []).map((c, i) => <span key={i} className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">{c}<button onClick={() => removeCert(i)} className="text-emerald-400 hover:text-red-500">×</button></span>)}</div>
          </div>
          <Textarea label="Notas" value={form.notas} onChange={e => setF('notas', e.target.value)} />
          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>{editId ? 'Guardar' : 'Crear proveedor'}</Button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => providers.remove(deleteId)} title="Eliminar proveedor" message="¿Eliminar este proveedor?" />
    </div>
  )
}
