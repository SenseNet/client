import { CommentData } from '@sensenet/client-core'
import Button from '@material-ui/core/Button'
import React, { useState } from 'react'
import { ConfirmationDialog } from '..'
import { useDocumentData, useDocumentViewerApi, useLocalization } from '../../hooks'

// type DeleteButtonProps = Pick<CommentPropType, 'deleteComment' | 'id'>
export interface DeleteButtonProps {
  comment: CommentData
}

/**
 * Represents a delete button with confirmation dialog
 */
export const DeleteButton: React.FC<DeleteButtonProps> = (props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const api = useDocumentViewerApi()
  const { documentData } = useDocumentData()
  const localization = useLocalization()

  const handleClick = () => {
    setIsDialogOpen(true)
  }

  const handleDialogClose = (isCanceled: boolean) => {
    if (!isCanceled) {
      api.commentActions.deletePreviewComment({
        document: documentData,
        commentId: props.comment.id,
        abortController: new AbortController(),
      })
    }
    setIsDialogOpen(false)
  }

  return (
    <>
      <Button color="primary" size="small" onClick={handleClick}>
        {localization.delete}
      </Button>
      <ConfirmationDialog
        dialogTitle={localization.deleteCommentDialogTitle}
        cancelButtonText={localization.cancelButton}
        okButtonText={localization.okButton}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}>
        {localization.deleteCommentDialogBody}
      </ConfirmationDialog>
    </>
  )
}
