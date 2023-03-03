import {FormControl} from '@angular/forms';
import {AsyncValidatorFn, ValidatorFn} from '@angular/forms';
import {NaoFormOptions} from './nao-form-options';
import {cloneAbstractControl, NaoFormStatic} from './nao-form-static.class';
import {BehaviorSubject} from 'rxjs';
import {isPlainObject, pick, merge} from 'lodash';
import {NaoMessageNamespace} from "./nao-form.interface";
import {generateRandomHash} from "./nao-utils.static";

export class NaoFormControl extends FormControl {
  /**
   * Unique Id
   */
  public readonly id: string;
  /**
   * Meta data
   */
  public metadata$ = new BehaviorSubject<any>(null);
  /**
   * Nao messages
   */
  private naoMessages$ = new BehaviorSubject<NaoMessageNamespace.NaoMessage[]>([]);

  constructor(
    formState?: any,
    options?: ValidatorFn | ValidatorFn[] | NaoFormOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
    meta?: any
  ) {
    super(formState, options, asyncValidator);
    // -->Set: id
    this.id = generateRandomHash(12);
    // -->Set: meta
    if (meta) {
      this.setMetadata(meta);
    }
  }


  /**
   * When we what to set messages to a control from BE, we would use the naoMessages.
   * They are set nested based on dataPointer and by default we clear any other messages that you have
   *
   * @Example:
   *  const data = {
   *           messages: [
   *              { type: 'error-message', dataPointer: 'data.orderLines', data: { errorType: 'duplicated' }  },
   *              { type: 'error-message', dataPointer: '', data: { errorId: 'invalid' }  },
   *          ],
   *          options: {
   *              clearOtherMessages: true
   *          }
   *     }
   *
   *   control.setNaoMessages(data);
   *      > Would clear other messages
   *      - This would set an error message with an errorId: 'invalid' to the current control
   *      - This would set an error message to the 'data.orderLines' with errorType: 'duplicated'
   *
   *
   *    const data = {
   *           messages: [
   *              { type: 'info-message', dataPointer: 'data.orderLines', data: { errorType: 'Info message' }  },
   *              { type: 'notification-message', dataPointer: '', data: { text: 'Notification message' }  },
   *          ],
   *          options: {
   *              clearOtherMessages: false
   *          }
   *     }
   *
   *   control.setNaoMessages(data);
   *      - This would set and info message to orderLines
   *      - This would set an notification message to the current control
   *
   *   @Warning: All the nao messages from before would still be available because of options.clearOtherMessages = false
   */
  public setNaoMessages(data: NaoMessageNamespace.NaoMessagesInterface): NaoFormControl {
    // -->Set: options
    const opt$: NaoMessageNamespace.Options = data?.options || {clearOtherMessages: true};

    // -->Check: if we need to clear all the messages
    if (opt$.clearOtherMessages) {
      // -->Clear: messages
      this.clearNaoMessages({clearChildren: true});
    }

    // -->Iterate: over messages
    if (Array.isArray(data?.messages) && data?.messages?.length) {
      /**
       * Set: messages to the current control
       */
        // -->Get: messages for current control
      const currentControlMessages = data.messages.filter(f => !f.dataPointer);
      if (currentControlMessages.length) {
        // -->Set: the message to this control
        this.naoMessages$.next([...this.naoMessages$.getValue(), ...currentControlMessages.map(f => {
          delete f.dataPointer;
          return f;
        })]);
      }
    }

    return this;
  }


  /**
   * Get all the nao messages for this formGroup based on types
   *
   * @example:
   *       control.getNaoMessages();
   *       control.getNaoMessages('error-message');
   *       control.getNaoMessages(["info-message", "notification-message"]);
   */
  public getNaoMessages(data?: NaoMessageNamespace.Type[] | NaoMessageNamespace.Type): NaoMessageNamespace.NaoMessage[] {
    // -->Set: the types we need to filter
    let types: NaoMessageNamespace.Type[] = [];
    if (Array.isArray(data) && data.length) {
      types.push(...data);
    } else if (typeof data === "string") {
      types.push(data);
    } else {
      // -->Set: all types;
      types = [...NaoMessageNamespace.TypeList];
    }

    // -->Filter: messages based on types
    return this.naoMessages$.getValue()?.filter(f => types.includes(f?.type)) || [];
  }


