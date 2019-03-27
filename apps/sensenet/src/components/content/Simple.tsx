import { ConstantContent } from '@sensenet/client-core'
import React, { useContext, useEffect, useState } from 'react'
import { matchPath, RouteComponentProps, withRouter } from 'react-router'
import { ContentRoutingContext } from '../../context/ContentRoutingContext'
import { CurrentAncestorsProvider } from '../../context/CurrentAncestors'
import { CurrentChildrenProvider } from '../../context/CurrentChildren'
import { CurrentContentProvider } from '../../context/CurrentContent'
import { LoadSettingsContextProvider } from '../../context/LoadSettingsContext'
import { AddButton } from '../AddButton'
import { CollectionComponent } from '../ContentListPanel'
import { CommanderRouteParams } from './Commander'

export const SimpleListComponent: React.FunctionComponent<RouteComponentProps<{ folderId?: string }>> = props => {
  const getLeftFromPath = (params: CommanderRouteParams) =>
    parseInt(params.folderId as string, 10) || ConstantContent.PORTAL_ROOT.Id
  const [leftParentId, setLeftParentId] = useState(getLeftFromPath(props.match.params))
  const ctx = useContext(ContentRoutingContext)

  useEffect(() => {
    const historyChangeListener = props.history.listen(location => {
      const match = matchPath(location.pathname, props.match.path)
      if (match) {
        if (getLeftFromPath(match.params) !== leftParentId) {
          setLeftParentId(getLeftFromPath(match.params))
        }
      }
    })
    return () => {
      historyChangeListener()
    }
  }, [leftParentId])

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <LoadSettingsContextProvider>
        <CurrentContentProvider idOrPath={leftParentId}>
          <CurrentChildrenProvider>
            <CurrentAncestorsProvider>
              <CollectionComponent
                enableBreadcrumbs={true}
                onActivateItem={item => {
                  props.history.push(ctx.getPrimaryActionUrl(item))
                }}
                style={{ flexGrow: 1, flexShrink: 0, maxHeight: '100%', width: '100%' }}
                onParentChange={p => {
                  setLeftParentId(p.Id)
                  props.history.push(ctx.getPrimaryActionUrl(p))
                }}
                parentId={leftParentId}
                onTabRequest={() => {
                  /** */
                }}
              />
              <AddButton />
            </CurrentAncestorsProvider>
          </CurrentChildrenProvider>
        </CurrentContentProvider>
      </LoadSettingsContextProvider>
    </div>
  )
}

const connected = withRouter(SimpleListComponent)
export { connected as SimpleList }
