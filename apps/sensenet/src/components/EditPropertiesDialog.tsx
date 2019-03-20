import Dialog, { DialogProps } from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { EditView } from '@sensenet/controls-react'
import { GenericContent } from '@sensenet/default-content-types'
import React, { useContext } from 'react'
import { RepositoryContext } from '../context/RepositoryContext'

export const EditPropertiesDialog: React.FunctionComponent<{
  dialogProps: DialogProps
  content: GenericContent
}> = props => {
  const repo = useContext(RepositoryContext)
  return (
    <Dialog {...props.dialogProps}>
      <DialogTitle>Edit {props.content.DisplayName || props.content.Name}</DialogTitle>
      <DialogContent>
        <EditView
          content={props.content}
          repository={repo}
          contentTypeName={props.content.Type}
          handleCancel={() => props.dialogProps.onClose && props.dialogProps.onClose(null as any)}
          onSubmit={async (id, content) => {
            repo.patch({
              idOrPath: id,
              content,
            })
            props.dialogProps.onClose && props.dialogProps.onClose(null as any)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
