/**
 * @module  Actions
 * @description Module that contains the action creators.
 *
 * _Redux actions are payloads of information that send data from your application to your store. They are the only source of information for the store. You send them to the store using
 * ```store.dispatch()```. Actions are plain JavaScript objects. Actions must have a type property that indicates the type of action being performed._
 *
 * Learn more about Redux actions [here](http://redux.js.org/docs/basics/Actions.html)
 *
 * Following are Redux actions but they're all related with a sensenet built-in action. Since this sensenet built-in actions are OData actions and functions and they get and set
 * data throught ajax request we have to handle the main steps of their process separately. There's a custom [middleware](https://github.com/SenseNet/sn-redux-promise-middleware)
 * included automatically when you create a sensenet store with Store.createSensenetStore. So that we don't have to create separate redux actions for every state of the actions
 * only one for the main request.
 *
 * All of the JSON responses with content or collection are normalized so you shouldn't care about how to handle nested data structure, normalizr takes JSON and a schema and replaces
 * nested entities with their Ids, gathering all entities in dictionaries.
 * For further information about normalizr check this [link](https://github.com/paularmstrong/normalizr).
 *
 * ```
 * [{
 *  Id: 5145,
 *  DisplayName: 'Some Article',
 *  Status: ['Active']
 * }, {
 *  Id: 5146,
 *  Displayname: 'Other Article',
 *  Status: ['Completed']
 * }]
 *
 * ```
 *
 * is normalized to
 *
 * ```
 * results: [5145, 5146],
 * entities: {
 *  collection: {
 *      5145: {
 *          Id: 5145,
 *          DisplayName: 'Some Article',
 *          Status: ['Active']
 *      },
 *      5146: {
 *          Id: 5146,
 *          Displayname: 'Other Article',
 *          Status: ['Completed']
 *      }
 *  }
 * }
 * ```
 *
 * ### Using built-in redux actions in your views
 *
 * ```
 * import React from 'react'
 * import { connect } from 'react-redux'
 * import { TextField } from 'material-ui/TextField';
 * import RaisedButton from 'material-ui/RaisedButton';
 * import { Actions } from '@sensenet/redux';
 * import { Task } from '@sensenet/default-content-types';
 *
 * let AddTodo = ({ dispatch }) => {
 *   let input
 *
 *   return (
 *     <div>
 *       <form onSubmit={e => {
 *         e.preventDefault()
 *         if (!input.value.trim()) {
 *           return
 *         }
 *         const content = {
 *           Name: input.value,
 *           Status: 'active',
 *          } as Task
 *
 *         dispatch(Actions.createContent(content))
 *         input.value = ''
 *       } }>
 *         <input className="textField" ref={node => {
 *           input = node
 *         } } />
 *         <RaisedButton type="submit" primary={true} label="Add Todo" />
 *       </form>
 *     </div>
 *   )
 * }
 * ```
 *
 * ### Combining your custom redux reducers with sensenet root reducer.
 *
 * ```
 * import { combineReducers } from 'redux';
 * import { Store, Reducers } from '@sensenet/redux';
 * import { Repository } from '@sensenet/client-core'
 * import { Root } from './components/Root'
 * import { listByFilter } from './reducers/filtering'
 *
 * const sensenet = Reducers.sensenet;
 * const myReducer = combineReducers({
 *   sensenet,
 *   listByFilter
 * });
 * const repository = new Repository({ repositoryUrl: 'https://mySensenetSite.com' }, async () => ({ ok: true } as any))
 * const options = {
 * repository,
 * rootReducer: myReducer
 * } as Store.CreateStoreOptions
 * const store = Store.createSensenetStore(options);
 * ```
 */
/**
 */
import { GoogleOauthProvider } from '@sensenet/authentication-google'
import {
  CommentWithoutCreatedByAndId,
  Content,
  LoginState,
  ODataFieldParameter,
  ODataParams,
  Repository,
  RepositoryConfiguration,
  SharingOptions,
} from '@sensenet/client-core'
import { PathHelper } from '@sensenet/client-utils'
import { FieldSetting, GenericContent, PermissionRequestBody, User } from '@sensenet/default-content-types'
import { PromiseMiddlewareAction } from '@sensenet/redux-promise-middleware'

