import { ConstantContent } from '@sensenet/client-core'
import { Injectable, PathHelper } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import { Query } from '@sensenet/query'
import { CommandProvider, SearchOptions } from '../CommandProviderManager'
import { ContentContextProvider } from '../ContentContextProvider'
import { CommandPaletteItem } from '../../hooks'

@Injectable({ lifetime: 'singleton' })
export class InFolderSearchCommandProvider implements CommandProvider {
  public shouldExec({ term }: SearchOptions): boolean {
    return term[0] === '/'
  }

  public async getItems(options: SearchOptions): Promise<CommandPaletteItem[]> {
    const currentPath = PathHelper.trimSlashes(options.term)
    const segments = currentPath.split('/')
    const ctx = new ContentContextProvider(options.repository)
    const parentPath = PathHelper.trimSlashes(
      PathHelper.joinPaths(...segments.slice(0, segments.length - 1)) || currentPath,
    )
    const result = await options.repository.loadCollection<GenericContent>({
      path: ConstantContent.PORTAL_ROOT.Path,
      oDataOptions: {
        query: new Query(q =>
          q
            .inFolder(`/${currentPath}`)
            .or.query(sub => sub.inFolder(`/${parentPath}`).and.equals('Path', `/${currentPath}*`))
            .sort('Path'),
        ).toString(),
        top: 10,
        select: 'all',
      },
    })
    return result.d.results.map(content => ({
      primaryText: content.DisplayName || content.Name,
      secondaryText: content.Path,
      content,
      url: ctx.getPrimaryActionUrl(content),
      hits: [options.term],
    }))
  }
}
