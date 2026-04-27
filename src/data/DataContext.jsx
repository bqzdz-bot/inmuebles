import { createContext, useContext } from 'react'
import { useStore } from './store'

const Ctx = createContext(null)

export function DataProvider({ children }) {
  const groups = useStore('grupos')
  const properties = useStore('propiedades')
  const tenants = useStore('inquilinos')
  const contracts = useStore('contratos')
  const maintenance = useStore('mantenimiento')
  const collections = useStore('cobranza')
  const providers = useStore('proveedores')
  const documents = useStore('documentos')
  const assets = useStore('activos')

  const loading = groups.loading || properties.loading || tenants.loading

  const resetAll = () => {
    groups.reset(); properties.reset(); tenants.reset(); contracts.reset()
    maintenance.reset(); collections.reset(); providers.reset(); documents.reset(); assets.reset()
  }

  return (
    <Ctx.Provider value={{ groups, properties, tenants, contracts, maintenance, collections, providers, documents, assets, resetAll, loading }}>
      {children}
    </Ctx.Provider>
  )
}

export function useData() {
  const c = useContext(Ctx)
  if (!c) throw new Error('wrap in DataProvider')
  return c
}
