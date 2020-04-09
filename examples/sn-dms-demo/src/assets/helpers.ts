import { Group } from '@sensenet/default-content-types'

export const getContentTypeFromUrl = (urlString: string) => {
  const urlTemp = urlString.split('ContentTypeName=')[1]
  const type = urlTemp.indexOf('&') > -1 ? urlTemp.split('&')[0] : urlTemp
  return type.indexOf('ContentTemplates') > -1 ? type.split('/')[3] : type
}

export const getExtensionFromUrl = (urlString: string) => {
  const urlTemp = urlString.split('ContentTypeName=')[1]
  const typeUrl = urlTemp.indexOf('&') > -1 ? urlTemp.split('&')[0] : urlTemp
  const name = typeUrl.split('/')[4]
  return name.split('.')[1]
}

export const fakeClick = (obj: EventTarget) => {
  const ev = document.createEvent('MouseEvents')
  ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  obj.dispatchEvent(ev)
}

export const downloadFile = (name: string, repositoryUrl: string) => {
  const saveLink = document.createElement('a')
  saveLink.href = `${repositoryUrl}${name}?download`
  fakeClick(saveLink)
}

export const versionName = (versionChar: string) => {
  switch (versionChar) {
    case 'A':
      return 'APPROVED'
    case 'L':
      return 'LOCKED'
    case 'D':
      return 'DRAFT'
    case 'P':
      return 'PENDING'
    case 'R':
      return 'REJECTED'
    default:
      return 'APPROVED'
  }
}

const uniqueResultOne = (array1: any[], array2: any[]) =>
  array1.filter((obj) => !array2.some((obj2) => obj.Id === obj2.Id))
const uniqueResultTwo = (array1: any[], array2: any[]) =>
  array2.filter((obj) => !array1.some((obj2) => obj.Id === obj2.Id))

export const arrayComparer = (array1: any[], array2: any[]) =>
  uniqueResultOne(array1, array2).concat(uniqueResultTwo(array1, array2))

export const arrayDiff = (a1: Group[], a2: Group[]) =>
  a1.filter((item1) => !a2.some((item2) => item2.Id === item1.Id && item2.Name === item1.Name))
