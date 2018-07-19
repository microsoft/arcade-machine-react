import { IElementStore } from './focus';
import { ScrollRegistry } from './scroll/scroll-registry';
import { StateContainer } from './state/state-container';

/**
 * IArcServices is held in the ArcSingleton.
 */
export interface IArcServices {
  elementStore: IElementStore;
  stateContainer: StateContainer;
  scrollRegistry: ScrollRegistry;
}

/**
 * The ArcSingleton stores the currently active arcade-machine root and
 * services on the page.
 *
 * Singletons are bad and all that, but generally it never (currently) makes
 * sense to have multiple arcade-machine roots, as they all would clobber over
 * each others' input. Using a singleton rather than, say, react contexts,
 * gives us simpler (and less) code, with better performance.
 */
export class ArcSingleton {
  private services: IArcServices | undefined;

  /**
   * setServices is called by the ArcRoot when it gets set up.
   */
  public setServices(services: Partial<IArcServices> | undefined) {
    if (this.services && services) {
      throw new Error(
        'Attempted to register a second <ArcRoot /> without destroying the first one. ' +
          'Only one arcade-machine root component may be used at once.',
      );
    }

    if (!services) {
      this.services = undefined;
      return;
    }

    this.services = {
      elementStore: services.elementStore!,
      scrollRegistry: new ScrollRegistry(),
      stateContainer: new StateContainer(),
      ...services,
    };
  }

  /**
   * Returns the services. Throws if none are registered.
   */
  public getServices(): IArcServices {
    if (!this.services) {
      throw new Error('You cannot use arcade-machine functionality without an <ArcRoot />.');
    }

    return this.services;
  }
}

export const instance = new ArcSingleton();
