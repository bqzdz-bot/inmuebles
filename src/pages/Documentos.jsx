import { useState } from 'react'
import { useData } from '../data/DataContext'
import { fmtDate } from '../data/store'
import { PageHeader, Card, Button, Badge, FilterChip, Modal, Input, Select, Textarea, ConfirmDialog } from '../components/UI'
import { Plus, Pencil, Trash2, FileText, FolderOpen } from 'lucide-react'

const tipoDocMap = { escritura: ['Escritura', 'default'], contrato: ['Contrato', 'green'], permiso: ['Permiso', 'amber'], cfdi: ['CFDI', 'purple'], poliza: ['Póliza', 'teal'], otro: ['Otro', 'gray'] }
const EMPTY = { propiedad_id: '', tipo_doc: 'escritura', nombre: '', descripcion: '', fecha: '' }

export default function Documentos() {
  const { documents, properties } = useData()
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const filtered = filter === 'all' ? documents.data : documents.data.filter(d => d.tipo_doc === filter)

  const openNew = () => { setForm(EMPTY); setEditId(null); setModal('form') }
  const openEdit = (d) => { setForm({ ...d }); setEditId(d.id); setModal('form') }
  const handleSave = () => {
    if (!form.nombre) return alert('Nombre es requerido')
    if (editId) documents.update(editId, form); else documents.add(form)
    setModal(null)
  }

  const tipoCounts = Object.keys(tipoDocMap).reduce((a, k) => { a[k] = documents.data.filter(d => d.tipo_doc === k).length; return a }, {})

  return (
    <div>
      <PageHeader title="Documentos" subtitle={`${documents.data.length} documentos en archivo`}>
        <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5" /> Subir documento</Button>
      </PageHeader>
      <Card className="mb-4">
        <div className="px-4 py-3 flex gap-1.5 flex-wrap">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>Todos ({documents.data.length})</FilterChip>
          {Object.entries(tipoDocMap).map(([k, [l]]) => tipoCounts[k] > 0 && <FilterChip key={k} active={filter === k} onClick={() => setFilter(k)}>{l} ({tipoCounts[k]})</FilterChip>)}
        </div>
      </Card>
      <Card>
        {filtered.map((d, i) => {
          const prop = properties.data.find(p => p.id === d.propiedad_id)
          const [tl, tv] = tipoDocMap[d.tipo_doc] || ['Otro', 'gray']
          return (
            <div key={d.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 group" style={{ animation: `slideUp 0.3s ease-out ${i*30}ms both` }}>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-700">{d.nombre}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{d.descripcion}{prop ? ` · ${prop.clave}` : ''}</p>
              </div>
              <Badge variant={tv}>{tl}</Badge>
              <span className="text-[11px] text-slate-400 w-20 text-right">{fmtDate(d.fecha)}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-slate-100 rounded-md"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                <button onClick={() => setDeleteId(d.id)} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="px-4 py-16 text-center text-slate-400 text-sm">No hay documentos</div>}
      </Card>
      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Editar documento' : 'Registrar documento'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre del documento *" className="col-span-2" value={form.nombre} onChange={e => setF('nombre', e.target.value)} placeholder="Ej: Escritura BOD-HMO-001" />
            <Select label="Tipo" value={form.tipo_doc} onChange={e => setF('tipo_doc', e.target.value)}>
              {Object.entries(tipoDocMap).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
            </Select>
            <Select label="Propiedad" value={form.propiedad_id} onChange={e => setF('propiedad_id', e.target.value)}>
              <option value="">General (sin propiedad)</option>
              {properties.data.map(p => <option key={p.id} value={p.id}>{p.clave} — {p.nombre}</option>)}
            </Select>
            <Input label="Fecha" type="date" value={form.fecha} onChange={e => setF('fecha', e.target.value)} />
          </div>
          <Textarea label="Descripción" value={form.descripcion} onChange={e => setF('descripcion', e.target.value)} placeholder="Notaría, volumen, observaciones..." />
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
            <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-[12px] text-slate-400">La carga de archivos estará disponible cuando se conecte el almacenamiento en la nube (Supabase Storage)</p>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>{editId ? 'Guardar' : 'Registrar'}</Button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => documents.remove(deleteId)} title="Eliminar documento" message="¿Eliminar este documento?" />
    </div>
  )
}
