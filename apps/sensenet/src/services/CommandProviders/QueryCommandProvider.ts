import { ConstantContent } from '@sensenet/client-core'
import { Injectable, Injector } from '@sensenet/client-utils'
import { GenericContent } from '@sensenet/default-content-types'
import { CommandPaletteItem } from '../../components/command-palette/CommandPalette'
import { encodeQueryData } from '../../components/search'
import { CommandProvider, SearchOptions } from '../CommandProviderManager'
import { ContentContextService } from '../content-context-service'
import { LocalizationService } from '../LocalizationService'
import { PersonalSettings } from '../PersonalSettings'

@Injectable({ lifetime: 'singleton' })
export class QueryCommandProvider implements CommandProvider {
  constructor(
    public readonly injector: Injector,
    private readonly personalSettings: PersonalSettings,
    private readonly localization: LocalizationService,
  ) {}

  public shouldExec({ term }: SearchOptions): boolean {
    return term != null && term[0] === '+'
  }

  public async getItems(options: SearchOptions): Promise<CommandPaletteItem[]> {
    const ctx = new ContentContextService(options.repository)
    const extendedQuery = this.personalSettings.effectiveValue
      .getValue()
      .default.commandPalette.wrapQuery.replace('{0}', options.term)
    const result = await options.repository.loadCollection<GenericContent>({
      path: ConstantContent.PORTAL_ROOT.Path,
      oDataOptions: {
        query: extendedQuery,
        top: 10,
        select: 'all',
      },
    })
    return [
      ...result.d.results.map((content) => ({
        primaryText: content.DisplayName || content.Name,
        secondaryText: content.Path,
        url: ctx.getPrimaryActionUrl(content),
        content,
        icon: content.Icon,
        hits: options.term.substr(1).replace(/\*/g, ' ').replace(/\?/g, ' ').split(' '),
      })),
      {
        primaryText: this.localization.currentValues.getValue().search.openInSearchTitle,
        secondaryText: this.localization.currentValues.getValue().search.openInSearchDescription,
        url: `/${btoa(options.repository.configuration.repositoryUrl)}/search/${encodeQueryData({
          term: options.term,
        })}`,
        content: { Type: 'Search' } as any,
        hits: [],
      },
    ]
  }
}