/**
 * Type alias for getting the result type from a Promise middleware
 */
export type PromiseReturns<T> = T extends (...args: any[]) => PromiseMiddlewareAction<any, infer U> ? U : any

/**
 * Action creator for requesting a content from sensenet Content Repository to get its children content.
 * @param path path of the requested parent item.
 * @param options Represents an ODataOptions object based on the IODataOptions interface. Holds the possible url parameters as properties.
 * @returns Returns normalized data while dispatches the next action based on the response.
 */
export const requestContent = (path: string, options?: ODataParams<GenericContent>) => ({
  type: 'FETCH_CONTENT',
  payload: (repository: Repository) =>
    repository.loadCollection({
      path,
      oDataOptions: options,
    }),
})

/**
 * Action creator for loading a content from sensenet Content Repository.
 * @param idOrPath {number|string} Id or path of the requested item.
 * @param options {OData.IODataParams<T>} Represents an ODataOptions object based on the IODataOptions interface. Holds the possible url parameters as properties.
 * @returns Returns the Content while dispatches the next action based on the response.
 */
export const loadContent = <T extends GenericContent = GenericContent>(
  idOrPath: number | string,
  options: ODataParams<T> = {},
) => ({
  type: 'LOAD_CONTENT',
  payload: (repository: Repository) => {
    const o: ODataParams<T> = {}
    switch (typeof options.expand) {
      case 'undefined':
        o.expand = ['Workspace']
        break
      case 'string':
        if (options.expand === 'Workspace') {
          o.expand = ['Workspace']
        } else {
          o.expand = [options.expand, 'Workspace'] as ODataFieldParameter<T>
        }
        break
      default:
        options.expand !== undefined
          ? (o.expand = [...(options.expand as string[]), 'Workspace'] as ODataFieldParameter<GenericContent>)
          : (o.expand = ['Workspace'])
    }
    o.select =
      options.select !== undefined
        ? ([...(options.select as string[]), 'Workspace'] as ODataFieldParameter<T>)
        : ['Workspace']
    return repository.load<T>({ idOrPath, oDataOptions: o })
  },
})
/**
 * Action creator for loading Actions of a Content from sensenet Content Repository.
 * @param idOrPath {number | string} Id or path of the requested Content.
 * @param scenario {string} The Actions should be in the given Scenario
 * @returns Returns the list of actions and dispatches the next action based on the response.
 */
export const loadContentActions = (idOrPath: number | string, scenario?: string) => ({
  type: 'LOAD_CONTENT_ACTIONS',
  payload: (repository: Repository) => repository.getActions({ idOrPath, scenario }),
})
/**
 * Action creator for creating a Content in the Content Repository.
 * @param parentPath {string} Path of the Content where the new Content should be created.
 * @param content {Content} Content that have to be created in the Content Respository.
 * @param contentType {string} Name of the Content Type of the Content.
 * @param contentTemplate {string} Optional parameter to define which content template should be used on creation.
 * @returns Returns the newly created Content and dispatches the next action based on the response.
 */
export const createContent = <T extends Content = Content>(
  parentPath: string,
  content: T,
  contentType: string,
  contentTemplate?: string,
) => ({
  type: 'CREATE_CONTENT',
  payload: (repository: Repository) => repository.post<T>({ parentPath, content, contentType, contentTemplate }),
})
/**
 * Action creator for updating fields of a Content in the Content Repository.
 * @param content {GenericContent} Content that should be updated.
 * @param saveableFields {Partial<T>} object with the patchable Fields.
 * @returns Returns the modified Content and dispatches the next action based on the response.
 */
export const updateContent = <T extends Content = Content>(content: GenericContent, saveableFields: Partial<T>) => ({
  type: 'UPDATE_CONTENT',
  payload: (repository: Repository) => repository.patch<T>({ idOrPath: content.Id, content: saveableFields }),
})
/**
 * Action creator for reseting a Content (update the given Fields and reset all the others with their default value) in the Content Repository.
 * @param content {GenericContent} Content that should be updated.
 * @param saveableFields {Partial<T>} object with the patchable Fields.
 * @returns Returns the modified Content and dispatches the next action based on the response.
 */
