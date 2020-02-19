import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { NewView } from '@sensenet/controls-react'
import { Schema } from '@sensenet/default-content-types'
import React from 'react'
import { useLogger, useRepository } from '@sensenet/hooks-react'
import { useLocalization } from '../../hooks'
import { useDialog } from './dialog-provider'

export type AddDialogProps = {
  schema: Schema
  parentPath: string
}

export const AddDialog: React.FunctionComponent<AddDialogProps> = ({ schema, parentPath }) => {
  const localization = useLocalization().addButton
  const { closeLastDialog } = useDialog()
  const repo = useRepository()
  const logger = useLogger('AddDialog')

  return (
    <>
      <DialogTitle> {localization.dialogTitle.replace('{0}', schema.DisplayName)}</DialogTitle>
      <DialogContent>
        <NewView
          handleCancel={closeLastDialog}
          repository={repo}
          contentTypeName={schema.ContentTypeName}
          path={parentPath}
          onSubmit={async content => {
            try {
              const created = await repo.post({
                contentType: schema.ContentTypeName,
                parentPath,
                content,
                contentTemplate: schema.ContentTypeName,
              })
              closeLastDialog()
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
                message: localization.errorPostingContentNotification,
                data: {
                  details: { error },
                },
              })
            }
          }}
        />
      </DialogContent>
    </>
  )
}

export default AddDialog
