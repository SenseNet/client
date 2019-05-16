import { ConstantContent } from '@sensenet/client-core'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useContext, useEffect, useState } from 'react'
import { matchPath, RouteComponentProps, withRouter } from 'react-router'
import {
  ContentRoutingContext,
  CurrentAncestorsProvider,
  CurrentChildrenProvider,
  CurrentContentContext,
  CurrentContentProvider,
  InjectorContext,
  LoadSettingsContextProvider,
  RepositoryContext,
} from '../../context'
import { SelectionService } from '../../services/SelectionService'
import { AddButton } from '../AddButton'
import { AddDialog } from '../AddDialog'
import { CollectionComponent } from '../ContentListPanel'
import { CopyMoveDialog } from '../CopyMoveDialog'

export interface CommanderRouteParams {
  folderId?: string
  rightParent?: string
}

export const Commander: React.FunctionComponent<RouteComponentProps<CommanderRouteParams>> = props => {
  const ctx = useContext(ContentRoutingContext)
  const repo = useContext(RepositoryContext)

  const selectionService = useContext(InjectorContext).getInstance(SelectionService)

  const getLeftFromPath = (params: CommanderRouteParams) =>
    parseInt(params.folderId as string, 10) || ConstantContent.PORTAL_ROOT.Id
  const getRightFromPath = (params: CommanderRouteParams) =>
    parseInt(params.rightParent as string, 10) || ConstantContent.PORTAL_ROOT.Id

  const [leftParentId, setLeftParentId] = useState(getLeftFromPath(props.match.params))
  const [rightParentId, setRightParentId] = useState(getRightFromPath(props.match.params))

  const [_leftPanelRef, setLeftPanelRef] = useState<null | any>(null)
  const [_rightPanelRef, setRightPanelRef] = useState<null | any>(null)

  const [activePanel, setActivePanel] = useState<'left' | 'right'>('left')
  const [activeParent, setActiveParent] = useState<GenericContent>(null as any)

  useEffect(() => {
    const historyChangeListener = props.history.listen(location => {
      const match = matchPath(location.pathname, props.match.path)
      if (match) {
        if (getLeftFromPath(match.params) !== leftParentId) {
          setLeftParentId(getLeftFromPath(match.params))
        }
        if (getRightFromPath(match.params) !== rightParentId) {
          setRightParentId(getRightFromPath(match.params))
        }
      }
    })
    return () => {
      historyChangeListener()
    }
  }, [leftParentId, rightParentId])

  useEffect(() => {
    if (
      props.match.params.folderId !== leftParentId.toString() ||
      props.match.params.rightParent !== rightParentId.toString()
    ) {
      props.history.push(`/${btoa(repo.configuration.repositoryUrl)}/browse/${leftParentId}/${rightParentId}`)
    }
  }, [leftParentId, rightParentId])

  const [isCopyOpened, setIsCopyOpened] = useState(false)
  const [copyMoveOperation, setCopyMoveOperation] = useState<'copy' | 'move'>('copy')
  const [copySelection, setCopySelection] = useState<GenericContent[]>([ConstantContent.PORTAL_ROOT])
  const [copyParent, setCopyParent] = useState<GenericContent>(ConstantContent.PORTAL_ROOT)
  const [leftParent, setLeftParent] = useState<GenericContent>(ConstantContent.PORTAL_ROOT)
  const [rightParent, setRightParent] = useState<GenericContent>(ConstantContent.PORTAL_ROOT)

  const [leftSelection, setLeftSelection] = useState<GenericContent[]>([])

  const [rightSelection, setRightSelection] = useState<GenericContent[]>([])

  const [isAddDialogOpened, setIsAddDialogOpened] = useState(false)

  useEffect(() => {
    activePanel === 'left' ? setActiveParent(leftParent) : setActiveParent(rightParent)
  }, [leftParent, rightParent, activePanel])

  return (
    <div
      onKeyDown={async ev => {
        if ((ev.key === 'F5' || ev.key === 'F6') && !ev.shiftKey) {
          ev.preventDefault()
          ev.stopPropagation()
          if (activePanel === 'left') {
            setCopySelection(leftSelection)
            setCopyParent(rightParent)
          } else {
            setCopySelection(rightSelection)
            setCopyParent(leftParent)
          }
          if (copySelection && copySelection.length && copyParent) {
            setCopyMoveOperation(ev.key === 'F5' ? 'copy' : 'move')
            setIsCopyOpened(true)
          }
        } else if (ev.key === 'F7') {
          ev.preventDefault()
          ev.stopPropagation()
          setIsAddDialogOpened(true)
        }
      }}
      style={{ display: 'flex', width: '100%', height: '100%' }}>
      <LoadSettingsContextProvider>
        <CurrentContentProvider idOrPath={leftParentId}>
          <CurrentContentContext.Consumer>
            {lp => {
              setLeftParent(lp)
              return null
            }}
          </CurrentContentContext.Consumer>
          <CurrentChildrenProvider>
            <CurrentAncestorsProvider>
              <CollectionComponent
                onFocus={() => {
                  setActivePanel('left')
                }}
                enableBreadcrumbs={true}
                onActivateItem={item => {
                  props.history.push(ctx.getPrimaryActionUrl(item))
                }}
                containerRef={r => setLeftPanelRef(r)}
                style={{ width: '100%', maxHeight: '100%' }}
                parentId={leftParentId}
                onParentChange={p => {
                  setLeftParentId(p.Id)
                }}
                onSelectionChange={sel => {
                  setLeftSelection(sel)
                  selectionService.selection.setValue(sel)
                }}
                onTabRequest={() => _rightPanelRef && _rightPanelRef.focus()}
                onActiveItemChange={item => selectionService.activeContent.setValue(item)}
              />
            </CurrentAncestorsProvider>
          </CurrentChildrenProvider>
        </CurrentContentProvider>
        <CurrentContentProvider idOrPath={rightParentId}>
          <CurrentContentContext.Consumer>
            {rp => {
              setRightParent(rp)
              return null
            }}
          </CurrentContentContext.Consumer>
          <CurrentChildrenProvider>
            <CurrentAncestorsProvider>
              <CollectionComponent
                enableBreadcrumbs={true}
                onFocus={() => {
                  setActivePanel('right')
                }}
                onActivateItem={item => {
                  props.history.push(ctx.getPrimaryActionUrl(item))
                }}
                containerRef={r => setRightPanelRef(r)}
                parentId={rightParentId}
                style={{ width: '100%', borderLeft: '1px solid rgba(255,255,255,0.3)', maxHeight: '100%' }}
                onParentChange={p2 => {
                  setRightParentId(p2.Id)
                }}
                onSelectionChange={sel => {
                  setRightSelection(sel)
                  selectionService.selection.setValue(sel)
                }}
                onTabRequest={() => _leftPanelRef && _leftPanelRef.focus()}
                onActiveItemChange={item => selectionService.activeContent.setValue(item)}
              />
            </CurrentAncestorsProvider>
          </CurrentChildrenProvider>
        </CurrentContentProvider>
      </LoadSettingsContextProvider>
      <CopyMoveDialog
        dialogProps={{
          open: isCopyOpened,
          onClose: () => setIsCopyOpened(false),
        }}
        operation={copyMoveOperation}
        content={copySelection}
        currentParent={copyParent}
      />
      {activeParent ? (
        <>
          <AddButton parent={activeParent} />
          <AddDialog
            parent={activeParent}
            schema={repo.schemas.getSchemaByName('Folder')}
            dialogProps={{
              open: isAddDialogOpened,
              onClose: () => setIsAddDialogOpened(false),
            }}
          />
        </>
      ) : null}
    </div>
  )
}

export default withRouter(Commander)