  /**
   * Get: Nao error messages
   *
   * This will retrieve all the messages of type 'error-message'
   */
  public getNaoErrorMessages(): NaoMessageNamespace.NaoMessage[] {
    return this.naoMessages$.getValue()?.filter(f => "error-message" === f?.type) || [];
  }


  /**
   * Get: Nao info messages
   *
   * This will retrieve all the messages of type 'info-message'
   */
  public getNaoInfoMessages(): NaoMessageNamespace.NaoMessage[] {
    return this.naoMessages$.getValue()?.filter(f => "info-message" === f?.type) || [];
  }


  /**
   * Get: Nao notification messages
   *
   * This will retrieve all the messages of type 'notification-message'
   */
  public getNaoNotificationMessages(): NaoMessageNamespace.NaoMessage[] {
    return this.naoMessages$.getValue()?.filter(f => "notification-message" === f?.type) || [];
  }


  /**
   * Clear all the nao messages from the current control
   */
  public clearNaoMessages(opt?: { clearChildren: boolean }): NaoFormControl {
    this.naoMessages$.next([]);

    return this;
  }


  /**
   * Get metadata
   * @example
   *    form.getMetadata('value')
   *    form.getMetadata()
   */
  public getMetadata(...indexes: string[]): any {
    if (Array.isArray(indexes) && indexes.length) {
      return pick(this.metadata$.getValue(), indexes);
    }
    return this.metadata$.getValue();
  }

  /**
   * Set metadata
   * @example
   *    form.setMetadata({ value: 'Pied Piper', ceo: 'Richard Hendrix' })
   */
  public setMetadata(meta: any, mergeData = false): NaoFormControl {
    if (!isPlainObject(meta)) {
      throw new Error(`Metadata must be an object. Ex: { value: 'Pied Piper' }`);
    }
    this.metadata$.next(mergeData ? merge({}, meta, this.metadata$.getValue()) : meta);
    return this;
  }

  /**
   * List the keys
   *    @example
   *      formControl.listMetadataKeys() --> ['value', 'ceo']
   */
  public listMetadataKeys(): string[] {
    return Object.keys(this.metadata$.getValue() || {});
  }

  /**
   * Clear the keys
   *    @example
   *      formControl.clearMetadataKeys()
   */
  public clearMetadata(): NaoFormControl {
    this.metadata$.next(null);
    return this;
  }

  /**
   * Resets the form control, marking it pristine and untouched, and setting the value to null.
   */
  public empty(options: { onlySelf?: boolean; emitEvent?: boolean; } = {}): void {
    return super.reset(null, options);
  }

  /**
   * Get all errors
   */
  public getAllErrors() {
    return NaoFormStatic.getAllErrors(this);
  }

  /**
   * Check if control has errors
   */
  public hasErrors(): boolean {
    return this.getAllErrors() !== null;
  }

  /**
   * Check if value is greater then formControl value
   * @param value
   */
  public gt(value: number): boolean {
    return !isNaN(+this.value) ? this.value > value : false;
  }

  /**
   * Check if value is less then formControl value
   * @param value
   */
  public lt(value: number): boolean {
    return !isNaN(+this.value) ? this.value < value : false;
  }

  /**
   * Check if value is equal with the formControl value
   * @param value
   */
  public eq(value: string | number | boolean): boolean {
    return this.value === value;
  }

  /**
   * Check if value is greater or equal then formControl value
   * @param value
   */
  public gte(value: number): boolean {
    return !isNaN(+this.value) ? this.value >= value : false;
  }

  /**
   * Check if value is less or equal then formControl value
   * @param value
   */
  public lte(value: number): boolean {
    return !isNaN(+this.value) ? this.value <= value : false;
  }

  /**
   * Check if value is not equal with formControl value
   * @param value
   */
  public not(value: string | number | boolean): boolean {
    return this.value !== value;
  }

  /**
   * Clone the current formControl
   */
  public clone(reset = false): NaoFormControl {
    const fc = cloneAbstractControl<NaoFormControl>(this);
    if (reset) {
      fc.reset({onlySelf: false, emitEvent: false});
    }
    return fc;
  }
}
