import { GenericContent } from '@sensenet/default-content-types'
import { IconButton, TableCell } from '@material-ui/core'
import React, { useRef, useState } from 'react'
import { MoreHoriz } from '@material-ui/icons'
import { ResponsivePlatforms } from '../../context'
import { ContentContextMenu } from '../context-menu/content-context-menu'
import { virtualStyle } from './virtualizedStyleForFields'

type DisplayNameProps = {
  content: GenericContent
  device: ResponsivePlatforms
  isActive: boolean
}

export const DisplayNameComponent: React.FunctionComponent<DisplayNameProps> = ({ content, device, isActive }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isOpened, setIsOpened] = useState(false)

  const onButtonClick = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault()
    ev.stopPropagation()
    setIsOpened(true)
  }

  return (
    <TableCell component="div" style={{ ...virtualStyle, justifyContent: 'left' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {content.DisplayName || content.Name}
        {device === 'mobile' && isActive ? (
          <div style={{ float: 'right' }}>
            <IconButton ref={buttonRef} onClick={onButtonClick}>
              <MoreHoriz />
            </IconButton>
            <ContentContextMenu
              isOpened={isOpened}
              content={content}
              onClose={() => setIsOpened(false)}
              menuProps={{
                anchorEl: buttonRef.current,
                disablePortal: true,
                BackdropProps: {
                  onClick: () => setIsOpened(false),
                  onContextMenu: ev => ev.preventDefault(),
                },
              }}
            />
          </div>
        ) : null}
      </div>
    </TableCell>
  )
}
