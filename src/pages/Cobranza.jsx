import { useState, useEffect } from 'react'
import { useData } from '../data/DataContext'
import { fmt, fmtDate } from '../data/store'
import { PageHeader, Card, KPI, Badge, Button, FilterChip, ConfirmDialog } from '../components/UI'
import { Download, Check, RefreshCw, AlertTriangle } from 'lucide-react'

export default function Cobranza() {
  const { collections, contracts, properties, tenants } = useData()
  const [filter, setFilter] = useState('all')
  const [mesActual] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  })

  // ── Auto-generate monthly charges from active contracts ──
  const generateMonthlyCharges = async () => {
    const activeContracts = contracts.data.filter(c =>
      ['vigente','por_vencer','moroso'].includes(c.estatus)
    )

    let generated = 0
    for (const contract of activeContracts) {
      // Check if a charge already exists for this property this month
      const existing = collections.data.find(c =>
        c.propiedad_id === contract.propiedad_id &&
        c.fecha_vencimiento &&
        c.fecha_vencimiento.startsWith(mesActual)
      )

      if (!existing) {
        // Determine due day from contract start date
        const startDate = new Date(contract.inicio + 'T12:00:00')
        const dueDay = startDate.getDate() || 1
        const dueDate = `${mesActual}-${String(Math.min(dueDay, 28)).padStart(2,'0')}`

        await collections.add({
          propiedad_id: contract.propiedad_id,
          inquilino_id: contract.inquilino_id,
          renta: contract.renta,
          moneda: contract.moneda,
          fecha_vencimiento: dueDate,
          fecha_pago: null,
          estatus: 'pendiente',
          cfdi_folio: ''
        })
        generated++
      }
    }

    if (generated > 0) {
      alert(`Se generaron ${generated} cobro(s) para ${mesActual}`)
    } else {
      alert('Todos los cobros del mes ya están generados')
    }
  }

  // ── Mark as paid with one click ──
  const markAsPaid = async (cobro) => {
    const today = new Date().toISOString().slice(0, 10)
    await collections.update(cobro.id, {
      estatus: 'pagado',
      fecha_pago: today
    })
  }

  // ── Mark as overdue ──
  const markAsOverdue = (cobro) => {
    collections.update(cobro.id, { estatus: 'vencido' })
  }

  // ── Check for overdue charges ──
  const checkOverdue = () => {
    const today = new Date()
    let updated = 0
    collections.data.forEach(c => {
      if (c.estatus === 'pendiente' && c.fecha_vencimiento) {
        const due = new Date(c.fecha_vencimiento + 'T12:00:00')
        if (due < today) {
          collections.update(c.id, { estatus: 'vencido' })
          updated++
        }
      }
    })
    if (updated > 0) alert(`${updated} cobro(s) marcados como vencidos`)
  }

  // ── Enrich data ──
  const enriched = collections.data.map(c => {
    const prop = properties.data.find(p => p.id === c.propiedad_id)
    const inq = tenants.data.find(t => t.id === c.inquilino_id)
    return { ...c, prop, inq }
  }).sort((a, b) => {
    // Sort: pendiente first, then vencido, then pagado
    const order = { pendiente: 0, vencido: 1, pagado: 2 }
    return (order[a.estatus] || 3) - (order[b.estatus] || 3)
  })

  const filtered = filter === 'all' ? enriched :
    filter === 'mes' ? enriched.filter(c => c.fecha_vencimiento?.startsWith(mesActual)) :
    enriched.filter(c => c.estatus === filter)

  const pagados = collections.data.filter(c => c.estatus === 'pagado')
  const pendientes = collections.data.filter(c => c.estatus === 'pendiente')
  const vencidos = collections.data.filter(c => c.estatus === 'vencido')
  const totalRenta = collections.data.reduce((s, c) => s + Number(c.renta || 0), 0)
  const totalCobrado = pagados.reduce((s, c) => s + Number(c.renta || 0), 0)
  const totalVencido = vencidos.reduce((s, c) => s + Number(c.renta || 0), 0)
  const totalPendiente = pendientes.reduce((s, c) => s + Number(c.renta || 0), 0)

  return <div>
    <PageHeader title="Cobranza" subtitle={`${mesActual} · ${contracts.data.filter(c=>['vigente','por_vencer','moroso'].includes(c.estatus)).length} contratos activos`}>
      <Button variant="secondary" onClick={checkOverdue}><AlertTriangle className="w-3.5 h-3.5"/> Verificar vencidos</Button>
      <Button variant="primary" onClick={generateMonthlyCharges}><RefreshCw className="w-3.5 h-3.5"/> Generar cobros del mes</Button>
    </PageHeader>

    <div className="p-3 mb-4 bg-blue-50 border border-blue-100 rounded-lg text-[12px] text-blue-700 flex items-start gap-2">
      <RefreshCw className="w-4 h-4 shrink-0 mt-0.5"/>
      <div>
        <p className="font-medium">Cobranza automática</p>
        <p className="mt-0.5 text-blue-600">Dale clic a "Generar cobros del mes" para crear automáticamente los cobros de todos los contratos activos. Después solo confirma los pagos con un clic en ✓.</p>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-3 mb-5">
      <KPI label="Pendiente de cobro" value={fmt(totalPendiente)} sub={`${pendientes.length} cobro(s)`} subColor="text-amber-500" />
      <KPI label="Cobrado" value={fmt(totalCobrado)} sub={`${pagados.length} cobro(s)`} subColor="text-emerald-500" />
      <KPI label="Vencido" value={fmt(totalVencido)} sub={`${vencidos.length} cobro(s)`} subColor={vencidos.length > 0 ? 'text-red-500' : 'text-slate-400'} />
      <KPI label="Total registrado" value={fmt(totalRenta)} sub={`${collections.data.length} registros`} />
    </div>

    <Card className="mb-4">
      <div className="px-4 py-3 flex gap-1.5 flex-wrap">
        {[
          ['all', `Todos (${collections.data.length})`],
          ['mes', `Este mes`],
          ['pendiente', `Pendientes (${pendientes.length})`],
          ['vencido', `Vencidos (${vencidos.length})`],
          ['pagado', `Pagados (${pagados.length})`],
        ].map(([k, l]) =>
          <FilterChip key={k} active={filter===k} onClick={()=>setFilter(k)}>{l}</FilterChip>
        )}
      </div>
    </Card>

    <Card className="overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-slate-50/80">
          <tr>{['Propiedad','Inquilino','Renta','Vencimiento','Fecha pago','Estatus','CFDI','Acción'].map(h =>
            <th key={h} className={`${h==='Renta'?'text-right':h==='Acción'?'text-center':'text-left'} px-4 py-3 font-medium text-slate-400 text-[10px] uppercase tracking-wider`}>{h}</th>
          )}</tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => {
            const isPending = c.estatus === 'pendiente'
            const isOverdue = c.estatus === 'vencido'
            return <tr key={c.id} className={`border-t border-slate-100 hover:bg-slate-50/50 ${isOverdue ? 'bg-red-50/30' : ''}`} style={{animation:`slideUp 0.3s ease-out ${i*30}ms both`}}>
              <td className="px-4 py-3">
                {c.prop ? <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{c.prop.clave}</span> : '—'}
                <p className="text-[10px] text-slate-400 mt-0.5">{c.prop?.nombre}</p>
              </td>
              <td className="px-4 py-3 font-medium text-slate-700">{c.inq?.nombre || '—'}</td>
              <td className="px-4 py-3 text-right font-medium text-slate-700">
                {fmt(c.renta)} <span className="text-[10px] text-slate-400">{c.moneda}</span>
              </td>
              <td className="px-4 py-3 text-slate-500">{fmtDate(c.fecha_vencimiento)}</td>
              <td className="px-4 py-3 text-slate-500">{c.fecha_pago ? fmtDate(c.fecha_pago) : '—'}</td>
              <td className="px-4 py-3">
                <Badge variant={c.estatus==='pagado'?'green':c.estatus==='vencido'?'red':'amber'}>
                  {c.estatus==='pagado'&&'✓ '}{c.estatus==='pagado'?'Pagado':c.estatus==='vencido'?'Vencido':'Pendiente'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {c.cfdi_folio ? <Badge variant="default">{c.cfdi_folio}</Badge> : <Badge variant="gray">—</Badge>}
              </td>
              <td className="px-4 py-3 text-center">
                {(isPending || isOverdue) && (
                  <button
                    onClick={() => markAsPaid(c)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-medium rounded-lg transition-all shadow-sm"
                  >
                    <Check className="w-3 h-3"/> Pagado
                  </button>
                )}
                {c.estatus === 'pagado' && (
                  <span className="text-[10px] text-emerald-500">✓</span>
                )}
              </td>
            </tr>
          })}
          {filtered.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-400">
              {filter === 'mes' ? (
                <div>
                  <p className="mb-2">No hay cobros para este mes</p>
                  <button onClick={generateMonthlyCharges} className="text-blue-500 font-medium hover:text-blue-600">
                    Generar cobros automáticamente →
                  </button>
                </div>
              ) : 'No hay registros de cobranza'}
            </td></tr>
          )}
        </tbody>
      </table>
    </Card>
  </div>
}

