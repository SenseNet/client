import { ODataCollectionResponse } from '@sensenet/client-core'
import { debounce } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useContext, useEffect, useState } from 'react'
import Semaphore from 'semaphore-async-await'
import { useInjector, useLogger, useRepository } from '../hooks'
import { CurrentContentContext } from './CurrentContent'
export const CurrentAncestorsContext = React.createContext<GenericContent[]>([])

export const CurrentAncestorsProvider: React.FunctionComponent = props => {
  const currentContent = useContext(CurrentContentContext)
  const [loadLock] = useState(new Semaphore(1))

  const [ancestors, setAncestors] = useState<GenericContent[]>([])
  const repo = useRepository()
  const injector = useInjector()
  const eventHub = injector.getEventHub(repo.configuration.repositoryUrl)
  const [reloadToken, setReloadToken] = useState(1)

  const logger = useLogger('CurrentAncestorsProvider')

  const requestReload = debounce(() => setReloadToken(Math.random()), 100)

  useEffect(() => {
    const subscriptions = [
      eventHub.onContentModified.subscribe(mod => {
        if (ancestors.map(a => a.Id).includes(mod.content.Id)) {
          requestReload()
        }
      }),
      eventHub.onContentMoved.subscribe(move => {
        if (ancestors.map(a => a.Id).includes(move.content.Id)) {
          requestReload()
        }
      }),
      eventHub.onContentDeleted.subscribe(del => {
        if (ancestors.map(a => a.Id).includes(del.contentData.Id)) {
          requestReload()
        }
      }),
    ]
    return () => subscriptions.forEach(s => s.dispose())
  }, [
    ancestors,
    eventHub.onContentDeleted,
    eventHub.onContentModified,
    eventHub.onContentMoved,
    repo.configuration.repositoryUrl,
    requestReload,
  ])
  const [error, setError] = useState<Error | undefined>()

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        await loadLock.acquire()
        const ancestorsResult = await repo.executeAction<undefined, ODataCollectionResponse<GenericContent>>({
          idOrPath: currentContent.Id,
          method: 'GET',
          name: 'Ancestors',
          body: undefined,
          requestInit: {
            signal: ac.signal,
          },
          oDataOptions: {
            orderby: [['Path', 'asc']],
          },
        })
        setAncestors(ancestorsResult.d.results)
      } catch (err) {
        if (!ac.signal.aborted) {
          setError(err)
        }
      } finally {
        loadLock.release()
      }
    })()
    return () => ac.abort()
  }, [currentContent.Id, loadLock, reloadToken, repo])

  if (error) {
    logger.warning({
      message: `Error loading ancestors. ${error.toString()}`,
      data: { details: { error }, relatedContent: currentContent, relatedRepository: repo.configuration.repositoryUrl },
    })
  }
  return <CurrentAncestorsContext.Provider value={ancestors}>{props.children}</CurrentAncestorsContext.Provider>
}
