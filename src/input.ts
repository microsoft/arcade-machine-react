import { merge } from 'rxjs';
import { publish, refCount } from 'rxjs/operators';
import { IInputMethod } from './input/input-method';

/**
 * InputService handles passing input from the external device (gamepad API
 * or keyboard) to the arc internals.
 */
export class InputService {
  /**
   * Observes the feed of keyboard/gamepad events. Listened to by the
   * focus service, and can be listened to by other consumers too.
   */
  public readonly events = merge(
    ...this.inputMethods.filter(i => i.isSupported).map(i => i.observe),
  ).pipe(
    publish(),
    refCount(),
  );

  constructor(private readonly inputMethods: IInputMethod[]) {}
}
