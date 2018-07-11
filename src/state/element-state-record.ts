import { ArcEvent } from '../arc-event';
import { IArcHandler } from '../model';

const functionCalls: Array<'onOutgoing' | 'onIncoming' | 'onFocus'> = [
  'onOutgoing',
  'onIncoming',
  'onFocus',
];

/**
 * ElementStateRecord is stored in the StateContainer. A single element might
 * have several records attached to it; the ArcRecord collates and merges them
 * into a single handler.
 */
export class ElementStateRecord {
  /**
   * The merged handler, suitable for public use.
   */
  public resolved: Readonly<IArcHandler> | undefined;

  /**
   * A list of all registered handlers.
   */
  private readonly records: Array<{ key: any; handler: IArcHandler }>;

  constructor(key: any, initialHandler: IArcHandler) {
    this.resolved = initialHandler;
    this.records = [{ key, handler: initialHandler }];
  }

  public add(key: any, arc: IArcHandler) {
    const existing = this.records.findIndex(r => r.key === key);
    if (existing > -1) {
      this.records[existing] = { key, handler: arc };
    } else {
      this.records.push({ key, handler: arc });
    }
    this.recreateResolved();
  }

  public remove(key: any) {
    const index = this.records.findIndex(r => r.key === key);
    if (index > -1) {
      this.records.splice(index, 1);
    }
    this.recreateResolved();
  }

  private callForEach(method: 'onOutgoing' | 'onIncoming' | 'onFocus') {
    return (arg: HTMLElement | ArcEvent | null) => {
      for (const record of this.records) {
        const fn = record.handler[method];
        if (!fn) {
          continue;
        }

        (fn as any)(arg);

        if (arg instanceof ArcEvent && (arg as any).propogationStopped) {
          break;
        }
      }
    };
  }

  private recreateResolved() {
    if (this.records.length === 0) {
      this.resolved = undefined;
      return;
    }
    if (this.records.length === 1) {
      this.resolved = this.records[0].handler;
      return;
    }

    const resolved = { ...this.records[0].handler };
    for (let i = 1; i < this.records.length; i++) {
      Object.assign(resolved, this.records[i].handler);
    }

    for (const call of functionCalls) {
      if (resolved[call]) {
        resolved[call] = this.callForEach(call);
      }
    }

    this.resolved = resolved;
  }
}
