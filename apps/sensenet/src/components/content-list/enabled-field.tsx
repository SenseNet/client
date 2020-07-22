import { TableCell } from '@material-ui/core'
import clsx from 'clsx'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { useGlobalStyles } from '../../globalStyles'
import { Switcher } from '../field-controls'

interface EnabledFieldProps {
  enabled: boolean
  onChange?: (value: boolean) => Promise<boolean>
}

export const EnabledField: FunctionComponent<EnabledFieldProps> = ({ enabled, onChange }) => {
  const globalClasses = useGlobalStyles()
  const [checked, setChecked] = useState(enabled)

  useEffect(() => {
    setChecked(!!enabled)
  }, [enabled])

  return (
    <TableCell className={clsx(globalClasses.centeredLeft, globalClasses.virtualizedCellStyle)} component="div">
      <Switcher
        checked={checked}
        size="small"
        onClick={async (event) => {
          const newValue = !checked
          event.stopPropagation()
          const isValueChanged = await onChange?.(newValue)

          if (isValueChanged || isValueChanged === undefined) {
            setChecked(newValue)
          }
        }}
      />
    </TableCell>
  )
}
