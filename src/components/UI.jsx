import { clsx } from 'clsx'
import { X } from 'lucide-react'

export function Badge({children,variant='default',className}){const v={default:'bg-blue-50 text-blue-700',green:'bg-emerald-50 text-emerald-700',amber:'bg-amber-50 text-amber-700',red:'bg-red-50 text-red-700',gray:'bg-slate-100 text-slate-600',purple:'bg-violet-50 text-violet-700',teal:'bg-teal-50 text-teal-700'};return<span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',v[variant],className)}>{children}</span>}
export function StatusBadge({estatus}){const m={rentada:['Rentada','green'],vacante:['Vacante','amber'],en_remodelacion:['En remodelación','amber'],en_venta:['En venta','default'],propia:['Propia','gray']};const[l,v]=m[estatus]||[estatus,'gray'];return<Badge variant={v}>{l}</Badge>}
export function TipoBadge({tipo}){const m={bodega:['Industrial','default'],local_comercial:['Comercial','amber'],terreno:['Terreno','gray'],residencial:['Residencial','teal'],complejo:['Complejo','purple']};const[l,v]=m[tipo]||[tipo,'gray'];return<Badge variant={v}>{l}</Badge>}
export function KPI({label,value,sub,subColor='text-slate-400'}){return<div className="bg-white border border-slate-200/80 rounded-xl p-4"><p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p><p className="text-xl font-semibold text-slate-800 mb-0.5">{value}</p>{sub&&<p className={clsx('text-[11px]',subColor)}>{sub}</p>}</div>}
export function Card({children,className,...p}){return<div className={clsx('bg-white border border-slate-200/80 rounded-xl',className)} {...p}>{children}</div>}
export function CardHeader({title,action}){return<div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100"><h3 className="text-[13px] font-semibold text-slate-700">{title}</h3>{action}</div>}
export function PageHeader({title,subtitle,children}){return<div className="flex items-center justify-between mb-6"><div><h1 className="text-xl font-semibold text-slate-800">{title}</h1>{subtitle&&<p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}</div>{children&&<div className="flex gap-2">{children}</div>}</div>}
export function Button({children,variant='secondary',size='md',className,...p}){const v={primary:'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',secondary:'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200',danger:'bg-red-500 hover:bg-red-600 text-white',ghost:'hover:bg-slate-100 text-slate-500'};const s={sm:'px-2.5 py-1.5 text-[11px]',md:'px-3.5 py-2 text-[12px]'};return<button className={clsx('inline-flex items-center gap-1.5 font-medium rounded-lg transition-all disabled:opacity-50',v[variant],s[size],className)} {...p}>{children}</button>}
export function FilterChip({children,active,onClick}){return<button onClick={onClick} className={clsx('px-3 py-1 text-[11px] font-medium rounded-full border transition-all',active?'bg-blue-50 text-blue-700 border-blue-200':'bg-white text-slate-500 border-slate-200 hover:border-slate-300')}>{children}</button>}
export function RatingStars({score}){return<div className="flex items-center gap-1"><span className="text-amber-400 text-xs">{'★'.repeat(Math.floor(score))}</span><span className="text-slate-200 text-xs">{'★'.repeat(5-Math.ceil(score))}</span><span className="text-[11px] text-slate-500 ml-0.5">{Number(score).toFixed(1)}</span></div>}
export function Input({label,error,className,...p}){
export function Select({label,error,children,className,...p}){return<div className={clsx('space-y-1',className)}>{label&&<label className="block text-[12px] font-medium text-slate-600">{label}</label>}<select className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" {...p}>{children}</select>{error&&<p className="text-[11px] text-red-500">{error}</p>}</div>}
export function Textarea({label,error,className,...p}){return<div className={clsx('space-y-1',className)}>{label&&<label className="block text-[12px] font-medium text-slate-600">{label}</label>}<textarea rows={3} className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" {...p}/></div>}
export function Checkbox({label,...p}){return<label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded border-slate-300 text-blue-600 w-4 h-4" {...p}/><span className="text-[13px] text-slate-600">{label}</span></label>}

export function Modal({open,onClose,title,children,width='max-w-2xl'}){
  if(!open)return null
  return<div className="fixed inset-0 z-50 flex items-start justify-center pt-[6vh] px-4" onClick={onClose}><div className="fixed inset-0 bg-black/40 backdrop-blur-sm"/><div className={clsx('relative bg-white rounded-2xl shadow-2xl w-full border border-slate-200',width)} onClick={e=>e.stopPropagation()} style={{animation:'slideUp 0.25s ease-out'}}><div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"><h2 className="text-[15px] font-semibold text-slate-800">{title}</h2><button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-400"/></button></div><div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div></div></div>
}

export function ConfirmDialog({open,onClose,onConfirm,title,message}){
  if(!open)return null
  return<div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}><div className="fixed inset-0 bg-black/40 backdrop-blur-sm"/><div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={e=>e.stopPropagation()}><h3 className="text-[14px] font-semibold text-slate-800 mb-2">{title}</h3><p className="text-[13px] text-slate-500 mb-5">{message}</p><div className="flex gap-2 justify-end"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant="danger" onClick={()=>{onConfirm();onClose()}}>Eliminar</Button></div></div></div>
}

export function MapEmbed({lat,lng,name}){
  const la = Number(lat), lo = Number(lng)
  if(!la||!lo) return<div className="w-full h-52 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm">Sin coordenadas — edita la propiedad para agregar ubicación</div>
  // Use Google Maps embed (no API key needed for basic embed)
  const src=`https://maps.google.com/maps?q=${la},${lo}&z=16&output=embed`
  return<iframe title={name||'map'} src={src} className="w-full h-52 rounded-lg border border-slate-200" style={{border:0}} loading="lazy" referrerPolicy="no-referrer"/>
}

export function ImageGallery({images,onAdd,onRemove}){
  const handleFile=(e)=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=(ev)=>{if(onAdd)onAdd(ev.target.result)};r.readAsDataURL(file);e.target.value=''}
  return<div><div className="flex gap-2 flex-wrap">
    {(images||[]).map((img,i)=><div key={i} className="relative w-32 h-24 rounded-lg overflow-hidden border border-slate-200 group"><img src={img} alt="" className="w-full h-full object-cover"/>{onRemove&&<button onClick={()=>onRemove(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>}</div>)}
    {onAdd&&<label className="w-32 h-24 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all"><span className="text-xl text-slate-300">+</span><span className="text-[10px] text-slate-400">Agregar foto</span><input type="file" accept="image/*" className="hidden" onChange={handleFile}/></label>}
    {(!images||images.length===0)&&!onAdd&&<div className="w-full py-8 text-center text-slate-400 text-sm">Sin fotos</div>}
  </div></div>
}

export function SectionLabel({children}){return<p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-1">{children}</p>}
export function DetailRow({label,value}){if(!value&&value!==0)return null;return<div className="flex justify-between py-2 border-b border-slate-50"><span className="text-[12px] text-slate-500">{label}</span><span className="text-[12px] font-medium text-slate-700 text-right max-w-[220px]">{value}</span></div>}
