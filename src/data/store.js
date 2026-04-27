import { useState, useEffect, useCallback } from 'react'

function load(key, seed) { try { const s = localStorage.getItem(`imx4_${key}`); if (s) return JSON.parse(s) } catch(e){} return seed }
function save(key, data) { try { localStorage.setItem(`imx4_${key}`, JSON.stringify(data)) } catch(e){} }

export function useStore(key, seed) {
  const [data, setData] = useState(() => load(key, seed))
  useEffect(() => { save(key, data) }, [key, data])
  const add = useCallback((item) => { const n = { ...item, id: Date.now().toString()+Math.random().toString(36).slice(2,5) }; setData(p => [...p, n]); return n }, [])
  const update = useCallback((id, ch) => setData(p => p.map(i => i.id===id ? {...i,...ch} : i)), [])
  const remove = useCallback((id) => setData(p => p.filter(i => i.id!==id)), [])
  const reset = useCallback(() => { setData(seed); save(key, seed) }, [key, seed])
  return { data, add, update, remove, reset, setData }
}

export const SEED_GROUPS = [
  { id:'g1', nombre:'Inmuebles del Norte SA de CV', rfc:'INO180312A92', tipo_persona:'moral', representante:'Carlos Martínez López', telefono:'662-228-9988', email:'carlos@inmnorte.com', plan:'premium', notas:'Cliente fundador' },
  { id:'g2', nombre:'González Ramírez Juan', rfc:'GORJ750215BB1', tipo_persona:'fisica', representante:'', telefono:'662-119-2222', email:'juan.gonzalez@gmail.com', plan:'estandar', notas:'' },
  { id:'g3', nombre:'Fideicomiso Plaza Pitic 4421', rfc:'FPP160808X44', tipo_persona:'moral', representante:'Banco Aliado', telefono:'662-300-4421', email:'fideicomisos@bancoaliado.mx', plan:'estandar', notas:'' },
]

