/**
 * Model definitions for preview image data
 */
export interface PreviewImageData {
  /**
   * The page index starting form 1
   */
  Index: number
  Height: number
  Width: number
  PreviewImageUrl?: string
  ThumbnailImageUrl?: string
  PreviewAvailable?: string
}

export interface PreviewRegenerateData {
  PageCount: number
  PreviewCount: number
}
