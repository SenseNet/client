import Button from '@material-ui/core/Button'
import Dialog, { DialogProps } from '@material-ui/core/Dialog/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { PathHelper } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import { ListPickerComponent } from '@sensenet/pickers-react'
import React, { useContext, useEffect, useState } from 'react'
import { LocalizationContext, RepositoryContext } from '../context'
import { LoggerContext } from '../context/LoggerContext'
import { Icon } from './Icon'

export interface CopyMoveDialogProps {
  currentParent: GenericContent
  content: GenericContent[]
  dialogProps: DialogProps
  operation: 'copy' | 'move'
}

export const CopyMoveDialog: React.FunctionComponent<CopyMoveDialogProps> = props => {
  const handleClose = (ev: React.SyntheticEvent<{}, Event>) => {
    props.dialogProps.onClose && props.dialogProps.onClose(ev)
  }

  const localizations = useContext(LocalizationContext).values.copyMoveContentDialog

  const [localization, setLocalization] = useState(localizations[props.operation])

  useEffect(() => {
    setLocalization(localizations[props.operation])
  }, [props.operation])

  const repo = useContext(RepositoryContext)
  const [parent, setParent] = useState(props.currentParent)

  useEffect(() => {
    setParent(props.currentParent)
  }, [props.currentParent])

  const logger = useContext(LoggerContext).withScope('CopyDialog')

  if (!parent || !props.content.length) {
    return null
  }

  return (
    <Dialog
      fullWidth={true}
      {...props.dialogProps}
      onClick={ev => ev.stopPropagation()}
      onDoubleClick={ev => ev.stopPropagation()}>
      <DialogTitle>
        <div>
          <Icon item={props.content[0]} style={{ marginRight: '1em' }} />
          {props.content.length === 1
            ? localization.title
                .replace('{0}', props.content[0].DisplayName || props.content[0].Name)
                .replace('{1}', parent.Path)
            : localization.titleMultiple.replace('{0}', props.content.length.toString()).replace('{1}', parent.Path)}
        </div>
      </DialogTitle>
      <DialogContent>
        <ListPickerComponent
          currentPath={props.currentParent.Path}
          repository={repo}
          parentODataOptions={{ filter: `isOf('Folder')` }}
          onSelectionChanged={sel => sel && setParent(sel)}
          renderItem={node => (
            <ListItem button={true} selected={parent && node.Id === parent.Id}>
              <ListItemIcon>
                <Icon item={node} />
              </ListItemIcon>
              <ListItemText primary={node.DisplayName} />
            </ListItem>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{localization.cancelButton}</Button>
        <Button
          autoFocus={true}
          disabled={
            parent &&
            (parent.Path === props.content[0].Path ||
              parent.Path === '/' + PathHelper.getParentPath(props.content[0].Path))
          }
          onClick={async ev => {
            handleClose(ev)
            try {
              if (parent) {
                const action = props.operation === 'copy' ? repo.copy : repo.move
                const result = await action({ idOrPath: props.content.map(c => c.Id), targetPath: parent.Path })

                if (result.d.results.length === 1 && result.d.errors.length === 0) {
                  logger.information({
                    message: localization.copySucceededNotification
                      .replace('{0}', result.d.results[0].Name)
                      .replace('{1}', parent.DisplayName || parent.Name),
                    data: {
                      details: result,
                      ...(props.content.length === 1
                        ? {
                            relatedRepository: repo.configuration.repositoryUrl,
                            relatedContent: props.content[0],
                          }
                        : {}),
                    },
                  })
                } else if (result.d.results.length > 1) {
                  logger.information({
                    message: localization.copyMultipleSucceededNotification
                      .replace('{0}', result.d.results.length.toString())
                      .replace('{1}', parent.DisplayName || parent.Name),
                    data: {
                      result,
                    },
                  })
                }

                if (result.d.errors.length === 1) {
                  logger.warning({
                    message:
                      localization.copyFailedNotification
                        .replace('{0}', result.d.errors[0].content.Name)
                        .replace('{1}', parent.DisplayName || parent.Name) +
                      `\r\n${result.d.errors[0].error.message.value}`,
                    data: {
                      details: result,
                      ...(props.content.length === 1
                        ? {
                            relatedRepository: repo.configuration.repositoryUrl,
                            relatedContent: props.content[0],
                          }
                        : {}),
                    },
                  })
                } else if (result.d.errors.length > 1) {
                  logger.warning({
                    message: localization.copyMultipleFailedNotification
                      .replace('{0}', result.d.errors.length.toString())
                      .replace('{1}', parent.DisplayName || parent.Name),
                    data: {
                      details: result,
                    },
                  })
                }
              }
            } catch (error) {
              /** */
            }
          }}>
          {localization.copyButton}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
