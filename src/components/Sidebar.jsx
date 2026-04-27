import { NavLink, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { LayoutDashboard, Building2, FileText, Users, Wrench, DollarSign, BarChart3, FolderOpen, Settings2, RotateCcw, Layers, UserCircle } from 'lucide-react'
import { useData } from '../data/DataContext'

const NAV = [
  { group: 'Portafolio', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/grupos', label: 'Grupos / Propietarios', icon: Layers },
    { to: '/propiedades', label: 'Propiedades', icon: Building2 },
  ]},
  { group: 'Operación', items: [
    { to: '/inquilinos', label: 'Inquilinos', icon: Users },
    { to: '/contratos', label: 'Contratos', icon: FileText },
    { to: '/mantenimiento', label: 'Mantenimiento', icon: Wrench },
  ]},
  { group: 'Finanzas', items: [
    { to: '/cobranza', label: 'Cobranza', icon: DollarSign },
    { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  ]},
  { group: 'Expedientes', items: [
    { to: '/proveedores', label: 'Proveedores', icon: Settings2 },
    { to: '/documentos', label: 'Documentos', icon: FolderOpen },
  ]},
]

export default function Sidebar() {
  const { properties, tenants, contracts, maintenance, groups, resetAll } = useData()
  const location = useLocation()
  const isClient = location.pathname.startsWith('/cliente')

  const badges = { '/propiedades': properties.data.length, '/inquilinos': tenants.data.length, '/contratos': contracts.data.length, '/mantenimiento': maintenance.data.filter(m=>m.estatus!=='completada').length, '/grupos': groups.data.length }

  if (isClient) {
    return (
      <aside className="w-[210px] bg-emerald-900 flex flex-col fixed inset-y-0 z-20">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-white"/></div>
            <div><p className="text-white font-semibold text-sm leading-tight">Mi Portafolio</p><p className="text-emerald-300/60 text-[10px]">Portal del cliente</p></div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-400/50">Mi cuenta</p>
          {[{to:'/cliente',label:'Mi resumen',icon:LayoutDashboard,end:true},{to:'/cliente/propiedades',label:'Mis propiedades',icon:Building2},{to:'/cliente/finanzas',label:'Estado financiero',icon:DollarSign},{to:'/cliente/documentos',label:'Mis documentos',icon:FolderOpen}].map(({to,label,icon:Icon,end})=>(
            <NavLink key={to} to={to} end={end} className={({isActive})=>clsx('flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-all mb-0.5',isActive?'bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/20':'text-emerald-200/70 hover:bg-white/5 hover:text-white')}>
              <Icon className="w-[15px] h-[15px]"/>{label}
            </NavLink>
          ))}
          <div className="mt-6"><NavLink to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-emerald-300/50 hover:bg-white/5 hover:text-emerald-200">← Vista administrador</NavLink></div>
        </nav>
        <div className="px-5 py-3 border-t border-white/10">
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-emerald-200/20 text-emerald-300 flex items-center justify-center text-[11px] font-medium">CM</div><div className="flex-1"><p className="text-[11px] text-emerald-200 truncate">Carlos Martínez</p><p className="text-[10px] text-emerald-400/50">Inmuebles del Norte</p></div></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-[210px] bg-slate-900 flex flex-col fixed inset-y-0 z-20">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-white"/></div>
          <div><p className="text-white font-semibold text-sm leading-tight">Inmuebles</p><p className="text-slate-400 text-[10px]">Plataforma SaaS</p></div>
        </div>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(g=>(
          <div key={g.group} className="mb-4 px-3">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{g.group}</p>
            {g.items.map(({to,label,icon:Icon,end})=>(
              <NavLink key={to} to={to} end={end} className={({isActive})=>clsx('flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-all mb-0.5',isActive?'bg-blue-600/90 text-white shadow-lg shadow-blue-600/20':'text-slate-400 hover:bg-white/5 hover:text-slate-200')}>
                <Icon className="w-[15px] h-[15px] shrink-0"/><span className="flex-1">{label}</span>
                {badges[to]!==undefined&&<span className="bg-white/10 text-[10px] px-1.5 py-0.5 rounded-full">{badges[to]}</span>}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="px-3 mb-4">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Vista cliente</p>
          <NavLink to="/cliente" className={({isActive})=>clsx('flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] mb-0.5',isActive?'bg-emerald-600/90 text-white':'text-emerald-400/70 hover:bg-white/5 hover:text-emerald-300')}>
            <UserCircle className="w-[15px] h-[15px]"/>Portal cliente
          </NavLink>
        </div>
      </nav>
      <div className="px-4 py-2 border-t border-white/10"><button onClick={()=>{if(confirm('¿Reiniciar todos los datos?'))resetAll()}} className="flex items-center gap-2 px-3 py-1.5 w-full text-[11px] text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5"><RotateCcw className="w-3 h-3"/>Reiniciar datos demo</button></div>
      <div className="px-5 py-3 border-t border-white/10"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-amber-200/20 text-amber-300 flex items-center justify-center text-[11px] font-medium">RM</div><div className="flex-1"><p className="text-[11px] text-slate-300 truncate">Roberto Méndez</p><p className="text-[10px] text-slate-500">Admin</p></div></div></div>
    </aside>
  )
}
