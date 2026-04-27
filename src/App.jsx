import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { DataProvider } from './data/DataContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Empresas from './pages/Empresas'
import Propiedades from './pages/Propiedades'
import PropiedadDetalle from './pages/PropiedadDetalle'
import Inquilinos from './pages/Inquilinos'
import Contratos from './pages/Contratos'
import Cobranza from './pages/Cobranza'
import Mantenimiento from './pages/Mantenimiento'
import Proveedores from './pages/Proveedores'
import Documentos from './pages/Documentos'
import Reportes from './pages/Reportes'
import { ClientDashboard, ClientPropiedades, ClientPropDetalle, ClientFinanzas, ClientDocumentos } from './pages/ClientPortal'

function Layout() {
  return <div className="min-h-screen flex"><Sidebar /><main className="flex-1 ml-[210px] p-6 min-w-0"><Outlet /></main></div>
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="propiedades" element={<Propiedades />} />
            <Route path="propiedades/:id" element={<PropiedadDetalle />} />
            <Route path="inquilinos" element={<Inquilinos />} />
            <Route path="contratos" element={<Contratos />} />
            <Route path="cobranza" element={<Cobranza />} />
            <Route path="mantenimiento" element={<Mantenimiento />} />
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="cliente" element={<ClientDashboard />} />
            <Route path="cliente/propiedades" element={<ClientPropiedades />} />
            <Route path="cliente/propiedades/:id" element={<ClientPropDetalle />} />
            <Route path="cliente/finanzas" element={<ClientFinanzas />} />
            <Route path="cliente/documentos" element={<ClientDocumentos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}
