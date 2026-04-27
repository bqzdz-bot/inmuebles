import { createContext, useContext } from 'react'
import { useStore, SEEDS } from './store'
const Ctx = createContext(null)
export function DataProvider({ children }) {
  const groups = useStore('groups', SEEDS.groups)
  const properties = useStore('properties', SEEDS.properties)
  const tenants = useStore('tenants', SEEDS.tenants)
  const contracts = useStore('contracts', SEEDS.contracts)
  const maintenance = useStore('maintenance', SEEDS.maintenance)
  const collections = useStore('collections', SEEDS.collections)
  const providers = useStore('providers', SEEDS.providers)
  const documents = useStore('documents', SEEDS.documents)
  const assets = useStore('assets', SEEDS.assets)
  const resetAll = () => { Object.values({groups,properties,tenants,contracts,maintenance,collections,providers,documents,assets}).forEach(s=>s.reset()) }
  return <Ctx.Provider value={{ groups,properties,tenants,contracts,maintenance,collections,providers,documents,assets,resetAll }}>{children}</Ctx.Provider>
}
export function useData() { const c = useContext(Ctx); if (!c) throw new Error('wrap in DataProvider'); return c }