export const resetContent = <T extends Content = Content>(content: GenericContent, saveableFields: Partial<T>) => ({
  type: 'RESET_CONTENT',
  payload: (repository: Repository) => repository.put<T>({ idOrPath: content.Id, content: saveableFields }),
})
/**
 * Action creator for deleting a Content from the Content Repository.
 * @param idOrPath {number | string} Id or path of the Content object that should be deleted.
 * @param permanently {boolean} Defines whether the a Content must be moved to the Trash or deleted permanently.
 * @returns Returns an object with the deleted item or error  and dispatches the next action based on the response.
 */
export const deleteContent = (idOrPath: number | string, permanently = false) => ({
  type: 'DELETE_CONTENT',
  payload: (repository: Repository) => repository.delete({ idOrPath, permanent: permanently }),
})
/**
 * Action creator for deleting multiple Content from the Content Repository.
 * @param contentItems {Array<number | string>} Array of ids or paths' of the Content items that should be deleted.
 * @param permanently {boolean} Defines whether Content must be moved to the Trash or deleted permanently.
 * @returns Returns an object with the deleted items or errors  and dispatches the next action based on the response.
 */
export const deleteBatch = (contentItems: Array<number | string>, permanently = false) => ({
  type: 'DELETE_BATCH',
  payload: (repository: Repository) => repository.delete({ idOrPath: contentItems, permanent: permanently }),
})
/**
 * Action creator for copying a Content in the Content Repository.
 * @param idOrPath {number|string} Id or path of the Content that should be copied.
 * @param targetPath {string} Path of the parent Content where the given Content should be copied.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const copyContent = (idOrPath: number | string, targetPath: string) => ({
  type: 'COPY_CONTENT',
  payload: (repository: Repository) => repository.copy({ idOrPath, targetPath }),
})
/**
 * Action creator for copying multiple Content in the Content Repository.
 * @param idOrPath {Array<number | string>} Ids or paths' of the Content items that should be copied.
 * @param targetPath {string} Path of the parent Content where the given Content should be copied.
 * @returns Returns the list of the Content and dispatches the next action based on the response.
 */
export const copyBatch = (items: Array<number | string>, targetPath: string) => ({
  type: 'COPY_BATCH',
  payload: (repository: Repository) => repository.copy({ idOrPath: items, targetPath }),
})
/**
 * Action creator for moving a Content in the Content Repository.
 * @param idOrPath {number|string} Id or path of the Content that should be moved.
 * @param targetPath {string} Path of the parent Content where the given Content should be moved.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const moveContent = (idOrPath: number | string, targetPath: string) => ({
  type: 'MOVE_CONTENT',
  payload: (repository: Repository) => repository.move({ idOrPath, targetPath }),
})
/**
 * Action creator for moving multiple Content in the Content Repository.
 * @param idOrPath {Array<number | string>} Ids or paths' of the Content items that should be moved.
 * @param targetPath {string} Path of the parent Content where the given Content should be moved.
 * @returns Returns the list of the Content and dispatches the next action based on the response.
 */
