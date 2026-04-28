import { useData } from '../data/DataContext'
import { fmt } from '../data/store'
import { PageHeader, Card, CardHeader, KPI, Button } from '../components/UI'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, FileText } from 'lucide-react'

export default function Reportes(){
  const{properties,collections,assets,groups,contracts}=useData()
  const props=properties.data.filter(p=>!p.parent_id)
  const allProps=properties.data
  const activeContracts=contracts.data.filter(c=>['vigente','por_vencer','moroso'].includes(c.estatus))
  const rentaContratos=activeContracts.reduce((s,c)=>s+Number(c.renta||0),0)
  const rentaProps=allProps.filter(p=>p.estatus==='rentada').reduce((s,p)=>s+Number(p.renta),0)
  const rentaTotal=rentaContratos||rentaProps
  const valorPortafolio=props.reduce((s,p)=>s+Number(p.valor_comercial||0),0)
  const rentaAnual=rentaTotal*12
  const yieldPct=valorPortafolio>0?(rentaAnual/valorPortafolio*100).toFixed(1):'—'
  const totalAssets=assets.data.reduce((s,a)=>s+Number(a.valor_actual||0),0)
  const totalDep=assets.data.reduce((s,a)=>s+Number(a.depreciacion_anual||0),0)
  const ocupacion=allProps.length>0?Math.round(allProps.filter(p=>p.estatus==='rentada').length/allProps.length*100):0

  // ── Build chart from REAL cobranza data ──
  const buildChartData=()=>{
    const now=new Date()
    const months=[]
    for(let i=5;i>=0;i--){
      const d=new Date(now.getFullYear(),now.getMonth()-i,1)
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const label=d.toLocaleDateString('es-MX',{month:'short'})
      const cobros=collections.data.filter(c=>c.fecha_vencimiento&&c.fecha_vencimiento.startsWith(key)&&c.estatus==='pagado')
      const total=cobros.reduce((s,c)=>s+Number(c.renta||0),0)
      months.push({mes:label.charAt(0).toUpperCase()+label.slice(1),cobrado:total})
    }
    return months
  }
  const chartData=buildChartData()

  const tipoData=[
    {name:'Industrial',value:allProps.filter(p=>p.tipo==='bodega').length,fill:'#2563EB'},
    {name:'Comercial',value:allProps.filter(p=>['local_comercial','complejo'].includes(p.tipo)).length,fill:'#F59E0B'},
    {name:'Residencial',value:allProps.filter(p=>p.tipo==='residencial').length,fill:'#10B981'},
  ].filter(d=>d.value>0)

  const valorByGrupo=groups.data.map(g=>{
    const gProps=props.filter(p=>p.grupo_id===g.id)
    const gContracts=contracts.data.filter(c=>gProps.some(p=>p.id===c.propiedad_id)&&['vigente','por_vencer','moroso'].includes(c.estatus))
    const gRenta=(gContracts.reduce((s,c)=>s+Number(c.renta),0)||allProps.filter(p=>p.grupo_id===g.id&&p.estatus==='rentada').reduce((s,p)=>s+Number(p.renta),0))*12
    return{name:g.nombre.length>20?g.nombre.slice(0,20)+'…':g.nombre,valor:gProps.reduce((s,p)=>s+Number(p.valor_comercial||0),0),renta:gRenta}
  }).filter(d=>d.valor>0||d.renta>0)

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
      <KPI label="Renta anual" value={fmt(rentaAnual)} sub="según contratos activos"/>
      <KPI label="Rendimiento" value={`${yieldPct}%`} sub="renta/valor" subColor={Number(yieldPct)>8?'text-emerald-500':'text-amber-500'}/>
      <KPI label="Activos fijos" value={fmt(totalAssets)} sub={`Dep. ${fmt(totalDep)}/año`} subColor="text-red-500"/>
      <KPI label="Ocupación" value={`${ocupacion}%`} sub="del portafolio" subColor="text-emerald-500"/>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-5">
      <Card><CardHeader title="Ingresos cobrados — últimos 6 meses"/><div className="p-4 h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/><XAxis dataKey="mes" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>v>0?`$${Number(v).toLocaleString('es-MX')}`:''}/><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:'1px solid #e2e8f0',fontSize:12}}/><Bar dataKey="cobrado" name="Cobrado" fill="#2563EB" radius={[4,4,0,0]} barSize={24}/></BarChart></ResponsiveContainer></div></Card>
      <Card><CardHeader title="Distribución por tipo"/><div className="p-4 h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={tipoData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" label={({name,value})=>`${name}: ${value}`}>{tipoData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Pie><Tooltip contentStyle={{borderRadius:8,border:'1px solid #e2e8f0',fontSize:12}}/></PieChart></ResponsiveContainer></div></Card>
    </div>
    {valorByGrupo.length>0&&<Card className="mb-5"><CardHeader title="Valor del portafolio y renta anual — por empresa"/><div className="p-4 h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={valorByGrupo} layout="vertical" barGap={4}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/><XAxis type="number" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000000?`$${(v/1000000).toFixed(1)}M`:v>=1000?`$${Math.round(v/1000)}k`:`$${v}`}/><YAxis dataKey="name" type="category" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} width={100}/><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:'1px solid #e2e8f0',fontSize:12}}/><Bar dataKey="valor" name="Valor comercial" fill="#2563EB" radius={[0,4,4,0]} barSize={14}/><Bar dataKey="renta" name="Renta anual" fill="#10B981" radius={[0,4,4,0]} barSize={14}/></BarChart></ResponsiveContainer></div></Card>}
    <h2 className="text-sm font-semibold text-slate-600 mb-3">Reportes descargables</h2>
    <div className="grid grid-cols-3 gap-3">{reports.map((r,i)=><Card key={i} className="p-4 hover:border-blue-200 transition-colors cursor-pointer" style={{animation:`slideUp 0.3s ease-out ${i*50}ms both`}}><div className="flex items-start gap-3"><div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4"/></div><div className="flex-1"><p className="text-[12px] font-medium text-slate-700">{r.title}</p><p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p></div></div><button className="mt-3 w-full text-center text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition-colors">Generar PDF</button></Card>)}</div>
  </div>
}
