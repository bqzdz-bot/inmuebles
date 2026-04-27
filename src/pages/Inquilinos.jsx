import { useState } from 'react'
import { useData } from '../data/DataContext'
import { PageHeader, Card, Button, Badge, Modal, Input, Select, Textarea, ConfirmDialog } from '../components/UI'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'

const EMPTY = { nombre: '', rfc: '', tipo_persona: 'moral', contacto: '', telefono: '', email: '', propiedad_id: '', notas: '' }

export default function Inquilinos() {
  const { tenants, properties } = useData()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openNew = () => { setForm(EMPTY); setEditId(null); setModal('form') }
  const openEdit = (t) => { setForm({ ...t }); setEditId(t.id); setModal('form') }
  const closeModal = () => setModal(null)
  const handleSave = () => {
    if (!form.nombre || !form.rfc) return alert('Nombre y RFC son requeridos')
    if (editId) tenants.update(editId, form); else tenants.add(form)
    closeModal()
  }

  return (
    <div>
      <PageHeader title="Inquilinos" subtitle={`${tenants.data.length} inquilinos registrados`}>
        <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5" /> Nuevo inquilino</Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50/80">
            <tr>
              {['Inquilino', 'RFC', 'Tipo', 'Contacto', 'Propiedad', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-slate-400 text-[10px] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.data.map((t, i) => {
              const prop = properties.data.find(p => p.id === t.propiedad_id)
              return (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/50 group" style={{ animation: `slideUp 0.3s ease-out ${i*30}ms both` }}>
                  <td className="px-4 py-3"><p className="font-medium text-slate-700">{t.nombre}</p>{t.email && <p className="text-[10px] text-slate-400 mt-0.5">{t.email}</p>}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{t.rfc}</td>
                  <td className="px-4 py-3"><Badge variant={t.tipo_persona === 'moral' ? 'default' : 'gray'}>{t.tipo_persona === 'moral' ? 'Moral' : 'Física'}</Badge></td>
                  <td className="px-4 py-3"><p className="text-slate-600">{t.contacto}</p><p className="text-[10px] text-slate-400">{t.telefono}</p></td>
                  <td className="px-4 py-3">{prop ? <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{prop.clave}</span> : <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-slate-100 rounded-md"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {tenants.data.length === 0 && <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-400">No hay inquilinos registrados</td></tr>}
          </tbody>
        </table>
      </Card>

      <Modal open={modal === 'form'} onClose={closeModal} title={editId ? 'Editar inquilino' : 'Nuevo inquilino'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo de persona" value={form.tipo_persona} onChange={e => setF('tipo_persona', e.target.value)}>
              <option value="moral">Persona moral (empresa)</option>
              <option value="fisica">Persona física</option>
            </Select>
            <Input label="RFC *" placeholder="LSO180312A92" value={form.rfc} onChange={e => setF('rfc', e.target.value.toUpperCase())} />
            <Input label={form.tipo_persona === 'moral' ? 'Razón social *' : 'Nombre completo *'} className="col-span-2" value={form.nombre} onChange={e => setF('nombre', e.target.value)} />
            <Input label="Contacto principal" value={form.contacto} onChange={e => setF('contacto', e.target.value)} />
            <Input label="Teléfono" value={form.telefono} onChange={e => setF('telefono', e.target.value)} />
            <Input label="Email" type="email" value={form.email} onChange={e => setF('email', e.target.value)} />
            <Select label="Propiedad asignada" value={form.propiedad_id} onChange={e => setF('propiedad_id', e.target.value)}>
              <option value="">Sin asignar</option>
              {properties.data.map(p => <option key={p.id} value={p.id}>{p.clave} — {p.nombre}</option>)}
            </Select>
          </div>
          <Textarea label="Notas" value={form.notas} onChange={e => setF('notas', e.target.value)} />
          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave}>{editId ? 'Guardar' : 'Crear inquilino'}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => tenants.remove(deleteId)} title="Eliminar inquilino" message="¿Eliminar este inquilino?" />
    </div>
  )
}