export const moveBatch = (items: Array<number | string>, targetPath: string) => ({
  type: 'MOVE_BATCH',
  payload: (repository: Repository) => repository.move({ idOrPath: items, targetPath }),
})
/**
 * Action creator for checking out a Content in the Content Repository.
 * @param idOrPath {number | string} Id or path of the Content that should be checked out.
 * @param options {ODataParams} Options to filter the response.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const checkOut = <T extends Content = Content>(idOrPath: number | string, options?: ODataParams<T>) => ({
  type: 'CHECKOUT_CONTENT',
  payload: (repository: Repository) => repository.versioning.checkOut(idOrPath, options),
})
/**
 * Action creator for checking in a Content in the Content Repository.
 * @param idOrPath {number | string} Id or Path of the Content that should be checked in.
 * @param checkInComments {string=''} Comments of the checkin.
 * @param options {ODataParams} Options to filter the response.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const checkIn = <T extends Content = Content>(
  idOrPath: number | string,
  checkInComments = '',
  options?: ODataParams<T>,
) => ({
  type: 'CHECKIN_CONTENT',
  payload: (repository: Repository) => repository.versioning.checkIn(idOrPath, checkInComments, options),
})
/**
 * Action creator for publishing a Content in the Content Repository.
 * @param idOrPath {number | string} Id or Path of the Content that should be published.
 * @param options {ODataParams} Options to filter the response.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const publish = <T extends Content = Content>(idOrPath: number | string, options?: ODataParams<T>) => ({
  type: 'PUBLISH_CONTENT',
  payload: (repository: Repository) => repository.versioning.publish(idOrPath, options),
})
/**
 * Action creator for approving a Content in the Content Repository.
 * @param idOrPath {number | string} Id or Path of the Content that should be approved.
 * @param options {ODataParams} Options to filter the response.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const approve = <T extends Content = Content>(idOrPath: number | string, options?: ODataParams<T>) => ({
  type: 'APPROVE_CONTENT',
  payload: (repository: Repository) => repository.versioning.approve(idOrPath, options),
})

/**
 * Action creator for rejecting a Content in the Content Repository.
 * @param idOrPath {number | string} Id or Path of the Content that should be rejected.
 * @param rejectReason {string} Reason of rejecting.
 * @param options {ODataParams} Options to filter the response.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const rejectContent = <T extends Content = Content>(
  idOrPath: number | string,
  rejectReason = '',
  options?: ODataParams<T>,
) => ({
  type: 'REJECT_CONTENT',
  payload: (repository: Repository) => repository.versioning.reject(idOrPath, rejectReason, options),
})
/**
 * Action creator for undoing checkout on a Content in the Content Repository.
 * @param idOrPath {number | string} Id or Path of the Content on which undo checkout be called.
 * @param options {ODataParams} Options to filter the response.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const undoCheckout = <T extends Content = Content>(idOrPath: number | string, options?: ODataParams<T>) => ({
  type: 'UNDOCHECKOUT_CONTENT',
  payload: (repository: Repository) => repository.versioning.undoCheckOut(idOrPath, options),
})
/**
 * Action creator for force undoing checkout on a Content in the Content Repository.
 * @param idOrPath {number | string} Id or Path of the Content on which force undo checkout be called.
 * @param options {ODataParams} Options to filter the response.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const forceUndoCheckout = <T extends Content = Content>(
  idOrPath: number | string,
  options?: ODataParams<T>,
) => ({
  type: 'FORCE_UNDOCHECKOUT_CONTENT',
  payload: (repository: Repository) => repository.versioning.forceUndoCheckOut(idOrPath, options),
})
/**
 * Action creator for restoring the version of a Content in the Content Repository.
 * @param idOrPath {number | string} Id or Path of the Content that should be checked in.
 * @param version {string} Specify which old version to restore.
 * @param options {ODataParams} Options to filter the response.
 * @returns Returns the Content and dispatches the next action based on the response.
 */
export const restoreVersion = <T extends Content = Content>(
  idOrPath: number | string,
  version: string,
  options?: ODataParams<T>,
) => ({
  type: 'RESTOREVERSION_CONTENT',
  version,
  payload: (repository: Repository) => repository.versioning.restoreVersion(idOrPath, version, options),
})
/**
 * Action creator for check user state in a sensenet application.
 * @returns Returns a redux action with the properties.
 */
export const loginStateChanged = (loginState: LoginState) => ({
  type: 'USER_LOGIN_STATE_CHANGED',
  loginState,
})
/**
 * Action creator for user changes.
 * @param user {ContentTypes.User} User that should be checked.
 * @returns Returns a redux action with the properties.
 */
export const userChanged = (user: User) => ({
  type: 'USER_CHANGED',
  user,
})
/**
 * Action creator for login a user to a sensenet portal.
 * @param userName Login name of the user.
 * @param password Password of the user.
 * @returns Returns a redux action with the properties userName and password.
 */
