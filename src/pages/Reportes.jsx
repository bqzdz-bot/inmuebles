import { useData } from '../data/DataContext'
import { fmt, INCOME_CHART } from '../data/store'
import { PageHeader, Card, CardHeader, KPI, Button } from '../components/UI'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, FileText, TrendingUp } from 'lucide-react'

export default function Reportes(){
  const{properties,collections,assets,groups}=useData()
  const props=properties.data.filter(p=>!p.parent_id)
  const allProps=properties.data
  const rentaTotal=allProps.filter(p=>p.estatus==='rentada').reduce((s,p)=>s+Number(p.renta),0)
  const valorPortafolio=props.reduce((s,p)=>s+Number(p.valor_comercial||0),0)
  const rentaAnual=rentaTotal*12
  const yieldPct=valorPortafolio>0?(rentaAnual/valorPortafolio*100).toFixed(1):'—'
  const totalAssets=assets.data.reduce((s,a)=>s+Number(a.valor_actual||0),0)
  const totalDep=assets.data.reduce((s,a)=>s+Number(a.depreciacion_anual||0),0)
  const ocupacion=allProps.length>0?Math.round(allProps.filter(p=>p.estatus==='rentada').length/allProps.length*100):0

  const tipoData=[
    {name:'Industrial',value:allProps.filter(p=>p.tipo==='bodega').length,fill:'#2563EB'},
    {name:'Comercial',value:allProps.filter(p=>['local_comercial','complejo'].includes(p.tipo)).length,fill:'#F59E0B'},
    {name:'Residencial',value:allProps.filter(p=>p.tipo==='residencial').length,fill:'#10B981'},
  ].filter(d=>d.value>0)

  const valorByGrupo=groups.data.map(g=>{
    const gProps=props.filter(p=>p.grupo_id===g.id)
    return{name:g.nombre.length>20?g.nombre.slice(0,20)+'…':g.nombre,valor:gProps.reduce((s,p)=>s+Number(p.valor_comercial||0),0),renta:allProps.filter(p=>p.grupo_id===g.id&&p.estatus==='rentada').reduce((s,p)=>s+Number(p.renta),0)*12}
  }).filter(d=>d.valor>0)

  const reports=[
    {title:'Rendimiento del portafolio',desc:'Yield anual por propiedad y grupo'},
    {title:'Análisis de ocupación',desc:'Tendencia y comparativo por tipo'},
    {title:'Valuación de activos fijos',desc:'Depreciación acumulada y valor residual'},
    {title:'Antigüedad de saldos',desc:'Cuentas por cobrar por antigüedad'},
    {title:'Costo de mantenimiento',desc:'Histórico por propiedad y categoría'},
    {title:'Reporte fiscal',desc:'Ingresos, deducciones, ISR estimado'},
  ]

  return<div>
    <PageHeader title="Reportes" subtitle="Análisis del portafolio"><Button variant="secondary"><Download className="w-3.5 h-3.5"/>Exportar</Button></PageHeader>
    <div className="grid grid-cols-5 gap-3 mb-5">
      <KPI label="Valor del portafolio" value={fmt(valorPortafolio)} sub={`${props.length} activos`}/>
      <KPI label="Renta anual" value={fmt(rentaAnual)} sub="proyectada"/>
      <KPI label="Rendimiento" value={`${yieldPct}%`} sub="renta/valor" subColor={Number(yieldPct)>8?'text-emerald-500':'text-amber-500'}/>
      <KPI label="Activos fijos" value={fmt(totalAssets)} sub={`Dep. ${fmt(totalDep)}/año`} subColor="text-red-500"/>
      <KPI label="Ocupación" value={`${ocupacion}%`} sub="del portafolio" subColor="text-emerald-500"/>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-5">
      <Card><CardHeader title="Ingresos por renta — tendencia"/><div className="p-4 h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={INCOME_CHART}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/><XAxis dataKey="mes" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${Math.round(v/1000)}k`}/><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:'1px solid #e2e8f0',fontSize:12}}/><Line type="monotone" dataKey="ingresos" stroke="#2563EB" strokeWidth={2.5} dot={{r:4,fill:'#2563EB'}}/></LineChart></ResponsiveContainer></div></Card>
      <Card><CardHeader title="Distribución por tipo"/><div className="p-4 h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={tipoData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" label={({name,value})=>`${name}: ${value}`}>{tipoData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Pie><Tooltip contentStyle={{borderRadius:8,border:'1px solid #e2e8f0',fontSize:12}}/></PieChart></ResponsiveContainer></div></Card>
    </div>
    <Card className="mb-5"><CardHeader title="Valor del portafolio y renta anual — por grupo"/><div className="p-4 h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={valorByGrupo} layout="vertical" barGap={4}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/><XAxis type="number" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${Math.round(v/1000000)}M`}/><YAxis dataKey="name" type="category" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} width={100}/><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:'1px solid #e2e8f0',fontSize:12}}/><Bar dataKey="valor" name="Valor comercial" fill="#2563EB" radius={[0,4,4,0]} barSize={14}/><Bar dataKey="renta" name="Renta anual" fill="#10B981" radius={[0,4,4,0]} barSize={14}/></BarChart></ResponsiveContainer></div></Card>
    <h2 className="text-sm font-semibold text-slate-600 mb-3">Reportes descargables</h2>
    <div className="grid grid-cols-3 gap-3">{reports.map((r,i)=><Card key={i} className="p-4 hover:border-blue-200 transition-colors cursor-pointer" style={{animation:`slideUp 0.3s ease-out ${i*50}ms both`}}><div className="flex items-start gap-3"><div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4"/></div><div className="flex-1"><p className="text-[12px] font-medium text-slate-700">{r.title}</p><p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p></div></div><button className="mt-3 w-full text-center text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition-colors">Generar PDF</button></Card>)}</div>
  </div>
}
