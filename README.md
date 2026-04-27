# Activos Inmuebles MX — Software de Administración de Propiedades

Software funcional con datos demo. Puedes agregar, editar y eliminar registros.
Los datos se guardan en tu navegador (no necesitas base de datos).

## Cómo instalarlo

### Paso 1 — Instalar Node.js (solo la primera vez)
Ve a https://nodejs.org y descarga la versión LTS. Instálalo normalmente.

### Paso 2 — Descomprime este zip
Ponlo en tu escritorio o donde quieras.

### Paso 3 — Abre la Terminal
- **Windows**: busca "PowerShell" en el menú inicio
- **Mac**: busca "Terminal" en Spotlight

### Paso 4 — Ejecuta estos 3 comandos
```
cd ruta/a/inmuebles
npm install
npm run dev
```

### Paso 5 — Abre el navegador
Ve a: http://localhost:5173

¡Listo! Ya puedes usar el software.

Para apagarlo: presiona Ctrl+C en la terminal.

---

## ¿Qué puedo hacer?

### 9 Módulos incluidos:

| Módulo | Ruta | ¿Qué puedo hacer? |
|--------|------|--------------------|
| Dashboard | `/` | Ver KPIs, gráficas y alertas del portafolio |
| Propiedades | `/propiedades` | **Crear, editar, eliminar** propiedades con expediente completo |
| Inquilinos | `/inquilinos` | **Crear, editar, eliminar** inquilinos con RFC y contacto |
| Contratos | `/contratos` | **Crear, editar, eliminar** contratos NNN/Bruto/Mod. neto |
| Mantenimiento | `/mantenimiento` | **Crear, editar, eliminar** órdenes de servicio |
| Cobranza | `/cobranza` | **Registrar pagos**, marcar estatus, folios CFDI |
| Proveedores | `/proveedores` | **Crear, editar, eliminar** proveedores con especialidades y certificaciones |
| Documentos | `/documentos` | **Registrar** escrituras, contratos, permisos, CFDIs |
| Reportes | `/reportes` | Ver gráficas de ingreso, ocupación, distribución |

### Funcionalidades:
- **Agregar**: botón "+ Nuevo" en cada módulo abre un formulario completo
- **Editar**: ícono de lápiz al pasar el mouse sobre cualquier fila
- **Eliminar**: ícono de basura con confirmación
- **Ver detalle**: ícono de ojo en propiedades (expediente completo)
- **Filtrar**: chips de filtro por tipo, estatus, etc.
- **Buscar**: barra de búsqueda en propiedades
- **Datos persistentes**: todo se guarda en tu navegador entre sesiones
- **Reiniciar**: botón al fondo del sidebar para volver a los datos demo

### Datos demo incluidos:
- 8 propiedades (bodegas, locales, residencial) en Hermosillo
- 7 inquilinos con RFC real
- 7 contratos con modalidad NNN, Bruto, Modificado neto
- 5 órdenes de mantenimiento
- 7 registros de cobranza
- 7 proveedores con especialidades y certificaciones
- 7 documentos (escrituras, contratos, permisos)
