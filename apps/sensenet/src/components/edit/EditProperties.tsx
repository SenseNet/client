import { createStyles, makeStyles } from '@material-ui/core'
import { CurrentAncestorsProvider, CurrentContentProvider, useRepository } from '@sensenet/hooks-react'
import clsx from 'clsx'
import React from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router'
import { globals, useGlobalStyles } from '../../globalStyles'
import { useSelectionService } from '../../hooks'
import { ContentBreadcrumbs } from '../ContentBreadcrumbs'
import { EditView } from '../view-controls/edit-view'

const useStyles = makeStyles(() => {
  return createStyles({
    editWrapper: {
      padding: '0',
      overflow: 'auto',
    },
    breadcrumbsWrapper: {
      height: globals.common.drawerItemHeight,
      boxSizing: 'border-box',
    },
  })
})

const GenericContentEditor: React.FunctionComponent<RouteComponentProps<{ contentId?: string }>> = props => {
  const contentId = parseInt(props.match.params.contentId as string, 10)
  const selectionService = useSelectionService()
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const history = useHistory()
  const repo = useRepository()

  return (
    <div className={clsx(globalClasses.full, classes.editWrapper)}>
      <CurrentContentProvider
        idOrPath={contentId}
        onContentLoaded={c => {
          selectionService.activeContent.setValue(c)
        }}
        oDataOptions={{ select: 'all' }}>
        <CurrentAncestorsProvider>
          <div className={clsx(classes.breadcrumbsWrapper, globalClasses.centeredVertical)}>
            <ContentBreadcrumbs
              onItemClick={item => {
                history.push(`/${btoa(repo.configuration.repositoryUrl)}/EditProperties/${item.content.Id}`)
              }}
            />
          </div>
          <EditView
            uploadFolderpath={'/Root/Content/demoavatars'}
            handleCancel={props.history.goBack}
            actionName={'edit'}
          />
        </CurrentAncestorsProvider>
      </CurrentContentProvider>
    </div>
  )
}

export default withRouter(GenericContentEditor)
