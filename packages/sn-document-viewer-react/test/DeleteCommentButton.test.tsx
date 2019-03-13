import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import { mount } from 'enzyme'
import React from 'react'
import { ConfirmationDialog, DeleteButton } from '../src/components'

describe('Delete comment button component', () => {
  const defaultProps = {
    localization: {
      deleteCommentDialogTitle: 'delete comment dialog title',
      deleteCommentDialogBody: 'delete comment dialog body',
    } as any,
    deleteComment: jest.fn(),
    id: 'id',
  }

  it('should open a confirmation dialog when clicked', () => {
    const wrapper = mount(<DeleteButton {...defaultProps} />)
    wrapper.find(Button).simulate('click')
    expect(wrapper.find(Dialog).prop('open')).toBeTruthy()
  })

  it.skip('should call delete comment when confirmation comes back with true', () => {
    const deleteComment = jest.fn()
    const wrapper = mount(<DeleteButton {...defaultProps} deleteComment={deleteComment} />)
    wrapper.find(ConfirmationDialog).prop('onClose')(true)
    expect(deleteComment).toBeCalled()
  })
})
