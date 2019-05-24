import { ODataParams, Repository } from '@sensenet/client-core'
import { ReactElement } from 'react'

/**
 * Properties for list picker component.
 * @interface ListPickerProps
 * @template T
 */
export interface ListPickerProps<T> {
  /**
   * Repositry to load contents from.
   * To use the default load options you need to provide a repository.
   * @type {Repository}
   */
  repository: Repository

  /**
   * OData parameters for list items.
   * @default { select: ['DisplayName', 'Path', 'Id'],
   *   filter: "(isOf('Folder') and not isOf('SystemFolder'))",
   *   metadata: 'no',
   *   orderby: 'DisplayName',}
   */
  itemsODataOptions?: ODataParams<T>

  /**
   * OData parameters for the parent list item.
   * @default {
   *   select: ['DisplayName', 'Path', 'Id', 'ParentId', 'Workspace'],
   *   expand: ['Workspace'],
   *   metadata: 'no',
   * }
   */
  parentODataOptions?: ODataParams<T>

  /**
   * The current content's path.
   * @type {string}
   * @default '' // - empty string (This will load content under default site)
   */
  currentPath?: string

  /**
   * Called on navigation. Can be used to clear the selected state and to know the path
   * of the navigation.
   */
  onNavigation?: (path: string) => void

  /**
   * Called on click with the current item.
   */
  onSelectionChanged?: (node: T) => void

  /**
   * Render a loading component when loadItems called.
   * @default null
   */
  renderLoading?: () => ReactElement

  /**
   * Render an error component when error happened in loadItems call.
   * @default null
   */
  renderError?: (message: string) => ReactElement

  /**
   * Function to render the item component.
   * @default
   * ```js
   * const defaultRenderItem = (node: T) => (
   * <ListItem button={true} selected={node.Id === selectedId}>
   *   <ListItemIcon>
   *     <Icon type={iconType.materialui} iconName="folder" />
   *   </ListItemIcon>
   *   <ListItemText primary={node.DisplayName} />
   * </ListItem>
   * )
   * ```
   */
  renderItem?: (props: T) => ReactElement<T>
}
