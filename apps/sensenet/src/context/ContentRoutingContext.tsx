import React, { useContext, useEffect, useState } from 'react'
import { ContentContextProvider } from '../services/ContentContextProvider'
import { RepositoryContext } from './RepositoryContext'
export const ContentRoutingContext = React.createContext(null as any)
export const ContentRoutingContextProvider: React.FunctionComponent = props => {
  const repo = useContext(RepositoryContext)
  const [ctxProvider, setCtxProvider] = useState(new ContentContextProvider(repo))

  useEffect(() => {
    setCtxProvider(new ContentContextProvider(repo))
  }, [repo])

  return <ContentRoutingContext.Provider value={ctxProvider}>{props.children}</ContentRoutingContext.Provider>
}
