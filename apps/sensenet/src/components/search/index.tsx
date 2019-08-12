import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Save from '@material-ui/icons/Save'
import { ConstantContent, ODataResponse } from '@sensenet/client-core'
import { debounce } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useContext, useEffect, useState } from 'react'
import { generatePath, RouteComponentProps, withRouter } from 'react-router'
import Semaphore from 'semaphore-async-await'
import {
  CurrentAncestorsContext,
  CurrentChildrenContext,
  CurrentContentContext,
  LoadSettingsContext,
  ResponsivePersonalSetttings,
} from '../../context'
import { useContentRouting, useLocalization, useLogger, useRepository } from '../../hooks'
import { CollectionComponent } from '../content-list'

const loadCount = 20
export interface QueryData {
  term: string
  title?: string
  hideSearchBar?: boolean
  fieldsToDisplay?: Array<keyof GenericContent>
}

export const encodeQueryData = (data: QueryData) => encodeURIComponent(btoa(JSON.stringify(data)))
export const decodeQueryData = (encoded?: string) =>
  encoded ? (JSON.parse(atob(decodeURIComponent(encoded))) as QueryData) : { term: '' }

const Search: React.FunctionComponent<RouteComponentProps<{ queryData?: string }>> = props => {
  const repo = useRepository()
  const contentRouter = useContentRouting()

  const logger = useLogger('Search')
  const [queryData, setQueryData] = useState<QueryData>(decodeQueryData(props.match.params.queryData))

  const localization = useLocalization().search
  const [reloadToken, setReloadToken] = useState(Math.random())
  const [scrollToken, setScrollToken] = useState(Math.random())
  const [scrollLock] = useState(new Semaphore(1))
  const [requestReload] = useState(() => debounce(() => setReloadToken(Math.random()), 250))

  useEffect(() => {
    try {
      const data = decodeQueryData(props.match.params.queryData || '{}')
      setQueryData(data)
    } catch (error) {
      logger.warning({ message: 'Wrong link :(' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logger, props.match.params.queryData])

  const [requestScroll] = useState(() =>
    debounce((div: HTMLDivElement, total: number, loaded: number, update: (token: number) => void) => {
      const table = div.querySelector('table')
      if (table && total > loaded && table.getBoundingClientRect().bottom <= window.innerHeight) {
        update(Math.random())
      }
    }, 250),
  )

  const [result, setResult] = useState<GenericContent[]>([])
  const [count, setCount] = useState(0)
  const loadSettingsContext = useContext(LoadSettingsContext)
  const personalSettings = useContext(ResponsivePersonalSetttings)
  const [isSaveOpened, setIsSaveOpened] = useState(false)
  const [error, setError] = useState('')

  const [saveName, setSaveName] = useState('')
  const [savePublic, setSavePublic] = useState(false)

  useEffect(() => {
    setResult([])
    props.history.push(generatePath(props.match.path, { ...props.match.params, queryData: encodeQueryData(queryData) }))
    repo
      .loadCollection({
        path: ConstantContent.PORTAL_ROOT.Path,
        oDataOptions: {
          ...loadSettingsContext.loadChildrenSettings,
          query: personalSettings.commandPalette.wrapQuery.replace('{0}', queryData.term),
          top: loadCount,
        },
      })
      .then(r => {
        setError('')
        setResult(r.d.results)
        setCount(r.d.__count)
      })
      .catch(e => {
        setError(e.message)
        setResult([])
        logger.warning({ message: 'Error executing search', data: { details: { error: e }, isDismissed: true } })
      })
    // loadSettings should be excluded :(
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reloadToken,
    queryData.term,
    repo,
    personalSettings.commandPalette.wrapQuery,
    logger,
    // props.history.location,
    // props.match.path,
    // props.match.params,
    queryData,
    // loadSettingsContext.loadChildrenSettings,
  ])

  useEffect(() => {
    ;(async () => {
      try {
        await scrollLock.acquire()
        const response = await repo.loadCollection({
          path: ConstantContent.PORTAL_ROOT.Path,
          oDataOptions: {
            ...loadSettingsContext.loadChildrenSettings,
            query: personalSettings.commandPalette.wrapQuery.replace('{0}', queryData.term),
            top: loadCount,
            skip: result.length,
          },
        })
        setResult([...result, ...response.d.results])
        setCount(response.d.__count)
      } finally {
        scrollLock.release()
      }
    })()
    // Infinite loader fx, only lock-related stuff should be included as dependency!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollLock, scrollToken])

  return (
    <div style={{ padding: '1em', margin: '1em', height: '100%', width: '100%' }}>
      <Typography variant="h5">{queryData.title || localization.title}</Typography>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {queryData.hideSearchBar ? null : (
          <div style={{ marginLeft: '1em', width: '100%', display: 'flex' }}>
            <TextField
              label={localization.queryLabel}
              helperText={localization.queryHelperText}
              defaultValue={queryData.term}
              fullWidth={true}
              onChange={ev => {
                if (queryData.term !== ev.target.value) {
                  setQueryData({ ...queryData, term: ev.target.value })
                }
                // setContentQuery(ev.target.value)
                requestReload()
              }}
            />
            <Button
              style={{ flexShrink: 0 }}
              title={localization.saveQuery}
              onClick={() => {
                setIsSaveOpened(true)
                setSaveName(`Search results for '${queryData.term}'`)
              }}>
              <Save style={{ marginRight: 8 }} />
              {localization.saveQuery}
            </Button>
            <Dialog open={isSaveOpened} onClose={() => setIsSaveOpened(false)}>
              <DialogTitle>{localization.saveQuery}</DialogTitle>
              <DialogContent style={{ minWidth: 450 }}>
                <TextField
                  fullWidth={true}
                  defaultValue={`Search results for '${queryData.term}'`}
                  onChange={ev => setSaveName(ev.currentTarget.value)}
                />
                <br />
                <FormControlLabel
                  label={localization.public}
                  control={<Checkbox onChange={ev => setSavePublic(ev.target.checked)} />}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsSaveOpened(false)}>{localization.cancel}</Button>
                <Button
                  onClick={() => {
                    repo
                      .executeAction<any, ODataResponse<GenericContent>>({
                        idOrPath:
                          repo.authentication.currentUser.getValue().ProfilePath || ConstantContent.PORTAL_ROOT.Path,
                        name: 'SaveQuery',
                        method: 'POST',
                        oDataOptions: {
                          select: ['DisplayName', 'Query'],
                        },
                        body: {
                          query: queryData.term,
                          displayName: saveName,
                          queryType: savePublic ? 'Public' : 'Private',
                        },
                      })
                      .then(c => {
                        setIsSaveOpened(false)
                        logger.information({
                          message: `Query '${c.d.DisplayName || c.d.Name}' saved`,
                          data: { relatedContent: c.d, details: c },
                        })
                      })
                  }}
                  color="primary">
                  {localization.save}
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}
      </div>

      {error ? (
        <Typography color="error" variant="subtitle1" style={{ margin: '1em' }}>
          {error}
        </Typography>
      ) : null}

      <CurrentContentContext.Provider value={ConstantContent.PORTAL_ROOT}>
        <CurrentChildrenContext.Provider value={result}>
          <CurrentAncestorsContext.Provider value={[]}>
            <CollectionComponent
              style={{
                height: 'calc(100% - 75px)',
                overflow: 'auto',
              }}
              containerProps={{
                onScroll: ev => requestScroll(ev.currentTarget, count, result.length, setScrollToken),
              }}
              enableBreadcrumbs={false}
              fieldsToDisplay={queryData.fieldsToDisplay}
              parentIdOrPath={0}
              onParentChange={p => {
                props.history.push(contentRouter.getPrimaryActionUrl(p))
              }}
              onActivateItem={p => {
                props.history.push(contentRouter.getPrimaryActionUrl(p))
              }}
              onTabRequest={() => {
                /** */
              }}
            />
          </CurrentAncestorsContext.Provider>
        </CurrentChildrenContext.Provider>
      </CurrentContentContext.Provider>
    </div>
  )
}

export default withRouter(Search)