export const SEED_PROPERTIES = [
  { id:'1', grupo_id:'g1', parent_id:'', clave:'BOD-HMO-001', nombre:'Bodega Periférico Norte', direccion:'Carretera Internacional km 12', colonia:'Parque Industrial', ciudad:'Hermosillo', estado:'Sonora', cp:'83000', tipo:'bodega', uso_suelo:'Industrial', renta:32000, moneda:'USD', estatus:'rentada', fecha_adquisicion:'2018-03-15', valor_catastral:8420000, valor_comercial:12500000, superficie_terreno:3200, superficie_construccion:1840, altura_m:10.5, andenes:4, kva:300, voltaje:'220V trifásico', hvac:true, hvac_desc:'2 unidades 10 ton Carrier', sprinklers:true, estacionamientos:12, acceso_trailer:true, predial_anual:42000, notas:'', lat:29.1026, lng:-110.9747, imagenes:[] },
  { id:'2', grupo_id:'g3', parent_id:'', clave:'PLZ-HMO-001', nombre:'Plaza Pitic', direccion:'Blvd Solidaridad 287', colonia:'Pitic', ciudad:'Hermosillo', estado:'Sonora', cp:'83150', tipo:'complejo', uso_suelo:'Comercial H3', renta:0, moneda:'MXN', estatus:'rentada', fecha_adquisicion:'2015-06-01', valor_catastral:12000000, valor_comercial:18000000, superficie_terreno:2400, superficie_construccion:1200, altura_m:4, andenes:0, kva:200, voltaje:'220V trifásico', hvac:false, hvac_desc:'', sprinklers:true, estacionamientos:40, acceso_trailer:false, predial_anual:48000, notas:'Plaza comercial con 4 locales', lat:29.0729, lng:-110.9559, imagenes:[] },
  { id:'2a', grupo_id:'g3', parent_id:'2', clave:'PLZ-HMO-001-L1', nombre:'Plaza Pitic — Local 1', direccion:'Blvd Solidaridad 287, Local 1', colonia:'Pitic', ciudad:'Hermosillo', estado:'Sonora', cp:'83150', tipo:'local_comercial', uso_suelo:'Comercial', renta:22000, moneda:'MXN', estatus:'rentada', fecha_adquisicion:'2015-06-01', valor_catastral:0, valor_comercial:0, superficie_terreno:0, superficie_construccion:145, altura_m:3.5, andenes:0, kva:50, voltaje:'220V', hvac:true, hvac_desc:'1 mini split 3 ton', sprinklers:false, estacionamientos:0, acceso_trailer:false, predial_anual:0, notas:'', lat:0, lng:0, imagenes:[] },
  { id:'2b', grupo_id:'g3', parent_id:'2', clave:'PLZ-HMO-001-L2', nombre:'Plaza Pitic — Local 2', direccion:'Blvd Solidaridad 287, Local 2', colonia:'Pitic', ciudad:'Hermosillo', estado:'Sonora', cp:'83150', tipo:'local_comercial', uso_suelo:'Comercial', renta:18000, moneda:'MXN', estatus:'rentada', fecha_adquisicion:'2015-06-01', valor_catastral:0, valor_comercial:0, superficie_terreno:0, superficie_construccion:110, altura_m:3.5, andenes:0, kva:40, voltaje:'220V', hvac:true, hvac_desc:'1 mini split 2 ton', sprinklers:false, estacionamientos:0, acceso_trailer:false, predial_anual:0, notas:'', lat:0, lng:0, imagenes:[] },
  { id:'2c', grupo_id:'g3', parent_id:'2', clave:'PLZ-HMO-001-L3', nombre:'Plaza Pitic — Local 3', direccion:'Blvd Solidaridad 287, Local 3', colonia:'Pitic', ciudad:'Hermosillo', estado:'Sonora', cp:'83150', tipo:'local_comercial', uso_suelo:'Comercial', renta:15000, moneda:'MXN', estatus:'vacante', fecha_adquisicion:'2015-06-01', valor_catastral:0, valor_comercial:0, superficie_terreno:0, superficie_construccion:90, altura_m:3.5, andenes:0, kva:30, voltaje:'220V', hvac:false, hvac_desc:'', sprinklers:false, estacionamientos:0, acceso_trailer:false, predial_anual:0, notas:'2 prospectos activos', lat:0, lng:0, imagenes:[] },
  { id:'2d', grupo_id:'g3', parent_id:'2', clave:'PLZ-HMO-001-L4', nombre:'Plaza Pitic — Local 4', direccion:'Blvd Solidaridad 287, Local 4', colonia:'Pitic', ciudad:'Hermosillo', estado:'Sonora', cp:'83150', tipo:'local_comercial', uso_suelo:'Comercial', renta:19000, moneda:'MXN', estatus:'rentada', fecha_adquisicion:'2015-06-01', valor_catastral:0, valor_comercial:0, superficie_terreno:0, superficie_construccion:120, altura_m:3.5, andenes:0, kva:45, voltaje:'220V', hvac:true, hvac_desc:'1 mini split 3 ton', sprinklers:false, estacionamientos:0, acceso_trailer:false, predial_anual:0, notas:'', lat:0, lng:0, imagenes:[] },
  { id:'3', grupo_id:'g1', parent_id:'', clave:'BOD-HMO-005', nombre:'Nave Industrial Sonora', direccion:'Parque Industrial Sonora Lote 14', colonia:'Parque Industrial Sonora', ciudad:'Hermosillo', estado:'Sonora', cp:'83200', tipo:'bodega', uso_suelo:'Industrial', renta:45000, moneda:'USD', estatus:'rentada', fecha_adquisicion:'2019-01-10', valor_catastral:14200000, valor_comercial:22000000, superficie_terreno:5000, superficie_construccion:3200, altura_m:12, andenes:6, kva:500, voltaje:'440V trifásico', hvac:true, hvac_desc:'4 unidades industriales 15 ton', sprinklers:true, estacionamientos:20, acceso_trailer:true, predial_anual:68000, notas:'', lat:29.0889, lng:-110.9613, imagenes:[] },
  { id:'4', grupo_id:'g1', parent_id:'', clave:'RES-HMO-003', nombre:'Casa Lomas del Pitic', direccion:'Calle Río Yaqui 88', colonia:'Lomas del Pitic', ciudad:'Hermosillo', estado:'Sonora', cp:'83010', tipo:'residencial', uso_suelo:'Habitacional', renta:11500, moneda:'MXN', estatus:'rentada', fecha_adquisicion:'2021-05-20', valor_catastral:2800000, valor_comercial:3500000, superficie_terreno:350, superficie_construccion:220, altura_m:2.7, andenes:0, kva:15, voltaje:'127V monofásico', hvac:true, hvac_desc:'3 mini splits', sprinklers:false, estacionamientos:2, acceso_trailer:false, predial_anual:8400, notas:'', lat:29.0852, lng:-110.9711, imagenes:[] },
  { id:'5', grupo_id:'g2', parent_id:'', clave:'LOC-HMO-007', nombre:'Local Solidaridad 412', direccion:'Av. Solidaridad esq. Reforma', colonia:'Centro', ciudad:'Hermosillo', estado:'Sonora', cp:'83000', tipo:'local_comercial', uso_suelo:'Comercial', renta:18500, moneda:'MXN', estatus:'vacante', fecha_adquisicion:'2022-03-01', valor_catastral:2400000, valor_comercial:3200000, superficie_terreno:180, superficie_construccion:110, altura_m:3.2, andenes:0, kva:40, voltaje:'220V bifásico', hvac:false, hvac_desc:'', sprinklers:false, estacionamientos:3, acceso_trailer:false, predial_anual:14200, notas:'3 prospectos activos', lat:29.0693, lng:-110.9558, imagenes:[] },
  { id:'6', grupo_id:'g2', parent_id:'', clave:'BOD-HMO-008', nombre:'Bodega Sur Hermosillo', direccion:'Av. Industria 1240', colonia:'Zona Industrial', ciudad:'Hermosillo', estado:'Sonora', cp:'83120', tipo:'bodega', uso_suelo:'Industrial', renta:38000, moneda:'USD', estatus:'rentada', fecha_adquisicion:'2019-09-01', valor_catastral:9600000, valor_comercial:15000000, superficie_terreno:4000, superficie_construccion:2400, altura_m:11, andenes:4, kva:400, voltaje:'220V trifásico', hvac:true, hvac_desc:'3 unidades 12 ton', sprinklers:true, estacionamientos:14, acceso_trailer:true, predial_anual:52000, notas:'', lat:29.0562, lng:-110.9634, imagenes:[] },
  { id:'7', grupo_id:'g2', parent_id:'', clave:'LOC-HMO-005', nombre:'Local Comercial Juárez', direccion:'Blvd Juárez 450', colonia:'Centro', ciudad:'Hermosillo', estado:'Sonora', cp:'83000', tipo:'local_comercial', uso_suelo:'Comercial', renta:24000, moneda:'MXN', estatus:'rentada', fecha_adquisicion:'2021-02-10', valor_catastral:3600000, valor_comercial:5200000, superficie_terreno:250, superficie_construccion:180, altura_m:4, andenes:1, kva:75, voltaje:'220V bifásico', hvac:true, hvac_desc:'2 mini splits 2 ton', sprinklers:false, estacionamientos:6, acceso_trailer:false, predial_anual:22000, notas:'', lat:29.0710, lng:-110.9510, imagenes:[] },
  { id:'8', grupo_id:'g1', parent_id:'', clave:'RES-HMO-007', nombre:'Depto Valle Verde', direccion:'Blvd García Morales 2200-4B', colonia:'Valle Verde', ciudad:'Hermosillo', estado:'Sonora', cp:'83200', tipo:'residencial', uso_suelo:'Habitacional', renta:13500, moneda:'MXN', estatus:'rentada', fecha_adquisicion:'2022-08-01', valor_catastral:1800000, valor_comercial:2400000, superficie_terreno:0, superficie_construccion:95, altura_m:2.6, andenes:0, kva:10, voltaje:'127V monofásico', hvac:true, hvac_desc:'2 mini splits', sprinklers:false, estacionamientos:1, acceso_trailer:false, predial_anual:6200, notas:'', lat:29.1100, lng:-110.9800, imagenes:[] },
]