export const userLogin = (userName: string, password: string) => ({
  type: 'USER_LOGIN',
  payload: (repository: Repository) => repository.authentication.login(userName, password),
})
// /**
//  * Action creator for handling a user login success response without a loggedin user.
//  * @param {boolean} response Response of the login request
//  * @returns {Object} Returns a redux action with the properties userName and password.
//  */
// export const userLoginBuffer = (response: boolean) => ({
//     type: 'USER_LOGIN_BUFFER',
//     async payload(repository: Repository) {
//         const data = await new Promise(
//             (resolve, reject) => repository.authentication.currentUser.subscribe((user) => {
//                 resolve(user)
//             }, false))
//         return data
//     },
// })
/**
 * Action creator for login a user to a sensenet portal with her google account.
 * @returnsReturns a redux action.
 */
export const userLoginGoogle = (provider: GoogleOauthProvider, token?: string) => ({
  type: 'USER_LOGIN_GOOGLE',
  payload: () => provider.login(token),
})
/**
 * Action creator for logout a user from a sensenet portal.
 * @returns Returns a redux action.
 */
export const userLogout = () => ({
  type: 'USER_LOGOUT',
  payload: (repository: Repository) => repository.authentication.logout(),
})
/**
 * Action creator for load repository config.
 * @param repositoryConfig {any} The repository config object.
 * @returns Returns a redux action.
 */
export const loadRepository = (repositoryConfig: RepositoryConfiguration) => ({
  type: 'LOAD_REPOSITORY',
  repository: repositoryConfig,
})
/**
 * Action creator for selecting a Content
 * @param id {number} The id of the selected Content
 * @returns Returns a redux action.
 */
export const selectContent = <T extends Content>(content: T) => ({
  type: 'SELECT_CONTENT',
  content,
})
/**
 * Action creator for deselecting a Content
 * @param id {number} The id of the deselected Content
 * @returns Returns a redux action.
 */
export const deSelectContent = <T extends Content>(content: T) => ({
  type: 'DESELECT_CONTENT',
  content,
})
/**
 * Action creator for clearing the array of selected content
 * @returns Returns a redux action.
 */
export const clearSelection = () => ({
  type: 'CLEAR_SELECTION',
})
/**
 * Action creator for uploading a Content into the Content Repository.
 * @param string The parent Content items path.
 * @param file The file that should be uploaded
 * @param contentType ContentType of the Content that should be created with the binary (default is File)
 * @param overwrite Determines whether the existing file with a same name should be overwritten or not (default is true)
 * @param body Contains extra stuff to request body
 * @param propertyName Name of the field where the binary should be saved
 * @returns Returns a redux action with the properties type, content, file, contentType, overwrite, body and propertyName.
 */
export const uploadRequest = <T extends Content>(
  parentPath: string,
  file: File,
  contentTypeName = 'File',
  overwrite = true,
  body?: {},
  propertyName = 'Binary',
) => ({
  type: 'UPLOAD_CONTENT',
  payload: async (repository: Repository) => {
    const data = await repository.upload.file<T>({
      binaryPropertyName: propertyName,
      overwrite,
      file,
      contentTypeName,
      parentPath,
      body,
    })
    return await repository.load<T>({ idOrPath: data.Id })
  },
})
/**
 * Action creator for changing a field value of a content
 * @param {string} name Name of the field.
 * @param {any} value Value of the field.
 */
export const changeFieldValue = (name: string, value: any) => ({
  type: 'CHANGE_FIELD_VALUE',
  name,
  value,
})
/**
 * Action creator for loading schema of a given type
 * @param {string} typeName Name of the Content Type.
 */
export const getSchemaByTypeName = (typeName: string) => ({
  type: 'GET_SCHEMA_BY_TYPENAME',
  payload: (repository: Repository) => repository.schemas.getSchemaByName(typeName),
})
/**
 * Action creator for setting the default select, expandm etc. options
 * @param {string} typeName Name of the Content Type.
 */
