import Card from '@material-ui/core/Card'
import SvgIcon from '@material-ui/core/SvgIcon'
import React from 'react'
import styled from 'styled-components'

// tslint:disable: completed-docs
export const StyledForm = styled.form`
  width: 100%;
  display: flex;
`

export const StyledSvgIcon = styled(({ isPlacingMarker, ...rest }) => <SvgIcon {...rest} />)<{
  isPlacingMarker: boolean
}>`
  color: ${props => (props.isPlacingMarker ? props.theme.palette.primary.light : 'inherit')};
  transform: ${props => (props.isPlacingMarker ? 'rotate(90deg)' : '')};
`

export const StyledCard = styled(({ isSelected, ...rest }) => <Card {...rest} />)<{ isSelected: boolean }>`
  && {
    background-color: ${props => (props.isSelected ? 'rgb(0,0,0,0.1)' : 'rgb(0,0,0,0)')};
    width: 100%;
    margin-bottom: 10px;
  }
`
