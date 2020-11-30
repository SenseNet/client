import { GenericContent } from '@sensenet/default-content-types'
import TableCell from '@material-ui/core/TableCell'
import React from 'react'

export interface VirtualDefaultCellProps<T extends GenericContent> {
  cellData: T
}

export const VirtualDefaultCell = <T extends GenericContent>(props: VirtualDefaultCellProps<T>) => (
  <TableCell
    style={{
      height: '57px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'left',
      padding: 0,
    }}
    component={'div' as any}>
    {props.cellData?.toString()}
  </TableCell>
)
