import { CommentData } from '@sensenet/client-core'
import { useRepository } from '@sensenet/hooks-react'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Collapse from '@material-ui/core/Collapse'
import Typography from '@material-ui/core/Typography'
import React, { useEffect, useState } from 'react'
import { useCommentState, useLocalization } from '../../hooks'
import { CommentCard, DeleteButton } from '.'

/**
 * Comment prop type
 */
export interface CommentProps {
  comment: CommentData
}

const MAX_TEXT_LENGTH = 160

/**
 * Represents a single comment component.
 */
export const Comment: React.FC<CommentProps> = (props) => {
  const isLongText = props.comment.text && props.comment.text.length > MAX_TEXT_LENGTH
  const [isOpen, setIsOpen] = useState(!isLongText)
  const localization = useLocalization()
  const commentState = useCommentState()
  const repo = useRepository()

  const [isSelected, setIsSelected] = useState(props.comment.id === commentState.activeCommentId)

  useEffect(() => {
    setIsSelected(props.comment.id === commentState.activeCommentId)
  }, [commentState.activeCommentId, props.comment.id])

  return (
    <CommentCard
      id={props.comment.id}
      isSelected={isSelected}
      onClick={() => commentState.setActiveComment(props.comment.id)}
      renderChildren={() => (
        <>
          <CardHeader
            avatar={
              repo.configuration.repositoryUrl === props.comment.createdBy.avatarUrl ? (
                <Avatar />
              ) : (
                <Avatar src={props.comment.createdBy.avatarUrl} alt={localization.avatarAlt} />
              )
            }
            title={props.comment.createdBy.displayName}
          />
          <Collapse in={isOpen} timeout="auto" collapsedHeight={isOpen ? '0px' : '78px'}>
            <CardContent>
              <Typography style={{ wordBreak: 'break-word' }}>{props.comment.text}</Typography>
            </CardContent>
          </Collapse>
          <CardActions>
            {isLongText ? (
              <>
                <Button size="small" onClick={() => setIsOpen(!isOpen)}>
                  {isOpen ? localization.showLess : localization.showMore}
                </Button>
                {isOpen ? <DeleteButton comment={props.comment} /> : null}
              </>
            ) : (
              <DeleteButton comment={props.comment} />
            )}
          </CardActions>
        </>
      )}
    />
  )
}