export const setDefaultOdataOptions = (options: ODataParams<GenericContent>) => ({
  type: 'SET_ODATAOPTIONS',
  options,
})

/**
 * Action creator for requesting a content from sensenet Content Repository to get count of its children content.
 * @param path path of the requested parent item.
 * @returns Returns number of children content in the given container.
 */
export const getChildrenCount = (path: string) => ({
  type: 'GET_CHILDREN_COUNT',
  payload: (repository: Repository) => repository.fetch(`${path}/$count`),
})

/**
 * Action creator for requesting a content's property from sensenet Content Repository.
 * @param path path of the requested parent item.
 * @param propertyName name of the property
 * @returns Returns a property and its value of the given content.
 */
export const getProperty = (idOrPath: string | number, propertyName: string) => {
  const path = PathHelper.getContentUrl(idOrPath)
  return {
    type: 'GET_PROPERTY',
    payload: (repository: Repository) => repository.fetch(`${path}/${propertyName}`),
  }
}

/**
 * Action creator for requesting a content's property from sensenet Content Repository to get its value.
 * @param path path of the requested parent item.
 * @param propertyName name of the property
 * @returns Returns the value of the given content property.
 */
export const getPropertyValue = (idOrPath: string | number, propertyName: string) => ({
  type: 'GET_PROPERTY_VALUE',
  payload: (repository: Repository) => repository.getPropertyValue(idOrPath, propertyName),
})

/**
 * Action creator for requesting a content's metadata from sensenet Content Repository.
 * @param path path of the requested parent item.
 * @returns Returns metadata of the given content.
 */
export const getMetadata = (idOrPath: string | number) => ({
  type: 'GET_METADATA',
  payload: (repository: Repository) => repository.getMetadata(idOrPath),
})

/**
 * Action creator for loading repository schema
 */
export const getSchema = () => ({
  type: 'GET_SCHEMA',
  payload: (repository: Repository) =>
    repository.executeAction({
      idOrPath: '/Root',
      name: 'GetSchema',
      method: 'GET',
    }),
})

/**
 * Action creator for sharing a content
 * @param options object with the sharing options(identity, level, mode, etc).
 */
export const share = (options: SharingOptions) => ({
  type: 'SHARE',
  payload: (repository: Repository) =>
    repository.share({
      content: options.content,
      identity: options.identity,
      sharingLevel: options.sharingLevel,
      sharingMode: options.sharingMode,
      sendNotification: options.sendNotification ?? true,
    }),
})

/**
 * Action creator for remove a sharing entry
 * @param content Content which holds the sharing entry.
 * @param id Id of the sharing entry to delete.
 */
export const removeSharing = (content: GenericContent, id: number) => ({
  type: 'REMOVE_SHARING',
  payload: (repository: Repository) =>
    repository.executeAction({
      idOrPath: content.Id,
      name: 'RemoveSharing',
      method: 'POST',
      body: {
        id,
      },
    }),
})

/**
 * Action creator for getting sharing entries
 * @param idOrPath Id or Path of the content.
 */
export const getSharingEntries = (idOrPath: number | string) => ({
  type: 'GET_SHARING_ENTRIES',
  payload: (repository: Repository) =>
    repository.executeAction({
      idOrPath,
      name: 'GetSharing',
      method: 'GET',
      body: undefined,
    }),
})

/**
 * Action creator for check preview images.
 * @param idOrPath Id or Path of the content
 * @param generateMissing Sets whether the missing previews should be generated or not.
 */
export const checkPreviews = (idOrPath: number | string, generateMissing?: boolean) => ({
  type: 'CHECK_PREVIEWS',
  payload: (repository: Repository) => repository.preview.check({ idOrPath, generateMissing }),
})

/**
 *  Action creator for get page count of a document.
 * @param idOrPath Id or Path of the content.
 */
export const getPageCount = (idOrPath: number | string) => ({
  type: 'GET_PAGE_COUNT',
  payload: (repository: Repository) => repository.preview.getPageCount({ idOrPath }),
})

/**
 * Action creator for regenerate preview images of a document.
 * @param idOrPath Id or Path of the content.
 */
