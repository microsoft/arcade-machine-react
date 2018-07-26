import { Observable } from 'rxjs';
import { Button } from '../model';

/**
 * IInputMethod is a class that provides a list of button presses the
 * user makes.
 */
export interface IInputMethod {
  /**
   * Returns an observable of the user's button presses.
   */
  readonly observe: Observable<Button>;

  /**
   * Returns whether the input method is supported in the current browser.
   */
  readonly isSupported: boolean;
}
