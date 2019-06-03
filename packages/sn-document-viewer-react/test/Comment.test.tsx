import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import ConnectedComment, { CommentComponent, CommentPropType } from '../src/components/comment/Comment'
import { rootReducer } from '../src/store'
import { examplePreviewComment } from './__Mocks__/viewercontext'

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`

const defaultProps: CommentPropType = {
  ...examplePreviewComment,
  deleteComment: jest.fn(),
  setSelectedCommentId: jest.fn(),
  selectedCommentId: '',
  localization: {} as any,
  host: '',
}

describe('Comment component', () => {
  it('should show text', () => {
    const wrapper = mount(<CommentComponent {...defaultProps} />)
    expect(wrapper.find(CardContent).exists()).toBeTruthy()
    expect(wrapper.find(CardContent).text()).toBe(defaultProps.text)
  })

  it('should show show more button when text is long', () => {
    const wrapper = mount(<CommentComponent {...defaultProps} text={longText} />)
    const button = wrapper.find(Button)
    expect(button.exists()).toBeTruthy()
    expect(button.length).toBe(1) // Should not show delete button
    expect(button.text()).toBe('Show more')
  })

  it('should show show less button when too long text is opened', () => {
    const wrapper = mount(<CommentComponent {...defaultProps} text={longText} />)
    const button = wrapper.find(Button).first()
    button.simulate('click')
    expect(wrapper.find(Button).length).toBe(2) // Should show delete button as well
    expect(button.text()).toBe('Show less')
  })

  it('should show show more button with localized text when connected', () => {
    const wrapper = mount(
      <Provider store={createStore(rootReducer)}>
        <ConnectedComment {...defaultProps} text={longText} />
      </Provider>,
    )
    expect(wrapper.find(Button).text()).toBe('+ Show more')
  })

  it('should show show less button with localized text when connected', () => {
    const wrapper = mount(
      <Provider store={createStore(rootReducer)}>
        <ConnectedComment {...defaultProps} text={longText} />
      </Provider>,
    )
    const btn = wrapper.find(Button).first()
    btn.simulate('click')
    expect(btn.text()).toBe('+ Show less')
  })

  it('should show delete button when text is short', () => {
    const wrapper = mount(<CommentComponent {...defaultProps} />)
    expect(wrapper.find(Button).text()).toBe('delete')
  })

  it('should show localized delete button', () => {
    const wrapper = mount(
      <Provider store={createStore(rootReducer)}>
        <ConnectedComment {...defaultProps} />
      </Provider>,
    )
    expect(wrapper.find(Button).text()).toBe('Delete')
  })

  it('should be in selected state when clicked', () => {
    const wrapper = mount(
      <Provider store={createStore(rootReducer)}>
        <ConnectedComment {...defaultProps} />
      </Provider>,
    )
    wrapper.find(Card).simulate('click')
    expect(wrapper.find(Card).prop('raised')).toBe(true)
  })

  it('should display an avatar without src when host is the same', () => {
    const wrapper = mount(
      <CommentComponent
        {...defaultProps}
        createdBy={{ ...defaultProps.createdBy, avatarUrl: 'https://cdn.images.express.co.uk' }}
        host="https://cdn.images.express.co.uk"
      />,
    )
    expect(wrapper.find(Avatar).prop('src')).toBeUndefined()
  })
})