export const SEED_TENANTS = [
  { id:'1', nombre:'Logística Sonora SA de CV', rfc:'LSO180312A92', tipo_persona:'moral', contacto:'Ing. Pedro Salazar', telefono:'662-228-4400', email:'psalazar@logsonora.mx', propiedad_id:'1', notas:'' },
  { id:'2', nombre:'Andrea Velázquez Mendoza', rfc:'VEMA890215KS3', tipo_persona:'fisica', contacto:'Andrea Velázquez', telefono:'662-119-8834', email:'andrea@boutiqueandrea.com', propiedad_id:'2a', notas:'' },
  { id:'3', nombre:'Manufacturas Tier 2 SA de CV', rfc:'MTI200115R44', tipo_persona:'moral', contacto:'Lic. Jorge Castillo', telefono:'662-100-9988', email:'jcastillo@mtier2.mx', propiedad_id:'3', notas:'' },
  { id:'4', nombre:'Juan Vázquez Romero', rfc:'VARJ750115JN8', tipo_persona:'fisica', contacto:'Juan Vázquez', telefono:'662-447-2210', email:'jvazquez@gmail.com', propiedad_id:'4', notas:'' },
  { id:'5', nombre:'Distribuidora del Pacífico SA', rfc:'DPA190514LL8', tipo_persona:'moral', contacto:'Ing. Laura Bernal', telefono:'662-215-7700', email:'lbernal@distpacifico.mx', propiedad_id:'6', notas:'' },
  { id:'6', nombre:'La Cocina de Hermosillo SA', rfc:'LCH210405PP7', tipo_persona:'moral', contacto:'Chef Ramón Espinoza', telefono:'662-310-5500', email:'contacto@lacocinahmo.mx', propiedad_id:'7', notas:'' },
  { id:'7', nombre:'María Elena Almada Félix', rfc:'AAFM850320KK4', tipo_persona:'fisica', contacto:'María Elena Almada', telefono:'662-224-8801', email:'mealmada@hotmail.com', propiedad_id:'8', notas:'' },
  { id:'8', nombre:'Farmacia San José SA', rfc:'FSJ190215KK9', tipo_persona:'moral', contacto:'Lic. Roberto Sánchez', telefono:'662-220-3311', email:'rsanchez@farmsanjose.mx', propiedad_id:'2b', notas:'' },
  { id:'9', nombre:'Café Central SA de CV', rfc:'CCE220115PP8', tipo_persona:'moral', contacto:'Ana Luisa Moreno', telefono:'662-334-1100', email:'amoreno@cafecentral.mx', propiedad_id:'2d', notas:'' },
]

