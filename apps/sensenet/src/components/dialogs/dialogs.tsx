import { Dialog } from '@material-ui/core'
import React, { Suspense } from 'react'
import { useGlobalStyles } from '../../globalStyles'
import { DialogWithProps, useDialog } from '.'

const Approve = React.lazy(() => import('./approve'))
const AreYouSure = React.lazy(() => import('./are-you-sure'))
const CheckIn = React.lazy(() => import('./check-in'))
const CopyMove = React.lazy(() => import('./copy-move'))
const CustomActionResult = React.lazy(() => import('./custom-action-result'))
const Delete = React.lazy(() => import('./delete'))
const Error = React.lazy(() => import('./error-dialog'))
const ExecuteAction = React.lazy(() => import('./execute-action'))
const Logout = React.lazy(() => import('./logout'))
const SaveQuery = React.lazy(() => import('./save-query'))
const Upload = React.lazy(() => import('./upload/upload-dialog'))
const ReferenceContentList = React.lazy(() => import('./reference-content-list'))
const PermissionEditorDialog = React.lazy(() => import('./permission-editor-dialog'))
const Restore = React.lazy(() => import('./restore'))
const ContentPicker = React.lazy(() => import('./content-picker'))

function dialogRenderer(dialog: DialogWithProps) {
  switch (dialog.name) {
    case 'delete':
      return <Delete {...dialog.props} />
    case 'error':
      return <Error {...dialog.props} />
    case 'copy-move':
      return <CopyMove {...dialog.props} />
    case 'check-in':
      return <CheckIn {...dialog.props} />
    case 'are-you-sure':
      return <AreYouSure {...dialog.props} />
    case 'approve':
      return <Approve {...dialog.props} />
    case 'restore':
      return <Restore {...dialog.props} />
    case 'upload':
      return <Upload {...dialog.props} />
    case 'execute-action':
      return <ExecuteAction {...dialog.props} />
    case 'custom-action-result':
      return <CustomActionResult {...dialog.props} />
    case 'logout':
      return <Logout />
    case 'save-query':
      return <SaveQuery {...dialog.props} />
    case 'reference-content-list':
      return <ReferenceContentList {...dialog.props} />
    case 'permission-editor':
      return <PermissionEditorDialog {...dialog.props} />
    case 'content-picker':
      return <ContentPicker {...dialog.props} />
    default:
      return null
  }
}

export function Dialogs() {
  const { dialogs, closeLastDialog } = useDialog()
  const globalClasses = useGlobalStyles()

  return (
    <Suspense fallback="Loading">
      {dialogs.map((dialog, index) => (
        <Dialog
          classes={{ paper: globalClasses.dialog }}
          fullWidth
          key={index}
          open={true}
          maxWidth="md"
          {...dialog.dialogProps}
          onClose={(event, reason) => {
            dialog.dialogProps?.onClose?.(event, reason)
            closeLastDialog()
          }}>
          {dialogRenderer(dialog)}
        </Dialog>
      ))}
    </Suspense>
  )
}