export const regeneratePreviews = (idOrPath: number | string) => ({
  type: 'REGENERATE_PREVIEW_IMAGES',
  payload: (repository: Repository) => repository.preview.regenerate({ idOrPath }),
})

/**
 * Action creator for adding comments to document pages/preview images
 * @param idOrPath Id or Path of the document
 * @param page Page number
 * @param x Coordinate x of the comment.
 * @param y Coordinate y of the comment.
 * @param text Text of the comment.
 */
export const addPreviewComment = (idOrPath: number | string, page: number, x: number, y: number, text: string) => ({
  type: 'ADD_PREVIEW_COMMENT',
  payload: (repository: Repository) => {
    const comment: CommentWithoutCreatedByAndId = { page, x: x.toString(), y: y.toString(), text }
    return repository.preview.addComment({ idOrPath, comment })
  },
})

/**
 * Action creator for getting comments for a page of a document.
 * @param idOrPath Id or Path of the document
 * @param page Page number
 */
export const getPreviewComments = (idOrPath: number | string, page: number) => ({
  type: 'GET_PREVIEW_COMMENTS',
  payload: (repository: Repository) => repository.preview.getComments({ idOrPath, page }),
})

/**
 * Action creator for removing a specified comment.
 * @param idOrPath Id or Path of the document,
 * @param commentId Id of the comment that should be deleted.
 */
export const removePreviewComment = (idOrPath: number | string, commentId: string) => ({
  type: 'REMOVE_PREVIEW_COMMENT',
  payload: (repository: Repository) => repository.preview.deleteComment({ idOrPath, commentId }),
})
/**
 * Action creator for restoring a content from the Trash.
 * @param idOrPath Id or Path of the content.
 * @param destination Path of the parent where the content should be restored.
 * @param newName Determines rename the content automatically if another content with the same name already exists in the desired parent container
 */
export const restoreFromTrash = (idOrPath: number | string, destination: string, newname?: boolean) => ({
  type: 'RESTORE_FROM_TRASH',
  payload: (repository: Repository) =>
    repository.executeAction({
      idOrPath,
      name: 'Restore',
      method: 'POST',
      body: {
        destination,
        newname,
      },
    }),
})
/**
 * Action creator for get allowedchildtypes of a content
 * @param idOrPath Id or Path of the content
 */
export const getAllowedChildTypes = (idOrPath: number | string) => ({
  type: 'GET_ALLOWED_CHILDTYPES',
  payload: (repository: Repository) =>
    repository.allowedChildTypes.getImplicit({
      idOrPath,
    }),
})

/**
 * Action creator for get effective allowedchildtypes of a content
 * @param idOrPath Id or Path of the content
 */
export const getEffectiveAllowedChildTypes = (idOrPath: number | string) => ({
  type: 'GET_EFFECTIVE_ALLOWED_CHILDTYPES',
  payload: (repository: Repository) =>
    repository.allowedChildTypes.get({
      idOrPath,
    }),
})

/**
 * Action creator for get allowedchildtypes of a content set in the related CTD
 * @param idOrPath Id or Path of the content
 */
export const getAllowedTypesFromCTD = (idOrPath: number | string) => ({
  type: 'GET_ALLOWED_CHILDTYPES_FROM_CTD',
  payload: (repository: Repository) =>
    repository.allowedChildTypes.getExplicit({
      idOrPath,
    }),
})
/**
 * Action creator for adding allowed childtypes to the given content
 * @param idOrPath Id or Path of the content
 * @param contentTypes List of names of the content types that should be added
 */
export const addAllowedChildTypes = (idOrPath: number | string, contentTypes: string[]) => ({
  type: 'ADD_ALLOWED_CHILDTYPES',
  payload: (repository: Repository) => repository.allowedChildTypes.add(idOrPath, contentTypes),
})

/**
 * Action creator for removing allowed childtypes to the given content
 * @param idOrPath Id or Path of the content
 * @param contentTypes List of names of the content types that should be removed
 */
