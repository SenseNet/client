import Button from '@material-ui/core/Button/Button'
import { mount, shallow } from 'enzyme'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { DocumentViewerRegeneratePreviews } from '../src/components/document-viewer-regenerate-previews'
import { DocumentViewerApiSettingsContext } from '../src/context/api-settings'
import { defaultSettings } from './__Mocks__/viewercontext'

describe('Document Regenerate Previews component', () => {
  it('should render without crashing', () => {
    const wrapper = shallow(<DocumentViewerRegeneratePreviews />)
    expect(wrapper).toMatchSnapshot()
  })

  it('Should trigger regeneration on button click', async () => {
    const regeneratePreviews = jest.fn(async () => ({ PageCount: -4, PreviewCount: 0 }))
    const wrapper = mount(
      <DocumentViewerApiSettingsContext.Provider value={{ ...defaultSettings, regeneratePreviews }}>
        <DocumentViewerRegeneratePreviews />
      </DocumentViewerApiSettingsContext.Provider>,
    )

    await act(async () => {
      wrapper.find(Button).simulate('click')
    })

    expect(regeneratePreviews).toBeCalled()

    expect(wrapper).toMatchSnapshot()
  })
})