export const SEED_CONTRACTS = [
  { id:'1', propiedad_id:'1', inquilino_id:'1', tipo_contrato:'NNN', renta:32000, moneda:'USD', inicio:'2024-03-14', fin:'2027-03-14', escalacion:'INPC anual', deposito:64000, estatus:'vigente', notas:'' },
  { id:'2', propiedad_id:'2a', inquilino_id:'2', tipo_contrato:'Bruto', renta:22000, moneda:'MXN', inicio:'2024-03-10', fin:'2026-03-10', escalacion:'INPC anual', deposito:44000, estatus:'por_vencer', notas:'' },
  { id:'3', propiedad_id:'3', inquilino_id:'3', tipo_contrato:'NNN', renta:45000, moneda:'USD', inicio:'2025-01-01', fin:'2030-01-01', escalacion:'INPC + 2%', deposito:135000, estatus:'vigente', notas:'' },
  { id:'4', propiedad_id:'4', inquilino_id:'4', tipo_contrato:'Modificado neto', renta:11500, moneda:'MXN', inicio:'2024-08-01', fin:'2025-08-01', escalacion:'INPC anual', deposito:23000, estatus:'por_vencer', notas:'' },
  { id:'5', propiedad_id:'6', inquilino_id:'5', tipo_contrato:'NNN', renta:38000, moneda:'USD', inicio:'2023-09-01', fin:'2026-09-01', escalacion:'INPC anual', deposito:76000, estatus:'vigente', notas:'' },
  { id:'6', propiedad_id:'7', inquilino_id:'6', tipo_contrato:'Bruto', renta:24000, moneda:'MXN', inicio:'2025-02-20', fin:'2027-02-20', escalacion:'INPC anual', deposito:48000, estatus:'vigente', notas:'' },
  { id:'7', propiedad_id:'8', inquilino_id:'7', tipo_contrato:'Bruto', renta:13500, moneda:'MXN', inicio:'2024-10-01', fin:'2025-10-01', escalacion:'Fija 5% anual', deposito:27000, estatus:'vigente', notas:'' },
  { id:'8', propiedad_id:'2b', inquilino_id:'8', tipo_contrato:'Bruto', renta:18000, moneda:'MXN', inicio:'2023-01-15', fin:'2026-01-15', escalacion:'INPC anual', deposito:36000, estatus:'vigente', notas:'' },
  { id:'9', propiedad_id:'2d', inquilino_id:'9', tipo_contrato:'Bruto', renta:19000, moneda:'MXN', inicio:'2024-06-01', fin:'2027-06-01', escalacion:'INPC anual', deposito:38000, estatus:'vigente', notas:'' },
  // Historical contracts
  { id:'h1', propiedad_id:'1', inquilino_id:'', tipo_contrato:'NNN', renta:26000, moneda:'USD', inicio:'2018-06-01', fin:'2021-06-01', escalacion:'INPC anual', deposito:52000, estatus:'finalizado', notas:'Inquilino anterior: Distribuidora Ley SA' },
  { id:'h2', propiedad_id:'1', inquilino_id:'', tipo_contrato:'NNN', renta:28000, moneda:'USD', inicio:'2021-07-01', fin:'2024-03-01', escalacion:'INPC anual', deposito:56000, estatus:'finalizado', notas:'Inquilino anterior: Logística Baja SA' },
  { id:'h3', propiedad_id:'4', inquilino_id:'', tipo_contrato:'Bruto', renta:9500, moneda:'MXN', inicio:'2021-09-01', fin:'2024-07-31', escalacion:'Fija 4%', deposito:19000, estatus:'finalizado', notas:'Inquilino anterior: Familia López' },
]

