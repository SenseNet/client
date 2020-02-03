import { TableCell } from '@material-ui/core'
import React from 'react'

export const EmailField: React.FC<{ mail: string }> = ({ mail }) => (
  <TableCell component="div">
    <a href={`mailto:${mail}`}>{mail}</a>
  </TableCell>
)
