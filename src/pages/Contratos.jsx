import { useState } from 'react'
import { useData } from '../data/DataContext'
import { fmt, fmtDate } from '../data/store'
import { PageHeader, Card, Button, Badge, FilterChip, Modal, Input, Select, Textarea, ConfirmDialog } from '../components/UI'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'

const statusMap = { vigente:['Vigente','green'], por_vencer:['Por vencer','amber'], moroso:['Moroso','red'], vencido:['Vencido','red'], finalizado:['Finalizado','gray'] }
const tipoMap = { NNN:'default', Bruto:'amber', 'Modificado neto':'purple' }

export default function Contratos() {
  const { contracts, properties, tenants, documents } = useData()
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ propiedad_id:'', inquilino_id:'', tipo_contrato:'NNN', renta:'', moneda:'MXN', inicio:'', fin:'', escalacion:'INPC anual', deposito:'', estatus:'vigente', notas:'' })
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const setF = (k,v) => setForm(p=>({...p,[k]:v}))

  const enriched = contracts.data.map(c => ({
    ...c,
    prop: properties.data.find(p=>p.id===c.propiedad_id),
    inq: tenants.data.find(t=>t.id===c.inquilino_id)
  }))
  const filtered = filter === 'all' ? enriched : enriched.filter(c => c.estatus === filter)

  // ── Auto-update property status based on contracts ──
  const updatePropertyStatus = (propiedadId, contratoEstatus) => {
    if (!propiedadId) return
    const activeStatuses = ['vigente', 'por_vencer', 'moroso']

    if (activeStatuses.includes(contratoEstatus)) {
      // Contract is active → property is rented
      properties.update(propiedadId, { estatus: 'rentada' })
    } else {
      // Check if there are other active contracts for this property
      const otherActive = contracts.data.find(c =>
        c.propiedad_id === propiedadId &&
        c.id !== editId &&
        activeStatuses.includes(c.estatus)
      )
      if (!otherActive) {
        properties.update(propiedadId, { estatus: 'vacante' })
      }
    }
  }

  const openNew = () => {
    setForm({ propiedad_id:'', inquilino_id:'', tipo_contrato:'NNN', renta:'', moneda:'MXN', inicio:'', fin:'', escalacion:'INPC anual', deposito:'', estatus:'vigente', notas:'' })
    setEditId(null)
    setModal('form')
  }

  const openEdit = (c) => {
    setForm({...c})
    setEditId(c.id)
    setModal('form')
  }

  const handleSave = () => {
    if (!form.propiedad_id || !form.inquilino_id) return alert('Propiedad e inquilino son requeridos')

    if (editId) {
      contracts.update(editId, form)
    } else {
      contracts.add(form)
    }

    // Auto-update property status
    updatePropertyStatus(form.propiedad_id, form.estatus)

    // Auto-link tenant to property
    if (form.inquilino_id && form.propiedad_id && ['vigente','por_vencer'].includes(form.estatus)) {
      tenants.update(form.inquilino_id, { propiedad_id: form.propiedad_id })
    }

    setModal(null)
  }

  const handleDelete = (contractId) => {
    const contract = contracts.data.find(c => c.id === contractId)
    contracts.remove(contractId)

    // Check if property should revert to vacante
    if (contract?.propiedad_id) {
      const remaining = contracts.data.find(c =>
        c.id !== contractId &&
        c.propiedad_id === contract.propiedad_id &&
        ['vigente','por_vencer','moroso'].includes(c.estatus)
      )
      if (!remaining) {
        properties.update(contract.propiedad_id, { estatus: 'vacante' })
      }
    }
  }

  const handleAttachDoc = (file) => {
    if (!editId) return alert('Guarda el contrato primero')
    const contract = contracts.data.find(c=>c.id===editId)
    documents.add({
      propiedad_id: contract?.propiedad_id || null,
      tipo_doc: 'contrato',
      nombre: file.name,
      descripcion: `Contrato PDF · ${file.name}`,
      fecha: new Date().toISOString().slice(0,10)
    })
  }

  return <div>
    <PageHeader title="Contratos" subtitle={`${contracts.data.length} contratos registrados`}>
      <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5"/> Nuevo contrato</Button>
    </PageHeader>

    <Card className="mb-4">
      <div className="px-4 py-3 flex gap-1.5 flex-wrap">
        {[
          ['all', `Todos (${contracts.data.length})`],
          ['vigente', `Vigentes (${contracts.data.filter(c=>c.estatus==='vigente').length})`],
          ['por_vencer', `Por vencer (${contracts.data.filter(c=>c.estatus==='por_vencer').length})`],
          ['moroso', `Morosos (${contracts.data.filter(c=>c.estatus==='moroso').length})`],
          ['finalizado', `Históricos (${contracts.data.filter(c=>c.estatus==='finalizado').length})`],
        ].map(([k,l]) =>
          <FilterChip key={k} active={filter===k} onClick={()=>setFilter(k)}>{l}</FilterChip>
        )}
      </div>
    </Card>

    <Card className="overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-slate-50/80">
          <tr>{['Propiedad','Inquilino','Modalidad','Renta','Inicio','Vencimiento','Escalación','Estatus',''].map(h =>
            <th key={h} className={`${h==='Renta'?'text-right':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase tracking-wider`}>{h}</th>
          )}</tr>
        </thead>
        <tbody>
          {filtered.map((c,i) => {
            const [sl,sv] = statusMap[c.estatus] || [c.estatus,'gray']
            return <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/50 group" style={{animation:`slideUp 0.3s ease-out ${i*30}ms both`}}>
              <td className="px-4 py-3">
                <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{c.prop?.clave||'—'}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.prop?.nombre}</p>
              </td>
              <td className="px-4 py-3 font-medium text-slate-700">{c.inq?.nombre||'—'}</td>
              <td className="px-4 py-3"><Badge variant={tipoMap[c.tipo_contrato]||'gray'}>{c.tipo_contrato}</Badge></td>
              <td className="px-4 py-3 text-right font-medium">{fmt(c.renta)} <span className="text-[10px] text-slate-400">{c.moneda}</span></td>
              <td className="px-4 py-3 text-slate-500">{fmtDate(c.inicio)}</td>
              <td className="px-4 py-3 text-slate-500">{fmtDate(c.fin)}</td>
              <td className="px-4 py-3 text-slate-500">{c.escalacion}</td>
              <td className="px-4 py-3"><Badge variant={sv}>{sl}</Badge></td>
              <td className="px-4 py-3">
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>openEdit(c)} className="p-1.5 hover:bg-slate-100 rounded-md"><Pencil className="w-3.5 h-3.5 text-slate-400"/></button>
                  <button onClick={()=>setDeleteId(c.id)} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
                </div>
              </td>
            </tr>
          })}
          {filtered.length===0&&<tr><td colSpan={9} className="px-4 py-16 text-center text-slate-400">No hay contratos</td></tr>}
        </tbody>
      </table>
    </Card>

    <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editId?'Editar contrato':'Nuevo contrato'}>
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg text-[11px] text-blue-700">
          Al guardar un contrato vigente, la propiedad se marca automáticamente como "Rentada" y el inquilino se vincula a la propiedad.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Propiedad *" value={form.propiedad_id} onChange={e=>setF('propiedad_id',e.target.value)}>
            <option value="">Seleccionar...</option>
            {properties.data.map(p=><option key={p.id} value={p.id}>{p.clave} — {p.nombre}</option>)}
          </Select>
          <Select label="Inquilino *" value={form.inquilino_id} onChange={e=>setF('inquilino_id',e.target.value)}>
            <option value="">Seleccionar...</option>
            {tenants.data.map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Select>
          <Select label="Modalidad" value={form.tipo_contrato} onChange={e=>setF('tipo_contrato',e.target.value)}>
            <option value="NNN">Triple Net (NNN)</option>
            <option value="Bruto">Bruto</option>
            <option value="Modificado neto">Modificado neto</option>
          </Select>
          <Select label="Estatus" value={form.estatus} onChange={e=>setF('estatus',e.target.value)}>
            <option value="vigente">Vigente</option>
            <option value="por_vencer">Por vencer</option>
            <option value="moroso">Moroso</option>
            <option value="vencido">Vencido</option>
            <option value="finalizado">Finalizado</option>
          </Select>
          <Input label="Renta mensual" type="number" value={form.renta} onChange={e=>setF('renta',e.target.value)}/>
          <Select label="Moneda" value={form.moneda} onChange={e=>setF('moneda',e.target.value)}>
            <option value="MXN">MXN</option><option value="USD">USD</option>
          </Select>
          <Input label="Fecha inicio" type="date" value={form.inicio} onChange={e=>setF('inicio',e.target.value)}/>
          <Input label="Fecha vencimiento" type="date" value={form.fin} onChange={e=>setF('fin',e.target.value)}/>
          <Input label="Escalación" placeholder="INPC anual" value={form.escalacion} onChange={e=>setF('escalacion',e.target.value)}/>
          <Input label="Depósito en garantía" type="number" value={form.deposito} onChange={e=>setF('deposito',e.target.value)}/>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Adjuntar contrato (PDF)</p>
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
            <FileText className="w-4 h-4 text-slate-400"/>
            <span className="text-[12px] text-slate-500">Seleccionar archivo PDF del contrato</span>
            <input type="file" accept=".pdf" className="hidden" onChange={e=>{
              if(e.target.files?.[0]) handleAttachDoc(e.target.files[0])
              e.target.value=''
            }}/>
          </label>
        </div>

        <Textarea label="Notas" value={form.notas} onChange={e=>setF('notas',e.target.value)}/>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={()=>setModal(null)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>{editId?'Guardar':'Crear contrato'}</Button>
        </div>
      </div>
    </Modal>

    <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>handleDelete(deleteId)} title="Eliminar contrato" message="Si este es el único contrato activo, la propiedad volverá a estatus Vacante. ¿Continuar?"/>
  </div>
}
