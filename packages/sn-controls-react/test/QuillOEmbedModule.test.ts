import Quill from 'quill'
import QuillOEmbedModule from '../src/fieldcontrols/RichTextEditor/QuillOEmbedModule'

const richHtml = '<a href="https://example.com">Example</a>'
const imageUrl = 'https://example.com'
const oEmbedUrl = 'https://example.com/oembed?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DiwGFalTRHDA'

function getFetchResult(type: string) {
  return () =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          type,
          html: richHtml,
          url: imageUrl,
        }),
    })
}

Quill.register('modules/oembed', QuillOEmbedModule)

describe('QuillOEmbedModule', () => {
  const quill = new Quill('div', {
    modules: {
      oembed: true,
    },
  })

  quill.clipboard = {
    addMatcher: jest.fn(),
    convert: jest.fn(),
    dangerouslyPasteHTML: jest.fn(),
  }

  it('registers a matcher for pasting', () => {
    const spy = jest.spyOn(quill.clipboard, 'addMatcher')
    new QuillOEmbedModule(quill)
    expect(spy).toBeCalled()
  })

  const selectionSpy = jest.spyOn(quill, 'getSelection')
  selectionSpy.mockImplementation(() => {
    return {
      index: 0,
      length: 0,
    }
  })

  const Delta = Quill.import('delta')

  const deleteSpy = jest.spyOn(quill, 'deleteText')
  deleteSpy.mockImplementation(() => new Delta().delete(0))
  const embedSpy = jest.spyOn(quill, 'insertEmbed')
  embedSpy.mockImplementation(() => new Delta().delete(0))
  const insertTextSpy = jest.spyOn(quill, 'insertText')
  insertTextSpy.mockImplementation(() => new Delta().delete(0))

  const module = new QuillOEmbedModule(quill)

  const anyGlobal = global as any
  anyGlobal.fetch = jest.fn()

  it("ignores pastes that don't contain a valid URL", () => {
    module.pasteHandler(
      {
        data: 'abcdef',
      },
      new Delta().insert('abcdef'),
    )

    expect(fetch).not.toBeCalled()
  })

  it("ignores pastes with a URL that doesn't contain oembed", () => {
    module.pasteHandler(
      {
        data: 'https://example.com',
      },
      new Delta().insert('https://example.com'),
    )

    expect(fetch).not.toBeCalled()
  })

  it('embeds an image for oembed type photo', async () => {
    anyGlobal.fetch.mockImplementationOnce(getFetchResult('photo'))

    await module.processRequest({
      data: oEmbedUrl,
    })

    expect(anyGlobal.fetch.mock.calls[0][0]).toMatch(oEmbedUrl)
    expect(embedSpy).toBeCalledWith(0, 'image', imageUrl, 'api')
    expect(deleteSpy).toBeCalledWith(1, oEmbedUrl.length)
  })

  async function testHtmlEmbed() {
    await module.processRequest({
      data: oEmbedUrl,
    })

    const expectedValue = {
      height: undefined,
      width: undefined,
      html: richHtml,
    }

    expect(anyGlobal.fetch.mock.calls[0][0]).toMatch(oEmbedUrl)
    expect(embedSpy).toBeCalledWith(0, 'oembed-wrapper', expectedValue, 'api')
    expect(deleteSpy).toBeCalledWith(1, oEmbedUrl.length)
  }

  it('embeds an oembed-wrapper for oembed type rich', async () => {
    embedSpy.mockReset()
    anyGlobal.fetch.mockImplementationOnce(getFetchResult('rich'))

    await testHtmlEmbed()
  })

  it('embeds an oember-wrapper for oembed type video', async () => {
    embedSpy.mockReset()
    anyGlobal.fetch.mockImplementationOnce(getFetchResult('video'))

    await testHtmlEmbed()
  })

  it('replaces oEmbed URL with target URL on failure', async () => {
    anyGlobal.fetch.mockImplementationOnce(() => Promise.reject('Broken request'))

    await module.processRequest({ data: oEmbedUrl })
    expect(deleteSpy).toBeCalledWith(0, oEmbedUrl.length)
    expect(insertTextSpy).toBeCalledWith(0, 'http://www.youtube.com/watch?v=iwGFalTRHDA')
  })

  it("doesn't remove the link if there is no known oEmbed type", async () => {
    deleteSpy.mockReset()

    anyGlobal.fetch.mockImplementationOnce(getFetchResult('unknown'))

    await module.processRequest({ data: oEmbedUrl })
    expect(deleteSpy).not.toBeCalled()
  })
})
