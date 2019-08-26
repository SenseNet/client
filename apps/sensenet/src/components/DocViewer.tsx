import { DocumentViewer } from '@sensenet/document-viewer-react'
import React, { useCallback, useEffect } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import { Close } from '@material-ui/icons'
import { Button } from '@material-ui/core'
import { CurrentContentProvider, useInjector, useRepository } from '@sensenet/hooks-react'
import { useLocalization, useSelectionService, useTheme } from '../hooks'
import { getViewerSettings } from '../services/GetViewerSettings'

const DocViewer: React.FunctionComponent<
  RouteComponentProps<{ documentId: string }> & { previousLocation?: string }
> = props => {
  const documentId = parseInt(props.match.params.documentId, 10)
  const injector = useInjector()
  const repo = useRepository()
  injector.setExplicitInstance(getViewerSettings(repo))
  const selectionService = useSelectionService()
  const localization = useLocalization()
  const theme = useTheme()
  const closeViewer = useCallback(() => {
    props.previousLocation ? props.history.push(props.previousLocation) : props.history.goBack()
  }, [props.history, props.previousLocation])

  useEffect(() => {
    const keyboardHandler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }
      closeViewer()
    }

    document.addEventListener('keydown', keyboardHandler, false)
    return () => {
      document.removeEventListener('keydown', keyboardHandler, false)
    }
  }, [closeViewer, props])

  if (isNaN(documentId)) {
    throw Error(`Invalid document Id: ${documentId}`)
  }
  const hostName = repo.configuration.repositoryUrl

  return (
    <div style={{ overflow: 'hidden', width: '100%', height: '100%', position: 'fixed' }}>
      <CurrentContentProvider idOrPath={documentId} onContentLoaded={c => selectionService.activeContent.setValue(c)}>
        <DocumentViewer documentIdOrPath={documentId} hostName={hostName}>
          <Button
            style={{ placeSelf: 'flex-end', position: 'relative', top: '1em', right: '4.5em' }}
            onClick={closeViewer}>
            <Close style={{ marginRight: theme.spacing(1) }} />
            {localization.customActions.resultsDialog.closeButton}
          </Button>
        </DocumentViewer>
      </CurrentContentProvider>
    </div>
  )
}

const extendedComponent = withRouter(DocViewer)

export default extendedComponent
