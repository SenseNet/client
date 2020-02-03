import React from 'react'
import Lock from '@material-ui/icons/Lock'
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate'
import { TableCell, Tooltip } from '@material-ui/core'
import { GenericContent } from '@sensenet/default-content-types'
import { useSession } from '@sensenet/hooks-react'
import { isUser } from '../../utils/type-guards'
import { useLocalization } from '../../hooks'

type LockedFieldProps = {
  content: GenericContent
}

export function LockedField({ content }: LockedFieldProps) {
  const session = useSession()
  const localization = useLocalization().lockedCell

  const lockedByName = () => {
    const checkedOutTo = content?.CheckedOutTo
    if (!isUser(checkedOutTo)) {
      return 'Someone'
    }

    return checkedOutTo.Name === session.currentUser.Name ? 'Me' : checkedOutTo.FullName ?? 'Someone'
  }

  if (!content.Locked && !content.Approvable) {
    // We need to return an empty TableCell so the Table remains aligned.
    return <TableCell />
  }

  return (
    <TableCell component="div">
      <Tooltip title={content.Approvable ? localization.actionNeeded : localization.checkedOutTo(lockedByName())}>
        {content.Approvable ? <AssignmentLateIcon /> : <Lock />}
      </Tooltip>
    </TableCell>
  )
}
