import { useState } from 'react'
import { useData } from '../data/DataContext'
import { fmt, fmtDate } from '../data/store'
import { PageHeader, Card, KPI, Badge, Button, Modal, Input, Select, ConfirmDialog } from '../components/UI'
import { Plus, Download, Pencil, Trash2 } from 'lucide-react'

const statusMap = { pagado: ['Pagado', 'green'], vencido: ['Vencido', 'red'], pendiente: ['Pendiente', 'amber'] }
const EMPTY = { propiedad_id: '', inquilino_id: '', renta: '', moneda: 'MXN', fecha_vencimiento: '', fecha_pago: '', estatus: 'pendiente', cfdi_folio: '' }

export default function Cobranza() {
  const { collections, properties, tenants } = useData()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const pagados = collections.data.filter(c => c.estatus === 'pagado')
  const totalRenta = collections.data.reduce((s, c) => s + Number(c.renta || 0), 0)
  const totalCobrado = pagados.reduce((s, c) => s + Number(c.renta || 0), 0)
  const vencidos = collections.data.filter(c => c.estatus === 'vencido')

  const openNew = () => { setForm(EMPTY); setEditId(null); setModal('form') }
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setModal('form') }
  const handleSave = () => {
    if (!form.propiedad_id) return alert('Propiedad es requerida')
    if (editId) collections.update(editId, form); else collections.add(form)
    setModal(null)
  }

  return (
    <div>
      <PageHeader title="Cobranza" subtitle="Febrero 2026">
        <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5" /> Nuevo registro</Button>
      </PageHeader>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KPI label="Por cobrar mes" value={fmt(totalRenta)} sub={`${collections.data.length} registros`} />
        <KPI label="Cobrado" value={fmt(totalCobrado)} sub={totalRenta > 0 ? `${Math.round(totalCobrado/totalRenta*100)}% al día` : '—'} subColor="text-emerald-500" />
        <KPI label="Vencido" value={fmt(vencidos.reduce((s,c) => s+Number(c.renta||0), 0))} sub={`${vencidos.length} pendiente(s)`} subColor={vencidos.length > 0 ? 'text-red-500' : 'text-slate-400'} />
        <KPI label="Comisión generada" value={fmt(totalCobrado * 0.089)} sub="8.9% promedio" />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50/80">
            <tr>{['Propiedad', 'Inquilino', 'Renta', 'Vencimiento', 'Fecha pago', 'Estatus', 'CFDI', ''].map(h => <th key={h} className={`${h==='Renta'?'text-right':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase tracking-wider`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {collections.data.map((c, i) => {
              const prop = properties.data.find(p => p.id === c.propiedad_id)
              const inq = tenants.data.find(t => t.id === c.inquilino_id)
              const [sl, sv] = statusMap[c.estatus] || [c.estatus, 'gray']
              return (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/50 group" style={{ animation: `slideUp 0.3s ease-out ${i*30}ms both` }}>
                  <td className="px-4 py-3">{prop ? <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{prop.clave}</span> : '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{inq?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(c.renta)} <span className="text-[10px] text-slate-400">{c.moneda}</span></td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(c.fecha_vencimiento)}</td>
                  <td className="px-4 py-3 text-slate-500">{c.fecha_pago ? fmtDate(c.fecha_pago) : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={sv}>{c.estatus === 'pagado' && '✓ '}{sl}</Badge></td>
                  <td className="px-4 py-3">{c.cfdi_folio ? <><Badge variant="default">Emitido</Badge><p className="text-[9px] text-slate-400 mt-0.5 font-mono">{c.cfdi_folio}</p></> : <Badge variant="gray">Pendiente</Badge>}</td>
                  <td className="px-4 py-3"><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEdit(c)} className="p-1.5 hover:bg-slate-100 rounded-md"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button><button onClick={() => setDeleteId(c.id)} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></div></td>
                </tr>
              )
            })}
            {collections.data.length === 0 && <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-400">No hay registros de cobranza</td></tr>}
          </tbody>
        </table>
      </Card>
      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Editar registro' : 'Nuevo registro de cobranza'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Propiedad *" value={form.propiedad_id} onChange={e => setF('propiedad_id', e.target.value)}><option value="">Seleccionar...</option>{properties.data.map(p => <option key={p.id} value={p.id}>{p.clave} — {p.nombre}</option>)}</Select>
            <Select label="Inquilino" value={form.inquilino_id} onChange={e => setF('inquilino_id', e.target.value)}><option value="">Seleccionar...</option>{tenants.data.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}</Select>
            <Input label="Renta" type="number" value={form.renta} onChange={e => setF('renta', e.target.value)} />
            <Select label="Moneda" value={form.moneda} onChange={e => setF('moneda', e.target.value)}><option value="MXN">MXN</option><option value="USD">USD</option></Select>
            <Input label="Fecha vencimiento" type="date" value={form.fecha_vencimiento} onChange={e => setF('fecha_vencimiento', e.target.value)} />
            <Input label="Fecha pago" type="date" value={form.fecha_pago} onChange={e => setF('fecha_pago', e.target.value)} />
            <Select label="Estatus" value={form.estatus} onChange={e => setF('estatus', e.target.value)}><option value="pendiente">Pendiente</option><option value="pagado">Pagado</option><option value="vencido">Vencido</option></Select>
            <Input label="Folio CFDI" placeholder="2026-XXX" value={form.cfdi_folio} onChange={e => setF('cfdi_folio', e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>{editId ? 'Guardar' : 'Registrar'}</Button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => collections.remove(deleteId)} title="Eliminar registro" message="¿Eliminar este registro de cobranza?" />
    </div>
  )
}