export const SEED_MAINTENANCE = [
  { id:'1', propiedad_id:'1', titulo:'Fuga de agua en cisterna', tipo:'correctivo', prioridad:'urgente', proveedor:'Plomería Hermosillo', costo:3200, estatus:'en_proceso', fecha_reporte:'2026-02-22', fecha_prog:'', descripcion:'Fuga en cisterna principal' },
  { id:'2', propiedad_id:'3', titulo:'Mantenimiento HVAC trimestral', tipo:'preventivo', prioridad:'programada', proveedor:'Climas Norte SA', costo:4200, estatus:'programada', fecha_reporte:'2026-02-15', fecha_prog:'2026-02-27', descripcion:'4 unidades 15 ton' },
  { id:'3', propiedad_id:'2a', titulo:'Revisión eléctrica', tipo:'correctivo', prioridad:'normal', proveedor:'Eléctrica Sonora', costo:1200, estatus:'en_proceso', fecha_reporte:'2026-02-18', fecha_prog:'', descripcion:'Cortos intermitentes' },
  { id:'4', propiedad_id:'4', titulo:'Reparación plomería', tipo:'correctivo', prioridad:'normal', proveedor:'Plomería Hermosillo', costo:1800, estatus:'completada', fecha_reporte:'2026-02-10', fecha_prog:'', descripcion:'Fuga cocina' },
  { id:'5', propiedad_id:'1', titulo:'HVAC trimestral', tipo:'preventivo', prioridad:'programada', proveedor:'Climas Norte SA', costo:4200, estatus:'programada', fecha_reporte:'2026-02-20', fecha_prog:'2026-03-03', descripcion:'2 unidades 10 ton' },
]

