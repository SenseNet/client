import { Workspace } from '@sensenet/default-content-types'
import { combineReducers, Reducer } from 'redux'
import { loadContent, PromiseReturns } from '../Actions'
import { batchResponses } from './batchresponses'
import { currentcontent } from './currentcontent'
import { currentitems } from './currentitems'
import { selected } from './selected'
import { session } from './session'
import { sharing } from './sharing'

/**
 * Reducer to handle Actions on the currentworkspace object.
 * @param state Represents the current state.
 * @param action Represents an action that is called.
 * @returns state. Returns the next state based on the action.
 */
export const currentworkspace: Reducer<Workspace | null> = (state = null, action) => {
  switch (action.type) {
    case 'LOAD_CONTENT_SUCCESS': {
      const workspace = (action.result as PromiseReturns<typeof loadContent>).d.Workspace
      if (workspace && (workspace as any).Id) {
        return (action.result as PromiseReturns<typeof loadContent>).d.Workspace as Workspace
      }
      return state
    }
    default:
      return state
  }
}
/**
 * Reducer combining session, currentitems, currentcontent and selected into a single object, ```sensenet``` which will be the top-level one.
 */
export const sensenet = combineReducers<{
  session: ReturnType<typeof session>
  currentworkspace: ReturnType<typeof currentworkspace>
  currentcontent: ReturnType<typeof currentcontent>
  currentitems: ReturnType<typeof currentitems>
  selected: ReturnType<typeof selected>
  batchResponses: ReturnType<typeof batchResponses>
  sharing: ReturnType<typeof sharing>
}>({
  session,
  currentworkspace,
  currentcontent,
  currentitems,
  selected,
  batchResponses,
  sharing,
})
