import { createStyles, makeStyles, Theme } from '@material-ui/core'
import { GenericContent } from '@sensenet/default-content-types'
import {
  CurrentAncestorsProvider,
  CurrentChildrenProvider,
  CurrentContentProvider,
  LoadSettingsContextProvider,
} from '@sensenet/hooks-react'
import clsx from 'clsx'
import React, { useContext, useState } from 'react'
import { ResponsivePersonalSetttings } from '../../context'
import { globals, useGlobalStyles } from '../../globalStyles'
import { useSelectionService } from '../../hooks'
import { ContentList } from '../content-list/content-list'
import { ContentBreadcrumbs } from '../ContentBreadcrumbs'
import { Icon } from '../Icon'
import TreeWithData from '../tree/tree-with-data'
import { EditView } from '../view-controls/edit-view'

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    exploreWrapper: {
      display: 'flex',
      flexDirection: 'column',
    },
    breadcrumbsWrapper: {
      height: globals.common.drawerItemHeight,
      boxSizing: 'border-box',
      borderBottom: theme.palette.type === 'light' ? '1px solid #DBDBDB' : '1px solid rgba(255, 255, 255, 0.11)',
      paddingLeft: '15px',
    },
    treeAndDatagridWrapper: {
      display: 'flex',
      width: '100%',
      height: `calc(100% - ${globals.common.drawerItemHeight}px)`,
      position: 'relative',
    },
    title: {
      height: '68px',
      fontSize: '20px',
    },
    exploreContainer: {
      display: 'flex',
      flexFlow: 'column',
      width: '100%',
    },
  })
})

export interface ExploreComponentProps {
  parentIdOrPath: number | string
  onNavigate: (newParent: GenericContent) => void
  onActivateItem: (item: GenericContent) => void
  fieldsToDisplay?: Array<keyof GenericContent>
  rootPath?: string
}

export const Explore: React.FunctionComponent<ExploreComponentProps> = props => {
  const selectionService = useSelectionService()
  const personalSettings = useContext(ResponsivePersonalSetttings)
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const [isFormOpened, setIsFormOpened] = useState(false)
  const [action, setAction] = useState<'new' | 'edit' | 'browse' | undefined>(undefined)
  const [refreshEditView, setRefreshEditView] = useState(false)

  if (!props.rootPath) {
    return null
  }

  const setFormOpen = (actionName: 'new' | 'edit' | 'browse' | undefined) => {
    setAction(actionName)
    setIsFormOpened(true)
    setRefreshEditView(!refreshEditView)
  }

  return (
    <>
      <LoadSettingsContextProvider>
        <CurrentContentProvider idOrPath={props.parentIdOrPath}>
          <CurrentChildrenProvider>
            <CurrentAncestorsProvider root={props.rootPath}>
              <div className={clsx(classes.breadcrumbsWrapper, globalClasses.centeredVertical)}>
                <ContentBreadcrumbs
                  setFormOpen={actionName => setFormOpen(actionName)}
                  onItemClick={i => props.onNavigate(i.content)}
                />
              </div>
              <div className={classes.treeAndDatagridWrapper}>
                <TreeWithData
                  onItemClick={item => {
                    selectionService.activeContent.setValue(item)
                    props.onNavigate(item)
                  }}
                  parentPath={props.rootPath}
                  activeItemIdOrPath={props.parentIdOrPath}
                  setFormOpen={actionName => setFormOpen(actionName)}
                />
                <div className={classes.exploreContainer}>
                  {isFormOpened ? (
                    <>
                      {action === 'edit' ? (
                        <div className={clsx(classes.title, globalClasses.centered)}>
                          {clsx('Edit', selectionService.activeContent.getValue()?.DisplayName)}
                          <Icon
                            style={{ marginLeft: '9px', height: '24px', width: '24px' }}
                            item={selectionService.activeContent.getValue()}
                          />
                        </div>
                      ) : action === 'browse' ? (
                        <div className={clsx(classes.title, globalClasses.centered)}>
                          {clsx('Info about', selectionService.activeContent.getValue()?.DisplayName)}
                          <Icon
                            style={{ marginLeft: '9px', height: '24px', width: '24px' }}
                            item={selectionService.activeContent.getValue()}
                          />
                        </div>
                      ) : null}

                      <EditView
                        uploadFolderpath={'/Root/Content/demoavatars'}
                        handleCancel={() => {
                          setIsFormOpened(false)
                          setAction(undefined)
                        }}
                        actionName={action}
                        refresh={refreshEditView}
                      />
                    </>
                  ) : (
                    <ContentList
                      style={{ flexGrow: 7, flexShrink: 0, maxHeight: '100%' }}
                      enableBreadcrumbs={false}
                      fieldsToDisplay={props.fieldsToDisplay || personalSettings.content.fields}
                      onParentChange={props.onNavigate}
                      onActivateItem={props.onActivateItem}
                      onActiveItemChange={item => selectionService.activeContent.setValue(item)}
                      parentIdOrPath={props.parentIdOrPath}
                      onSelectionChange={sel => {
                        selectionService.selection.setValue(sel)
                      }}
                      isOpenFrom={'explore'}
                      setFormOpen={actionName => setFormOpen(actionName)}
                    />
                  )}
                </div>
              </div>
            </CurrentAncestorsProvider>
          </CurrentChildrenProvider>
        </CurrentContentProvider>
      </LoadSettingsContextProvider>
    </>
  )
}