export const SEED_COLLECTIONS = [
  { id:'1', propiedad_id:'1', inquilino_id:'1', renta:32000, moneda:'USD', fecha_vencimiento:'2026-02-05', fecha_pago:'2026-02-04', estatus:'pagado', cfdi_folio:'2026-147' },
  { id:'2', propiedad_id:'2a', inquilino_id:'2', renta:22000, moneda:'MXN', fecha_vencimiento:'2026-02-10', fecha_pago:'2026-02-09', estatus:'pagado', cfdi_folio:'2026-148' },
  { id:'3', propiedad_id:'3', inquilino_id:'3', renta:45000, moneda:'USD', fecha_vencimiento:'2026-02-15', fecha_pago:'2026-02-14', estatus:'pagado', cfdi_folio:'2026-146' },
  { id:'4', propiedad_id:'4', inquilino_id:'4', renta:11500, moneda:'MXN', fecha_vencimiento:'2026-02-01', fecha_pago:'2026-01-28', estatus:'pagado', cfdi_folio:'2026-140' },
  { id:'5', propiedad_id:'6', inquilino_id:'5', renta:38000, moneda:'USD', fecha_vencimiento:'2026-02-01', fecha_pago:'2026-02-01', estatus:'pagado', cfdi_folio:'2026-139' },
  { id:'6', propiedad_id:'7', inquilino_id:'6', renta:24000, moneda:'MXN', fecha_vencimiento:'2026-02-20', fecha_pago:'', estatus:'pendiente', cfdi_folio:'' },
  { id:'7', propiedad_id:'8', inquilino_id:'7', renta:13500, moneda:'MXN', fecha_vencimiento:'2026-02-01', fecha_pago:'2026-02-01', estatus:'pagado', cfdi_folio:'2026-138' },
  { id:'8', propiedad_id:'2b', inquilino_id:'8', renta:18000, moneda:'MXN', fecha_vencimiento:'2026-02-15', fecha_pago:'2026-02-15', estatus:'pagado', cfdi_folio:'2026-150' },
  { id:'9', propiedad_id:'2d', inquilino_id:'9', renta:19000, moneda:'MXN', fecha_vencimiento:'2026-02-05', fecha_pago:'2026-02-05', estatus:'pagado', cfdi_folio:'2026-149' },
]

export const SEED_PROVIDERS = [
  { id:'1', nombre:'Climas Norte SA', contacto:'Ing. Eduardo Ramírez', telefono:'662-228-9988', email:'eramirez@climasnorte.mx', rfc:'CNO150823QQ2', especialidades:['HVAC','Refrigeración','Clima industrial'], certificaciones:['EPA 608','CONAGUA'], calificacion:4.9, servicios_realizados:12, tarifa_promedio:'$2,400/visita', tiempo_respuesta:'< 4 hrs', notas:'Contrato anual' },
  { id:'2', nombre:'Plomería Hermosillo', contacto:'Sr. Manuel Castro', telefono:'662-100-7766', email:'mcastro@plomhmo.mx', rfc:'SHN200115R44', especialidades:['Plomería','Drenaje','Cisternas','24/7'], certificaciones:['CONAGUA'], calificacion:4.6, servicios_realizados:18, tarifa_promedio:'$850/servicio', tiempo_respuesta:'< 2 hrs', notas:'' },
  { id:'3', nombre:'Eléctrica Sonora', contacto:'Ing. Patricia López', telefono:'662-447-2200', email:'plopez@elsonora.mx', rfc:'EIS180412KK7', especialidades:['Eléctrica industrial','Tableros','CFE'], certificaciones:['Verificador CFE','NOM-001-SEDE'], calificacion:4.8, servicios_realizados:14, tarifa_promedio:'$1,200/servicio', tiempo_respuesta:'< 6 hrs', notas:'' },
  { id:'4', nombre:'Servifumi del Pacífico', contacto:'Sr. Jorge Beltrán', telefono:'662-228-4400', email:'jbeltran@servifumi.mx', rfc:'SFP170823MM4', especialidades:['Fumigación','Control de plagas'], certificaciones:['COFEPRIS','SEMARNAT'], calificacion:4.7, servicios_realizados:24, tarifa_promedio:'$650/visita', tiempo_respuesta:'24 hrs', notas:'' },
  { id:'5', nombre:'Seguridad Integral Norte', contacto:'Cmdte. Roberto Salinas', telefono:'662-441-9900', email:'rsalinas@segnorte.mx', rfc:'SIN180815PP2', especialidades:['Alarmas','CCTV','Sprinklers'], certificaciones:['SSP Sonora','NOM-002-STPS'], calificacion:4.7, servicios_realizados:5, tarifa_promedio:'$1,800/servicio', tiempo_respuesta:'< 12 hrs', notas:'' },
]

