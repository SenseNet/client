import Dialog, { DialogProps } from '@material-ui/core/Dialog/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { NewView } from '@sensenet/controls-react'
import { GenericContent, Schema } from '@sensenet/default-content-types'
import React, { useContext } from 'react'
import { LocalizationContext, RepositoryContext } from '../context'
import { LoggerContext } from '../context/LoggerContext'

export interface AddDialogProps {
  dialogProps: DialogProps
  schema: Schema
  parent: GenericContent
}

export const AddDialog: React.FunctionComponent<AddDialogProps> = ({ dialogProps, schema, parent }) => {
  const localization = useContext(LocalizationContext).values.addButton
  const repo = useContext(RepositoryContext)

  const handleClose = () => dialogProps.onClose && dialogProps.onClose(null as any)
  const logger = useContext(LoggerContext).withScope('AddDialog')

  return (
    <Dialog {...dialogProps}>
      <DialogTitle> {localization.dialogTitle.replace('{0}', schema.DisplayName)}</DialogTitle>
      <DialogContent>
        <NewView
          handleCancel={handleClose}
          repository={repo}
          contentTypeName={schema.ContentTypeName}
          schema={schema}
          path={parent.Path}
          title=""
          onSubmit={async (parentPath, content) => {
            try {
              const created = await repo.post({
                contentType: schema.ContentTypeName,
                parentPath,
                content,
              })
              handleClose()
              logger.information({
                message: localization.contentCreatedNotification.replace(
                  '{0}',
                  created.d.DisplayName || created.d.Name,
                ),
                data: {
                  relatedContent: created,
                  relatedRepository: repo.configuration.repositoryUrl,
                },
              })
            } catch (error) {
              logger.error({
                message: localization.errorGettingAllowedContentTypes,
                data: {
                  details: { error },
                },
              })
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
