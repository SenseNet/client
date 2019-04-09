import Drawer from '@material-ui/core/Drawer'
import { sleepAsync } from '@sensenet/client-utils'
import { mount, shallow } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { CreateComment, PageList } from '../src/components'
import CommentComponent from '../src/components/comment/Comment'
import { DocumentViewerLayout, DocumentViewerLayoutComponent } from '../src/components/DocumentViewerLayout'
import { getCommentsSuccess, rootReducer, setSelectedCommentId } from '../src/store'
import { examplePreviewComment } from './__Mocks__/viewercontext'
import { createdByMock } from './Comment.test'

declare global {
  interface Window {
    domNode: HTMLDivElement
  }
}

describe('Document Viewer Layout component', () => {
  const defaultProps: DocumentViewerLayoutComponent['props'] = {
    setActivePages: jest.fn(),
    activePages: [2],
    customZoomLevel: 1,
    fitRelativeZoomLevel: 1,
    setThumbnails: jest.fn(),
    showThumbnails: true,
    showComments: false,
    zoomMode: 'custom',
    comments: [],
    createComment: jest.fn(),
    localization: {} as any,
    setSelectedCommentId: jest.fn(),
    getComments: jest.fn(),
    selectedCommentId: '',
  }

  beforeAll(() => {
    const div = document.createElement('div')
    window.domNode = div
    document.body.appendChild(div)
  })

  it('should render without crashing', () => {
    const wrapper = shallow(
      <DocumentViewerLayoutComponent {...defaultProps}>{'some children'}</DocumentViewerLayoutComponent>,
    )
    const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount')
    expect(wrapper).toMatchSnapshot()
    wrapper.unmount()
    expect(componentWillUnmount).toBeCalled()

    const wrapper2 = shallow(
      <DocumentViewerLayoutComponent {...defaultProps} showThumbnails={false}>
        {'some children'}
      </DocumentViewerLayoutComponent>,
    )
    expect(wrapper2).toMatchSnapshot()
  })

  it('should scroll to page when active pages changed', () => {
    const setActivePages = jest.fn()
    const wrapper = shallow(
      <DocumentViewerLayoutComponent {...defaultProps} setActivePages={setActivePages} showThumbnails={false}>
        {'some children'}
      </DocumentViewerLayoutComponent>,
    )
    wrapper.setProps({ ...defaultProps, activePages: [3], children: '', drawerSlideProps: '', showThumbnails: true })
    expect(setActivePages).toBeCalledWith([3])
  })

  it('should scroll to page when fitRelativeZoomLevel changed', async () => {
    const setActivePages = jest.fn()
    const wrapper = shallow(
      <DocumentViewerLayoutComponent {...defaultProps} setActivePages={setActivePages}>
        {'some children'}
      </DocumentViewerLayoutComponent>,
    )
    wrapper.setProps({
      ...defaultProps,
      children: '',
      drawerSlideProps: '',
      showThumbnails: false,
      fitRelativeZoomLevel: 2,
    })
    await sleepAsync()
    expect(setActivePages.mock.calls.length).toBe(0)
    const paperProps = wrapper
      .find(Drawer)
      .first()
      .prop('PaperProps')
    expect(paperProps!.style!.width).toBe(0)
  })

  it('click on a page / thumbnail should scroll to the selected page', () => {
    const setActivePages = jest.fn()
    const wrapper = shallow(
      <DocumentViewerLayoutComponent {...defaultProps} setActivePages={setActivePages} showThumbnails={false}>
        {'some children'}
      </DocumentViewerLayoutComponent>,
    )

    wrapper
      .find(PageList)
      .last()
      .prop('onPageClick')({} as any, 3)
    expect(setActivePages).toBeCalledWith([3])

    wrapper
      .find(PageList)
      .first()
      .prop('onPageClick')({} as any, 5)
    expect(setActivePages).toBeCalledWith([5])
  })

  it('should show comments', () => {
    const wrapper = shallow(
      <DocumentViewerLayoutComponent
        {...defaultProps}
        showComments={true}
        comments={[{ id: 'id', page: 1, text: 'some text', createdBy: createdByMock, x: 10, y: 10 }]}>
        {'some children'}
      </DocumentViewerLayoutComponent>,
    )
    expect(wrapper.find(CommentComponent).exists()).toBeTruthy()
  })

  it("should remove draft comment markers on CreateComment's handlePlaceMarkerClick", () => {
    const wrapper = shallow(
      <DocumentViewerLayoutComponent {...defaultProps} showComments={true}>
        {'some children'}
      </DocumentViewerLayoutComponent>,
    )
    wrapper
      .find(PageList)
      .last()
      .prop('handleMarkerCreation')!({ x: 10, y: 10, id: 'id' })
    wrapper.find(CreateComment).prop('handlePlaceMarkerClick')()
    expect(wrapper.state('draftCommentMarker')).toBeUndefined()
  })

  it('should handle comment creation', () => {
    const createComment = jest.fn()
    const wrapper = shallow(
      <DocumentViewerLayoutComponent {...defaultProps} showComments={true} createComment={createComment}>
        {'some children'}
      </DocumentViewerLayoutComponent>,
    )

    const text = 'this is the comment'
    wrapper.find(CreateComment).prop('createComment')(text)
    expect(createComment).toBeCalledTimes(0) // create comment should not be called when no draft marker is present
    wrapper
      .find(PageList)
      .last()
      .prop('handleMarkerCreation')!({ x: 10, y: 10, id: 'id' })
    wrapper.find(CreateComment).prop('createComment')(text)
    expect(createComment).toBeCalledTimes(1)
    expect(createComment).toBeCalledWith({ page: 1, x: 10, y: 10, id: 'id', text })
  })

  const events: any = {}
  document.addEventListener = jest.fn((event, cb) => {
    events[event] = cb
  })

  it('should handle esc keyup', () => {
    const setSelectedCommentIdMock = jest.fn()
    shallow(
      <DocumentViewerLayoutComponent
        {...defaultProps}
        showComments={true}
        setSelectedCommentId={setSelectedCommentIdMock}>
        {'some children'}
      </DocumentViewerLayoutComponent>,
    )
    events.keyup({ key: 'a' })
    expect(setSelectedCommentIdMock).toBeCalledTimes(0)
    events.keyup({ key: 'Escape' })
    expect(setSelectedCommentIdMock).toBeCalledTimes(1)
    expect(setSelectedCommentIdMock).toBeCalledWith('')
  })

  it('should scroll to comment when selectedCommentId changed', async () => {
    const store = createStore(rootReducer)
    const scrollToMock = jest.fn()
    ;(window as any).HTMLElement.prototype.scrollTo = scrollToMock
    mount(
      <Provider store={store}>
        <DocumentViewerLayout {...defaultProps} />
      </Provider>,
      { attachTo: window.domNode },
    )
    store.dispatch(getCommentsSuccess([examplePreviewComment]))

    store.dispatch(setSelectedCommentId('someId'))
    expect(scrollToMock).toBeCalled()
  })

  it('should not scroll to comment when comment is not found', async () => {
    const store = createStore(rootReducer)
    const scrollToMock = jest.fn()
    ;(window as any).HTMLElement.prototype.scrollTo = scrollToMock
    mount(
      <Provider store={store}>
        <DocumentViewerLayout {...defaultProps} />
      </Provider>,
      { attachTo: window.domNode },
    )
    store.dispatch(getCommentsSuccess([examplePreviewComment]))

    store.dispatch(setSelectedCommentId('random'))
    expect(scrollToMock).not.toBeCalled()
  })
})
