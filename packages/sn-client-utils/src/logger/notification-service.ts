import { Injectable } from '../inject'
import { ObservableValue } from '../observable-value'
import { LeveledLogEntry } from '.'

/**
 * A context service to get/set the active notification message
 */
@Injectable({ lifetime: 'singleton' })
export class NotificationService {
  public activeMessages = new ObservableValue<Array<LeveledLogEntry<any>>>([])

  public add(newMessage: LeveledLogEntry<any>) {
    this.activeMessages.setValue([
      ...this.activeMessages.getValue().filter((message) => message.level !== newMessage.level),
      newMessage,
    ])
  }

  public dismiss(oldItem: LeveledLogEntry<any>) {
    this.activeMessages.setValue(
      [...this.activeMessages.getValue()].filter(
        (message) => message && JSON.stringify(message) !== JSON.stringify(oldItem),
      ),
    )
  }
}
