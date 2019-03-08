import { Injector } from '@furystack/inject/dist/Injector'
import { Repository } from '@sensenet/client-core'
import { RepositoryConfiguration } from '@sensenet/client-core/dist/Repository/RepositoryConfiguration'
import { RepositoryManager } from '../services/RepositoryManager'

declare module '@furystack/inject/dist/Injector' {
  /**
   * Defines an extended Injector instance
   */
  interface Injector {
    getRepository: (url: string, config?: RepositoryConfiguration) => Repository
  }
}

Injector.prototype.getRepository = function(url, config) {
  const manager = this.GetInstance(RepositoryManager)
  const repo = manager.getRepository(url, config)
  this.SetInstance(repo)
  return repo
}
