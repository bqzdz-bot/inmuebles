import { KPI, Card, CardHeader, PageHeader, Badge } from '../components/UI'
import { useData } from '../data/DataContext'
import { fmt, INCOME_CHART } from '../data/store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertTriangle, Clock, Info, Layers, ArrowRight, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { properties, tenants, contracts, maintenance, collections, groups, assets } = useData()
  const props = properties.data.filter(p => !p.parent_id) // Only parent properties
  const allProps = properties.data
  const rentadas = allProps.filter(p=>p.estatus==='rentada').length
  const vacantes = allProps.filter(p=>['vacante','en_remodelacion'].includes(p.estatus)).length
  const rentaTotal = allProps.filter(p=>p.estatus==='rentada').reduce((s,p)=>s+Number(p.renta),0)
  const valorPortafolio = props.reduce((s,p)=>s+Number(p.valor_comercial||0),0)
  const rentaAnual = rentaTotal * 12
  const yieldPct = valorPortafolio > 0 ? (rentaAnual / valorPortafolio * 100).toFixed(1) : '—'
  const abiertos = maintenance.data.filter(m=>m.estatus!=='completada').length
  const urgentes = maintenance.data.filter(m=>m.prioridad==='urgente'&&m.estatus!=='completada').length
  const totalAssets = assets.data.reduce((s,a)=>s+Number(a.valor_actual||0),0)

  const ind = allProps.filter(p=>p.tipo==='bodega').length
  const com = allProps.filter(p=>['local_comercial','complejo'].includes(p.tipo)).length
  const res = allProps.filter(p=>p.tipo==='residencial').length

  return <div>
    <PageHeader title="Dashboard" subtitle={`${allProps.length} propiedades · ${groups.data.length} propietarios · ${tenants.data.length} inquilinos`} />

    <div className="grid grid-cols-5 gap-3 mb-5">
      <KPI label="Valor del portafolio" value={fmt(valorPortafolio)} sub={`${props.length} activos`} />
      <KPI label="Renta mensual" value={fmt(rentaTotal)} sub={`${rentadas} contratos activos`} />
      <KPI label="Rendimiento anual" value={yieldPct !== '—' ? `${yieldPct}%` : '—'} sub="renta anual / valor" subColor={Number(yieldPct) > 8 ? 'text-emerald-500' : 'text-amber-500'} />
      <KPI label="Ocupación" value={allProps.length>0?`${Math.round(rentadas/allProps.filter(p=>!p.parent_id||p.renta>0).length*100)}%`:'—'} sub={`${rentadas} rentadas · ${vacantes} disponibles`} subColor="text-emerald-500" />
      <KPI label="Activos fijos" value={fmt(totalAssets)} sub={`${assets.data.length} activos registrados`} />
    </div>

    <Card className="mb-5">
      <CardHeader title="Grupos / Propietarios" action={<Link to="/grupos" className="text-[12px] text-blue-500 font-medium hover:text-blue-600 flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3"/></Link>} />
      <div className="divide-y divide-slate-50">
        {groups.data.map(g => {
          const gProps = allProps.filter(p=>p.grupo_id===g.id)
          const gRentadas = gProps.filter(p=>p.estatus==='rentada')
          const gRenta = gRentadas.reduce((s,p)=>s+Number(p.renta),0)
          const gValor = props.filter(p=>p.grupo_id===g.id).reduce((s,p)=>s+Number(p.valor_comercial||0),0)
          const gYield = gValor>0?(gRenta*12/gValor*100).toFixed(1):'—'
          return <div key={g.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/50">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><Layers className="w-4 h-4"/></div>
            <div className="flex-1 min-w-0"><p className="text-[12.5px] font-medium text-slate-700 truncate">{g.nombre}</p><p className="text-[10px] text-slate-400">{g.rfc}</p></div>
            <div className="text-right mr-3"><p className="text-[12px] font-medium">{gProps.length} props</p><p className="text-[10px] text-slate-400">{fmt(gRenta)}/mes</p></div>
            <div className="text-right mr-3"><p className="text-[12px] font-medium">{fmt(gValor)}</p><p className="text-[10px] text-slate-400">valor</p></div>
            <div className="text-right"><p className="text-[12px] font-medium text-emerald-600">{gYield}%</p><p className="text-[10px] text-slate-400">rendimiento</p></div>
            <Badge variant={g.plan==='premium'?'purple':g.plan==='estandar'?'default':'gray'}>{g.plan}</Badge>
          </div>
        })}
      </div>
    </Card>

    <div className="grid grid-cols-5 gap-3 mb-5">
      <div className="col-span-3">
        <Card>
          <CardHeader title="Ingresos por renta — últimos 6 meses" action={<Link to="/reportes" className="text-[12px] text-blue-500 font-medium">Reportes →</Link>} />
          <div className="p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INCOME_CHART} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${Math.round(v/1000)}k`}/>
                <Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:'1px solid #e2e8f0',fontSize:12}}/>
                <Bar dataKey="ingresos" name="Ingresos por renta" fill="#2563EB" radius={[4,4,0,0]} barSize={28}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="col-span-2">
        <Card className="h-full">
          <CardHeader title="Mezcla de cartera" />
          <div className="p-5">
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  {allProps.length>0&&<><circle cx="18" cy="18" r="14" fill="none" strokeWidth="5" stroke="#2563EB" strokeDasharray={`${ind/allProps.length*88} 100`} strokeLinecap="round"/>
                  <circle cx="18" cy="18" r="14" fill="none" strokeWidth="5" stroke="#F59E0B" strokeDasharray={`${com/allProps.length*88} 100`} strokeDashoffset={`-${ind/allProps.length*88}`} strokeLinecap="round"/>
                  <circle cx="18" cy="18" r="14" fill="none" strokeWidth="5" stroke="#10B981" strokeDasharray={`${res/allProps.length*88} 100`} strokeDashoffset={`-${(ind+com)/allProps.length*88}`} strokeLinecap="round"/></>}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-semibold text-slate-700">{allProps.length}</span><span className="text-[9px] text-slate-400">total</span></div>
              </div>
              <div className="space-y-2.5 flex-1">
                {[['Industrial',ind,'bg-blue-500'],['Comercial',com,'bg-amber-400'],['Residencial',res,'bg-emerald-400']].map(([l,n,c])=>
                  <div key={l} className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs text-slate-500"><span className={`w-2.5 h-2.5 rounded-sm ${c}`}></span>{l}</span><span className="text-sm font-medium text-slate-700">{n}</span></div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <Card>
      <CardHeader title="Alertas" />
      <div className="p-3 space-y-2">
        {urgentes>0&&<div className="flex gap-3 items-start p-3 rounded-lg bg-red-50"><div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-3 h-3 text-white"/></div><div><p className="text-[12px] font-medium text-slate-700">{urgentes} orden(es) urgente(s) de mantenimiento</p></div></div>}
        {contracts.data.filter(c=>c.estatus==='por_vencer').length>0&&<div className="flex gap-3 items-start p-3 rounded-lg bg-amber-50"><div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0"><Clock className="w-3 h-3 text-white"/></div><div><p className="text-[12px] font-medium text-slate-700">{contracts.data.filter(c=>c.estatus==='por_vencer').length} contrato(s) por vencer</p></div></div>}
        {assets.data.filter(a=>{ const d=new Date(a.prox_mantenimiento); const now=new Date(); const diff=(d-now)/(1000*60*60*24); return diff<=30&&diff>0 }).length>0&&<div className="flex gap-3 items-start p-3 rounded-lg bg-blue-50"><div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><Info className="w-3 h-3 text-white"/></div><div><p className="text-[12px] font-medium text-slate-700">{assets.data.filter(a=>{const d=new Date(a.prox_mantenimiento);const now=new Date();const diff=(d-now)/(1000*60*60*24);return diff<=30&&diff>0}).length} activo(s) con mantenimiento preventivo próximo</p></div></div>}
      </div>
    </Card>
  </div>
}
