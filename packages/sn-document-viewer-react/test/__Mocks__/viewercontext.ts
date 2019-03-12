import { Store } from 'redux'
import { DocumentData, DocumentViewerSettings, PreviewImageData } from '../../src/models'
import { Comment } from '../../src/models/Comment'
import { configureStore, RootReducerType } from '../../src/store'

/**
 * Example document data for document viewer context
 */
export const exampleDocumentData: DocumentData = {
  documentName: 'example doc',
  hostName: 'https://example-host',
  documentType: 'word',
  idOrPath: 'example/id/or/path',
  shapes: {
    annotations: [
      {
        index: 1,
        h: 100,
        w: 100,
        x: 10,
        y: 10,
        text: 'Example Text',
        guid: '9a324f30-1423-11e9-bcb9-d719ddfb5f43',
        lineHeight: 15,
        fontBold: '34',
        imageIndex: 1,
        fontColor: 'red',
        fontFamily: 'arial',
        fontItalic: 'false',
        fontSize: '12pt',
      },
    ],
    highlights: [
      {
        guid: '9a324f30-1423-11e9-bcb9-d719ddfb5f43',
        imageIndex: 1,
        h: 100,
        w: 100,
        x: 100,
        y: 100,
      },
    ],
    redactions: [
      {
        guid: '9a324f30-1423-11e9-bcb9-d719ddfb5f43',
        imageIndex: 1,
        h: 100,
        w: 100,
        x: 200,
        y: 200,
      },
    ],
  },
  fileSizekB: 128,
  pageAttributes: [
    {
      options: {
        degree: 3,
      },
      pageNum: 1,
    },
  ],
  pageCount: 1,
}

/**
 * Example preview image data for document viewer context
 */
export const examplePreviewImageData: PreviewImageData = {
  Attributes: {
    degree: 0,
  },
  Height: 1024,
  Width: 768,
  Index: 1,
  PreviewImageUrl: '/',
  ThumbnailImageUrl: '/',
}

/**
 * Example preview comment
 */
export const examplePreviewComment: Comment = {
  createdBy: {
    avatarUrl: 'https://cdn.images.express.co.uk/img/dynamic/79/590x/486693_1.jpg',
    displayName: 'Alba',
    id: 1,
    path: 'some/path',
    userName: 'some/name',
  },
  id: 'someId',
  page: 1,
  text: 'Thats a comment',
  x: 10,
  y: 10,
}

/**
 * Default settings for document viewer context
 */
export const defaultSettings = new DocumentViewerSettings({
  canEditDocument: async () => true,
  canHideRedaction: async () => true,
  canHideWatermark: async () => true,
  getDocumentData: async () => exampleDocumentData,
  getExistingPreviewImages: async () => [examplePreviewImageData],
  isPreviewAvailable: async () => examplePreviewImageData,
  saveChanges: async () => undefined,
  commentActions: {
    addPreviewComment: async () => examplePreviewComment,
    deletePreviewComment: async () => {
      return { modified: true }
    },
    getPreviewComments: async () => [examplePreviewComment],
  },
})

/**
 * Model interface for the text contetxt
 */
export interface DocViewerTestContext {
  /**
   * A store instance
   */
  store: Store<RootReducerType>
  /**
   * The provided settings
   */
  settings: DocumentViewerSettings
}

/**
 * Helper method that allows you to execute tests within a provided context.
 * Usage:
 * ```ts
 * useTestContextWithSettings(
 * {
 *      // you can define the options that you want to override
 * },
 * (context)=>{
 *      // the internal test implementaion
 *      // you can access the preconfigured store and viewer settings on the context parameter
 * })
 * ```
 * @param {Partial<DocumentViewerSettings>} additionalSettings A partial settings object. The provided properties will override the default ones
 * @param {(context: DocViewerTestContext) => void} callback Callback for the internal test implemetation
 */
export const useTestContextWithSettings = (
  additionalSettings: Partial<DocumentViewerSettings>,
  callback: (context: DocViewerTestContext) => void,
) => {
  const settings = new DocumentViewerSettings({
    ...defaultSettings,
    ...additionalSettings,
  })
  const store = configureStore(settings)
  callback({ store, settings })
}

/**
 * Helper method that allows you to execute tests within a provided context.
 * Usage:
 * ```ts
 * useTestContext((context)=>{
 *      // the internal test implementaion
 *      // you can access the preconfigured store and viewer settings on the context parameter
 * })
 * ```
 * @param {(context: DocViewerTestContext) => void} callback Callback for the internal test implemetation
 */
export const useTestContext = (callback: (context: DocViewerTestContext) => void) =>
  useTestContextWithSettings({}, callback)

/**
 * Helper method that allows you to execute tests within a provided context. Supports async / await
 * Usage:
 * ```ts
 * await useTestContextWithSettingsAsync(
 * {
 *      // you can define the options that you want to override
 * }, async (context)=>{
 *      // the internal test implementaion
 *      // you can access the preconfigured store and viewer settings on the context parameter
 *      await someAsyncOperation()
 * })
 * ```
 * @param {Partial<DocumentViewerSettings>} additionalSettings A partial settings object. The provided properties will override the default ones
 * @param {(context: DocViewerTestContext) => Promise<void>} callback Callback for the internal test implemetation
 */
export const useTestContextWithSettingsAsync = async (
  additionalSettings: Partial<DocumentViewerSettings>,
  callback: (context: DocViewerTestContext) => Promise<void>,
) => {
  const settings = new DocumentViewerSettings({
    ...defaultSettings,
    ...additionalSettings,
  })
  const store = configureStore(settings)
  await callback({ store, settings })
}

/**
 * Helper method that allows you to execute tests within a provided context.
 * Usage:
 * ```ts
 * await useTestContextAsync(async (context)=>{
 *      // the internal test implementaion
 *      // you can access the preconfigured store and viewer settings on the context parameter
 *      await someAsyncOperation()
 * })
 * ```
 * @param {(context: DocViewerTestContext) => Promise<void>} callback Callback for the internal test implemetation
 */
export const useTestContextAsync = (callback: (context: DocViewerTestContext) => Promise<void>) =>
  useTestContextWithSettingsAsync({}, callback)
