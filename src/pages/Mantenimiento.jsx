import { useState } from 'react'
import { useData } from '../data/DataContext'
import { fmt, fmtDate } from '../data/store'
import { PageHeader, Card, KPI, Badge, Button, FilterChip, Modal, Input, Select, Textarea, Checkbox, ConfirmDialog } from '../components/UI'
import { Plus, Pencil, Trash2, Calendar, RefreshCw } from 'lucide-react'

const prioMap = { urgente:['Urgente','red'], programada:['Programada','amber'], normal:['Normal','default'] }
const statusMap = { en_proceso:['En proceso','default'], programada:['Programada','amber'], completada:['Completada','green'] }
const EMPTY = { propiedad_id:'', titulo:'', tipo:'correctivo', prioridad:'normal', proveedor:'', costo:'', estatus:'en_proceso', fecha_reporte:new Date().toISOString().slice(0,10), fecha_prog:'', descripcion:'', es_recurrente:false, frecuencia:'', prox_ejecucion:'' }

export default function Mantenimiento() {
  const { maintenance, properties, providers } = useData()
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const setF = (k,v) => setForm(p=>({...p,[k]:v}))

  const abiertas = maintenance.data.filter(m=>m.estatus!=='completada')
  const urgentes = maintenance.data.filter(m=>m.prioridad==='urgente'&&m.estatus!=='completada')
  const recurrentes = maintenance.data.filter(m=>m.es_recurrente)
  const costoMes = maintenance.data.reduce((s,m)=>s+Number(m.costo||0),0)

  const filtered = filter==='all' ? maintenance.data :
    filter==='abierta' ? maintenance.data.filter(m=>m.estatus!=='completada') :
    filter==='recurrente' ? maintenance.data.filter(m=>m.es_recurrente) :
    maintenance.data.filter(m=>m.estatus===filter)

  const openNew = () => { setForm(EMPTY); setEditId(null); setModal('form') }
  const openEdit = (m) => { setForm({...m, es_recurrente: m.es_recurrente || false}); setEditId(m.id); setModal('form') }
  const handleSave = () => {
    if(!form.titulo||!form.propiedad_id) return alert('Título y propiedad son requeridos')
    editId ? maintenance.update(editId,form) : maintenance.add(form)
    setModal(null)
  }

  return <div>
    <PageHeader title="Mantenimiento" subtitle="Órdenes de servicio y programación">
      <Button variant="primary" onClick={openNew}><Plus className="w-3.5 h-3.5"/> Nueva orden</Button>
    </PageHeader>

    <div className="grid grid-cols-5 gap-3 mb-5">
      <KPI label="Abiertas" value={abiertas.length} sub={urgentes.length>0?`${urgentes.length} urgente(s)`:'Sin urgentes'} subColor={urgentes.length>0?'text-red-500':'text-slate-400'} />
      <KPI label="Preventivas" value={maintenance.data.filter(m=>m.tipo==='preventivo').length} sub="programadas" />
      <KPI label="Recurrentes" value={recurrentes.length} sub="programadas automáticamente" subColor="text-blue-500" />
      <KPI label="Costo total" value={fmt(costoMes)} sub="estimado" />
      <KPI label="Completadas" value={maintenance.data.filter(m=>m.estatus==='completada').length} sub="este periodo" subColor="text-emerald-500" />
    </div>

    <Card className="mb-4">
      <div className="px-4 py-3 flex gap-1.5">
        {[['all','Todas'],['abierta','Abiertas'],['programada','Programadas'],['recurrente','Recurrentes'],['completada','Completadas']].map(([k,l])=>
          <FilterChip key={k} active={filter===k} onClick={()=>setFilter(k)}>{l}</FilterChip>
        )}
      </div>
    </Card>

    <Card className="overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-slate-50/80">
          <tr>{['','Prioridad','Servicio','Propiedad','Tipo','Proveedor','Costo','Fecha','Estatus',''].map(h=><th key={h} className={`${h==='Costo'?'text-right':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase tracking-wider`}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map((m,i)=>{
            const prop=properties.data.find(p=>p.id===m.propiedad_id)
            const[pl,pv]=prioMap[m.prioridad]||['Normal','gray']
            const[sl,sv]=statusMap[m.estatus]||[m.estatus,'gray']
            return <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/50 group" style={{animation:`slideUp 0.3s ease-out ${i*30}ms both`}}>
              <td className="px-3 py-3">{m.es_recurrente&&<RefreshCw className="w-3.5 h-3.5 text-blue-400" title="Recurrente"/>}</td>
              <td className="px-4 py-3"><Badge variant={pv}>{pl}</Badge></td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-700">{m.titulo}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-[200px] truncate">{m.descripcion}</p>
                {m.es_recurrente&&<p className="text-[10px] text-blue-500 mt-0.5 flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5"/>{m.frecuencia}{m.prox_ejecucion&&` · Próx: ${fmtDate(m.prox_ejecucion)}`}</p>}
              </td>
              <td className="px-4 py-3">{prop?<span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{prop.clave}</span>:'—'}</td>
              <td className="px-4 py-3"><Badge variant={m.tipo==='preventivo'?'teal':'amber'}>{m.tipo==='preventivo'?'Preventivo':'Correctivo'}</Badge></td>
              <td className="px-4 py-3 text-slate-600">{m.proveedor||'—'}</td>
              <td className="px-4 py-3 text-right font-medium">{fmt(m.costo)}</td>
              <td className="px-4 py-3 text-slate-500">{m.fecha_prog?fmtDate(m.fecha_prog):fmtDate(m.fecha_reporte)}</td>
              <td className="px-4 py-3"><Badge variant={sv}>{sl}</Badge></td>
              <td className="px-4 py-3"><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>openEdit(m)} className="p-1.5 hover:bg-slate-100 rounded-md"><Pencil className="w-3.5 h-3.5 text-slate-400"/></button><button onClick={()=>setDeleteId(m.id)} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button></div></td>
            </tr>
          })}
          {filtered.length===0&&<tr><td colSpan={10} className="px-4 py-16 text-center text-slate-400">No hay órdenes</td></tr>}
        </tbody>
      </table>
    </Card>

    <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editId?'Editar orden':'Nueva orden de servicio'}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Título *" className="col-span-2" value={form.titulo} onChange={e=>setF('titulo',e.target.value)} placeholder="Ej: Mantenimiento HVAC trimestral"/>
          <Select label="Propiedad *" value={form.propiedad_id} onChange={e=>setF('propiedad_id',e.target.value)}><option value="">Seleccionar...</option>{properties.data.map(p=><option key={p.id} value={p.id}>{p.clave} — {p.nombre}</option>)}</Select>
          <Select label="Proveedor" value={form.proveedor} onChange={e=>setF('proveedor',e.target.value)}><option value="">Seleccionar...</option>{providers.data.map(p=><option key={p.id} value={p.nombre}>{p.nombre}</option>)}</Select>
          <Select label="Tipo" value={form.tipo} onChange={e=>setF('tipo',e.target.value)}><option value="correctivo">Correctivo</option><option value="preventivo">Preventivo</option></Select>
          <Select label="Prioridad" value={form.prioridad} onChange={e=>setF('prioridad',e.target.value)}><option value="normal">Normal</option><option value="urgente">Urgente</option><option value="programada">Programada</option></Select>
          <Select label="Estatus" value={form.estatus} onChange={e=>setF('estatus',e.target.value)}><option value="en_proceso">En proceso</option><option value="programada">Programada</option><option value="completada">Completada</option></Select>
          <Input label="Costo estimado" type="number" value={form.costo} onChange={e=>setF('costo',e.target.value)}/>
          <Input label="Fecha reporte" type="date" value={form.fecha_reporte} onChange={e=>setF('fecha_reporte',e.target.value)}/>
          <Input label="Fecha programada" type="date" value={form.fecha_prog} onChange={e=>setF('fecha_prog',e.target.value)}/>
        </div>
        <Textarea label="Descripción" value={form.descripcion} onChange={e=>setF('descripcion',e.target.value)}/>

        <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-4">
          <Checkbox label="Es una orden recurrente" checked={form.es_recurrente} onChange={e=>setF('es_recurrente',e.target.checked)}/>
          <p className="text-[11px] text-slate-500 mt-1 ml-6">Activar para trámites, renovaciones, mantenimientos programados o cualquier servicio que se repita periódicamente.</p>
          {form.es_recurrente&&<div className="grid grid-cols-2 gap-3 mt-3 ml-6">
            <Select label="Frecuencia" value={form.frecuencia} onChange={e=>setF('frecuencia',e.target.value)}>
              <option value="">Seleccionar...</option>
              <option value="Mensual">Mensual</option>
              <option value="Bimestral">Bimestral</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
              <option value="Cada 2 años">Cada 2 años</option>
            </Select>
            <Input label="Próxima ejecución" type="date" value={form.prox_ejecucion} onChange={e=>setF('prox_ejecucion',e.target.value)}/>
          </div>}
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100"><Button variant="secondary" onClick={()=>setModal(null)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>{editId?'Guardar':'Crear orden'}</Button></div>
      </div>
    </Modal>
    <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>maintenance.remove(deleteId)} title="Eliminar orden" message="¿Eliminar esta orden?"/>
  </div>
}
