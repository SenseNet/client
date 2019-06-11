import { Repository } from '@sensenet/client-core'
import { File, GenericContent } from '@sensenet/default-content-types'
import { isContentFromType } from '../utils/isContentFromType'
import { useRepository } from './use-repository'

const fakeClick = (obj: EventTarget) => {
  const ev = document.createEvent('MouseEvents')
  ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  obj.dispatchEvent(ev)
}

const downloadFile = (name: string, repositoryUrl: string) => {
  const saveLink = document.createElement('a')
  saveLink.href = `${repositoryUrl}${name}?download`
  fakeClick(saveLink)
}

export const useDownload = (content: GenericContent, repo: Repository = useRepository()) => {
  const isFile = isContentFromType(content, File, repo.schemas)
  return {
    isFile,
    download: () => downloadFile(content.Path, repo.configuration.repositoryUrl),
  }
}