export const SEED_DOCUMENTS = [
  { id:'1', propiedad_id:'1', tipo_doc:'escritura', nombre:'Escritura BOD-HMO-001', descripcion:'Notaría 23 · vol 4421', fecha:'2018-02-14' },
  { id:'2', propiedad_id:'1', tipo_doc:'contrato', nombre:'Contrato Logística Sonora', descripcion:'NNN 3 años', fecha:'2024-03-14' },
  { id:'3', propiedad_id:'1', tipo_doc:'permiso', nombre:'Permiso uso de suelo', descripcion:'Vence dic 2026', fecha:'2024-01-15' },
  { id:'4', propiedad_id:'2', tipo_doc:'escritura', nombre:'Escritura Plaza Pitic', descripcion:'Notaría 15', fecha:'2015-06-01' },
  { id:'5', propiedad_id:'3', tipo_doc:'escritura', nombre:'Escritura BOD-HMO-005', descripcion:'Notaría 31', fecha:'2019-01-10' },
  { id:'6', propiedad_id:'6', tipo_doc:'poliza', nombre:'Póliza seguro BOD-HMO-008', descripcion:'GNP · vence mar 2027', fecha:'2025-03-01' },
]

export const SEED_ASSETS = [
  { id:'a1', propiedad_id:'1', nombre:'Sistema HVAC Carrier (2 unidades)', categoria:'HVAC', valor_original:180000, fecha_adquisicion:'2020-03-15', vida_util_anios:10, depreciacion_anual:18000, valor_actual:72000, mantenimiento_preventivo:'Servicio trimestral', prox_mantenimiento:'2026-03-03', notas:'2 unidades de 10 toneladas' },
  { id:'a2', propiedad_id:'1', nombre:'Portón eléctrico industrial', categoria:'Infraestructura', valor_original:85000, fecha_adquisicion:'2018-03-15', vida_util_anios:15, depreciacion_anual:5667, valor_actual:39667, mantenimiento_preventivo:'Revisión semestral', prox_mantenimiento:'2026-06-15', notas:'' },
  { id:'a3', propiedad_id:'3', nombre:'Sistema HVAC Industrial (4 unidades)', categoria:'HVAC', valor_original:420000, fecha_adquisicion:'2019-06-01', vida_util_anios:10, depreciacion_anual:42000, valor_actual:140000, mantenimiento_preventivo:'Servicio trimestral', prox_mantenimiento:'2026-02-27', notas:'4 unidades de 15 ton' },
  { id:'a4', propiedad_id:'3', nombre:'Sistema sprinklers', categoria:'Seguridad', valor_original:250000, fecha_adquisicion:'2019-06-01', vida_util_anios:20, depreciacion_anual:12500, valor_actual:162500, mantenimiento_preventivo:'Inspección anual', prox_mantenimiento:'2026-06-01', notas:'Cumple NOM-002-STPS' },
  { id:'a5', propiedad_id:'6', nombre:'Subestación eléctrica 400 KVA', categoria:'Eléctrico', valor_original:320000, fecha_adquisicion:'2019-09-01', vida_util_anios:25, depreciacion_anual:12800, valor_actual:236800, mantenimiento_preventivo:'Servicio anual', prox_mantenimiento:'2026-09-01', notas:'' },
  { id:'a6', propiedad_id:'2', nombre:'Sistema CCTV 16 cámaras', categoria:'Seguridad', valor_original:48000, fecha_adquisicion:'2023-01-15', vida_util_anios:5, depreciacion_anual:9600, valor_actual:19200, mantenimiento_preventivo:'Revisión semestral', prox_mantenimiento:'2026-07-15', notas:'Incluye DVR y 4TB almacenamiento' },
]

export const SEEDS = { groups: SEED_GROUPS, properties: SEED_PROPERTIES, tenants: SEED_TENANTS, contracts: SEED_CONTRACTS, maintenance: SEED_MAINTENANCE, collections: SEED_COLLECTIONS, providers: SEED_PROVIDERS, documents: SEED_DOCUMENTS, assets: SEED_ASSETS }

export function fmt(n) { return '$' + Math.round(Number(n) || 0).toLocaleString('es-MX') }
export function fmtDate(d) { if (!d) return '—'; const dt = new Date(d+'T12:00:00'); return dt.toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'}) }
export const INCOME_CHART = [{mes:'Sep',ingresos:148400},{mes:'Oct',ingresos:155200},{mes:'Nov',ingresos:161800},{mes:'Dic',ingresos:158100},{mes:'Ene',ingresos:172400},{mes:'Feb',ingresos:186600}]
