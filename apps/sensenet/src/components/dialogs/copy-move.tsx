import { PathHelper } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import { useLogger, useRepository } from '@sensenet/hooks-react'
import { useListPicker } from '@sensenet/pickers-react'
import { LinearProgress } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import React, { useEffect, useState } from 'react'
import { useGlobalStyles } from '../../globalStyles'
import { useLocalization, useSnRoute } from '../../hooks'
import { Icon } from '../Icon'
import { DialogTitle, useDialog } from '.'

export interface CopyMoveDialogProps {
  currentParent: GenericContent
  content: GenericContent[]
  operation: 'copy' | 'move'
}

export const CopyMoveDialog: React.FunctionComponent<CopyMoveDialogProps> = (props) => {
  const snRoute = useSnRoute()
  const repo = useRepository()
  const { closeLastDialog } = useDialog()
  const list = useListPicker({
    repository: repo,
    currentPath: props.currentParent.Path,
    rootPath: snRoute.path,
    itemsODataOptions: { filter: '' },
  })
  const localizations = useLocalization().copyMoveContentDialog
  const [localization, setLocalization] = useState(localizations[props.operation])
  const logger = useLogger('CopyDialog')
  const globalClasses = useGlobalStyles()
  const [isExecInProgress, setIsExecInProgress] = useState(false)

  useEffect(() => {
    setLocalization(localizations[props.operation])
  }, [localizations, props.operation])

  if (!props.content.length) {
    return null
  }

  return (
    <>
      <DialogTitle>
        <div className={globalClasses.centeredVertical}>
          <Icon item={props.content[0]} style={{ marginRight: '1em' }} />
          {isExecInProgress
            ? localization.inProgress
            : props.content.length === 1
            ? localization.title
                .replace('{0}', props.content[0].DisplayName || props.content[0].Name)
                .replace('{1}', list.path)
            : localization.titleMultiple.replace('{0}', props.content.length.toString()).replace('{1}', list.path)}
        </div>
      </DialogTitle>
      <DialogContent>
        <List>
          {list.items?.map((item) => (
            <ListItem
              key={item.Id}
              button={true}
              selected={list.selectedItem === item}
              onClick={() => list.setSelectedItem(item)}
              onDoubleClick={() => {
                list.navigateTo(item)
                list.reload()
              }}>
              <ListItemIcon>{item.isParent ? <ArrowUpward /> : <Icon item={item} />}</ListItemIcon>
              <ListItemText primary={item.isParent ? '...' : item.DisplayName} />
            </ListItem>
          ))}
        </List>
        {isExecInProgress && <LinearProgress />}
      </DialogContent>
      <DialogActions>
        <Button
          aria-label={localization.cancelButton}
          className={globalClasses.cancelButton}
          onClick={() => closeLastDialog()}
          disabled={isExecInProgress}>
          {localization.cancelButton}
        </Button>
        <Button
          aria-label={localization.copyButton}
          color="primary"
          variant="contained"
          autoFocus={true}
          disabled={
            (list.selectedItem && list.selectedItem.Path === props.content[0].Path) ||
            (list.selectedItem && list.selectedItem.Path === `/${PathHelper.getParentPath(props.content[0].Path)}`) ||
            isExecInProgress
          }
          onClick={async () => {
            try {
              setIsExecInProgress(true)
              const parentItem = list.items.find((item) => item.isParent)

              const action = props.operation === 'copy' ? repo.copy : repo.move
              const result = await action({ idOrPath: props.content.map((c) => c.Id), targetPath: list.path })

              if (result.d.results.length === 1 && result.d.errors.length === 0) {
                logger.information({
                  message: localization.copySucceededNotification
                    .replace('{0}', result.d.results[0].Name)
                    .replace('{1}', list.path),
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
                    .replace(
                      '{1}',
                      list.selectedItem
                        ? list.selectedItem.DisplayName || list.selectedItem.Name
                        : parentItem!.DisplayName || parentItem!.Name,
                    ),
                  data: {
                    result,
                  },
                })
              }

              if (result.d.errors.length === 1) {
                logger.warning({
                  message: `${localization.copyFailedNotification
                    .replace('{0}', result.d.errors[0].content.Name)
                    .replace(
                      '{1}',
                      list.selectedItem
                        ? list.selectedItem.DisplayName || list.selectedItem.Name
                        : parentItem!.DisplayName || parentItem!.Name,
                    )}\r\n${result.d.errors[0].error.message.value}`,
                  data: {
                    details: { error: result.d.errors[0] },
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
                    .replace(
                      '{1}',
                      list.selectedItem
                        ? list.selectedItem.DisplayName || list.selectedItem.Name
                        : parentItem!.DisplayName || parentItem!.Name,
                    ),
                  data: {
                    details: { error: result.d.errors },
                  },
                })
              }
            } catch (error) {
              /** */
            } finally {
              setIsExecInProgress(false)
              closeLastDialog()
            }
          }}>
          {localization.copyButton}
        </Button>
      </DialogActions>
    </>
  )
}

export default CopyMoveDialog