export const removeAllowedChildTypes = (idOrPath: number | string, contentTypes: string[]) => ({
  type: 'REMOVE_ALLOWED_CHILDTYPES',
  payload: (repository: Repository) => repository.allowedChildTypes.remove(idOrPath, contentTypes),
})
/**
 * Action creator for getting a list of contents in a subtree where AllowedChildTypes list is empty
 * @param idOrPath Id or Path of the root of the subtree
 */
export const checkAllowedChildTypes = (idOrPath: number | string) => ({
  type: 'CHECK_ALLOWED_CHILDTYPES',
  payload: (repository: Repository) => repository.allowedChildTypes.listEmpty(idOrPath),
})

/**
 * Action creator for updating a custom field of a content list
 * @param idOrPath Id or Path of the custom field
 * @param field Fields and values that should be updated wrapped to an object
 */
export const udpateListField = (idOrPath: number | string, field: Partial<FieldSetting>) => ({
  type: 'UPDATE_LIST_FIELD',
  payload: (repository: Repository) =>
    repository.executeAction({
      idOrPath,
      name: 'EditField',
      method: 'POST',
      body: field,
    }),
})
/**
 * Action creator for deleting a custom field from a content list
 * @param idOrPath Id or Path of the custom field
 */
export const deleteListField = (idOrPath: number | string) => ({
  type: 'DELETE_LIST_FIELD',
  payload: (repository: Repository) =>
    repository.executeAction({
      idOrPath,
      name: 'DeleteField',
      method: 'POST',
    }),
})

/**
 * Action creator for check whether the given identity has the given permissions
 * @param idOrPath Id or Path of the content
 * @param permissions List of permissions that should be checked
 * @param identityPath Path of the identity
 */
export const hasPermission = (
  idOrPath: number | string,
  permissions: Array<
    | 'See'
    | 'Preview'
    | 'PreviewWithoutWatermark'
    | 'PreviewWithoutRedaction'
    | 'Open'
    | 'OpenMinor'
    | 'Save'
    | 'Publish'
    | 'ForceCheckin'
    | 'AddNew'
    | 'Approve'
    | 'Delete'
    | 'RecallOldVersion'
    | 'DeleteOldVersion'
    | 'SeePermissions'
    | 'SetPermissions'
    | 'RunApplication'
    | 'ManageListsAndWorkspaces'
    | 'TakeOwnership'
    | 'Custom01'
    | 'Custom02'
    | 'Custom03'
    | 'Custom04'
    | 'Custom05'
    | 'Custom06'
    | 'Custom07'
    | 'Custom08'
    | 'Custom09'
    | 'Custom10'
    | 'Custom11'
    | 'Custom12'
    | 'Custom13'
    | 'Custom14'
    | 'Custom15'
    | 'Custom16'
    | 'Custom17'
    | 'Custom18'
    | 'Custom19'
    | 'Custom20'
    | 'Custom21'
    | 'Custom22'
    | 'Custom23'
    | 'Custom24'
    | 'Custom25'
    | 'Custom26'
    | 'Custom27'
    | 'Custom28'
    | 'Custom29'
    | 'Custom30'
    | 'Custom31'
    | 'Custom32'
  >,
  identityPath?: string,
) => ({
  type: 'HAS_PERMISSION',
  payload: (repository: Repository) => repository.security.hasPermission(idOrPath, permissions, identityPath),
})

/**
 * Action creator for get all permission settings for a content
 * @param idOrPath Id or Path of the content
 * @param identity Path of the identity
 */
export const getPermissions = (idOrPath: string | number, identity?: string) => ({
  type: 'GET_PERMISSIONS',
  payload: (repository: Repository) =>
    identity
      ? repository.security.getPermissionsForIdentity(idOrPath, identity)
      : repository.security.getAllPermissions(idOrPath),
})

/**
 * Action creator for set permissions on a content
 * @param idOrPath Id or Path of the content
 * @param permissions permission request body
 */

export const setPermissions = (idOrPath: string | number, permissions: PermissionRequestBody) => ({
  type: 'SET_PERMISSIONS',
  payload: (repository: Repository) => repository.security.setPermissions(idOrPath, permissions),
})
