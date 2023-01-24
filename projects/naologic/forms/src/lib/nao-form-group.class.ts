import {AbstractControl, AsyncValidatorFn, FormGroup, ValidatorFn} from '@angular/forms';
import {get, groupBy, isArray, isPlainObject, map, mapValues, merge, pick, set} from 'lodash';
import {
  callNativeMarkAsFunction,
  cloneAbstractControl,
  getValuesByMarkedAs,
  NaoFormStatic
} from './nao-form-static.class';
import {NaoFormArray} from './nao-form-array.class';
import {NaoFormOptions} from './nao-form-options';
import {NaoAbstractControlOptions, NaoMessageNamespace} from './nao-form.interface';
import {NaoFormControl} from './nao-form-control.class';
import {BehaviorSubject} from 'rxjs';


export class NaoFormGroup<T = any> extends FormGroup {
  public metadata$ = new BehaviorSubject<any>(null);
  private schema: any;
  private formData: {
    [index: string]: { data: FormData, contentLength: number }
  } = {};
  /**
   * Nao messages
   */
  private naoMessages$ = new BehaviorSubject<NaoMessageNamespace.NaoMessage[]>([]);

  constructor(
    controls: { [key: string]: AbstractControl; },
    options?: ValidatorFn | ValidatorFn[] | NaoFormOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
    meta?: any
  ) {
    super(controls, options, asyncValidator);
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
  public setNaoMessages(data: NaoMessageNamespace.NaoMessagesInterface): NaoFormGroup {
    // -->Set: options
    const options: NaoMessageNamespace.Options = data?.options || {clearOtherMessages: true};

    // -->Check: if we need to clear all the messages
    if (options.clearOtherMessages) {
      // -->Clear: messages
      this.clearNaoMessages({clearChildren: true});
    }

    // -->Iterate: over messages
    if (Array.isArray(data?.messages) && data?.messages?.length) {
      // -->Group: the messages based on data pointer
      let messagesGrouped: { dataPointer: string, messages: NaoMessageNamespace.NaoMessage[] }[] =
        map(groupBy(data.messages, 'dataPointer'), (value, key) => ({
          dataPointer: key,
          messages: value || []
        }));


      messagesGrouped.map((el) => {
        // -->Clear: data pointers from messages
        const messages = el.messages?.map((item) => {
          delete item.dataPointer;
          return item;
        }) || [];

        if (!el?.dataPointer) {
          // -->Set: the message to this
          this.naoMessages$.next([...this.naoMessages$.getValue(), ...messages]);
        } else {

          // -->Get: abstract control
          const abstractControl = this.get(el?.dataPointer);
          // -->Check: type
          if (abstractControl instanceof NaoFormGroup || abstractControl instanceof NaoFormArray || abstractControl instanceof NaoFormControl) {
            // -->Clear: data pointer from messages
            abstractControl.setNaoMessages({ messages, options });
          }
        }
      });
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
   * Clear all nao messages from this control with optional to clear all the messages from children as well
   */
  public clearNaoMessages(opt?: { clearChildren: boolean }): NaoFormGroup {
    this.naoMessages$.next([]);

    if (opt?.clearChildren) {
      // -->Iterate: over controls and clear the nao messages
      Object.keys(this.controls).forEach((key: string) => {
        // -->Get: abstract control
        const abstractControl = this.get(key);
        // -->Check: type
        if (abstractControl instanceof NaoFormGroup || abstractControl instanceof NaoFormArray || abstractControl instanceof NaoFormControl) {
          abstractControl.clearNaoMessages(opt);
        }
      })
    }

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
  public setMetadata(meta: any, mergeData = false): NaoFormGroup {
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
  public clearMetadata(): NaoFormGroup {
    this.metadata$.next(null);
    return this;
  }

  /**
   * Merge this form with another form
   */
  public merge(fg: NaoFormGroup, options = {overwrite: true}): void {
    if (fg && fg instanceof NaoFormGroup) {
      Object.keys(fg.value).map(k => {
        if (!this.contains(k) || (this.contains(k) && options.overwrite)) {
          this.setControl(k, fg.get(k) as AbstractControl);
        }
      });
    }
  }

  /**
   * Replace control - is a setControl but it inherits validators
   */
  public replaceControl(name: string, control: AbstractControl): void {
    // -->TODO:Get: validators
    // -->Set: control
    this.setControl(name, control);
    // -->TODO:Set: validators
  }

  /**
   * Enable form after delay
   * @param delay
   * @param opts
   */
  public enableDelay(delay: number, opts?: NaoAbstractControlOptions): void {
    setTimeout(() => this.enable(opts), delay);
  }

  /**
   * Disable form after delay
   * @param delay
   * @param opts
   */
  public disableDelay(delay: number, opts?: NaoAbstractControlOptions): void {
    setTimeout(() => this.disable(opts), delay);
  }

  /**
   * Return only the values of abstract controls marked as `touched`
   */
  public getTouchedValues(): Partial<T> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'touched');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Return only the values of abstract controls marked as `untouched`
   */
  public getUntouchedValues(): Partial<T> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'untouched');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Return only the values of abstract controls marked as `dirty`
   */
  public getDirtyValues(): Partial<T> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'dirty');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Return only the values of abstract controls marked as `pristine`
   */
  public getPristineValues(): Partial<T> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'pristine');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Return only the values of abstract controls marked as `pending`
   */
  public getPendingValues(): Partial<T> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'pending');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Trigger the native `markAs` function
   * @param formGroup
   * @param type
   * @param options
   */
  private markAs(formGroup: NaoFormGroup | NaoFormArray, type: 'touched' | 'untouched' | 'dirty' | 'pristine' | 'pending', options?: NaoAbstractControlOptions): void {
    // -->Call: markAs on self
    callNativeMarkAsFunction(formGroup, type, options);

    // -->Check: if it has controls
    if (formGroup && formGroup.hasOwnProperty('controls')) {
      // -->Loop: controls and execute
      mapValues(formGroup.controls, control => {
        if (control instanceof NaoFormGroup || control instanceof NaoFormArray) {
          this.markAs(control, type, options);
        } else {
          callNativeMarkAsFunction(control as AbstractControl, type, options);
        }
      });
    }
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsTouched on all controls;
   * for NaoFormControl it references the native function markAsTouched
   */
  public markAllAsTouched(opts?: NaoAbstractControlOptions): void {
    this.markAs(this, 'touched', opts);
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsUntouched on all controls
   * for NaoFormControl it references the native function markAsUntouched
   */
  public markAllAsUntouched(opts?: NaoAbstractControlOptions): void {
    this.markAs(this, 'untouched', opts);
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsDirty on all controls
   * for NaoFormControl it references the native function markAsDirty
   */
  public markAllAsDirty(opts?: NaoAbstractControlOptions): void {
    this.markAs(this, 'dirty', opts);
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsPristine on all controls
   * for NaoFormControl it references the native function markAsPristine
   */
  public markAllAsPristine(opts?: NaoAbstractControlOptions): void {
    this.markAs(this, 'pristine', opts);
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsPending on all controls
   * for NaoFormControl it references the native function markAsPending
   */
  public markAllAsPending(opts?: NaoAbstractControlOptions): void {
    this.markAs(this, 'pending', opts);
  }

  /**
   * Get value of this shit
   */
  public getValue(): T {
    return super.getRawValue();
  }

  /**
   * Get object, but only keep the indexes I need
   */
  public getValues(...indexes: string[]): Partial<T> {
    const data: any = this.getValue();

    if (indexes.length === 0) {
      return data;
    } else {
      // -->Get: get each index
      let newData = {};
      // -->Check: if it's an object or array
      if (isPlainObject(data) || isArray(data)) {
        indexes.map(i => {
          // -->Set: data path in new object
          newData = set(newData, i, get(data, i) || null);
        });
        return newData as Partial<T>;
      } else {
        return data as T;
      }
    }
  }

  /**
   * Remove all the empty values: null, undefined, ''
   */
  public removeEmpty(): void {
    this.removeEmptyFromNaoFormGroup(this);
  }

  /**
   * Remove empty or null values from NaoFormGroup
   * @param group
   */
  public removeEmptyFromNaoFormGroup(group: NaoFormGroup) {
    Object.keys(group.controls).map((key: string) => {
      // -->Get: Abstract control
      const abstractControl = group.get(key);

      if (abstractControl instanceof NaoFormGroup) {
        // -->Iterate: over NaoFormGroup
        this.removeEmptyFromNaoFormGroup(abstractControl as NaoFormGroup);
        // -->Check: if the NaoFormGroup is empty and remove it
        if (!Object.keys(abstractControl.controls).length) {
          group.removeControl(key);
        }
      } else if (abstractControl instanceof NaoFormArray) {
        // -->Iterate: over NaoFormArray
        abstractControl.removeEmpty();
        // -->Check: if the NaoFormArray is empty and remove it
        if (!Object.keys(abstractControl.controls).length) {
          group.removeControl(key);
        }
      } else if (abstractControl instanceof NaoFormControl) {
        // -->Remove: control if it's empty or null
        if (abstractControl.value === '' || abstractControl.value === null) {
          group.removeControl(key);
        }
      }
    });
  }

  /**
   * Disable the form group
   */
  public disable(opts?: NaoAbstractControlOptions): any {
    super.disable(opts);
  }

  /**
   * Enable the form group
   */
  public enable(opts?: NaoAbstractControlOptions): any {
    super.enable(opts);
  }

  /**
   * Patch the data, deep
   */
  public patchDeep(data?: any) {
    if (data) {
      super.patchValue(data);
    }
  }

  /**
   * AJV validate
   */
  public validate(): boolean {
    return true;
  }

  /**
   * Add JSON schema with AJV
   * @param schema
   */
  public addJSONSchema(schema: any): boolean {
    this.schema = schema;
    return true;
  }

  /**
   * Add JSON schema with AJV
   * @param schema
   */
  public removeJSONSchema(schema: any): boolean {
    this.schema = null;
    return true;
  }

  /**
   * Get all errors from this form
   */
  public getAllErrors() {
    return NaoFormStatic.getAllErrors(this);
  }

  /**
   * Check if form has errors
   */
  public hasErrors(): boolean {
    return this.getAllErrors() !== null;
  }

  /**
   * List the errors in a flat map
   */
  public getAllErrorsFlat() {
    return NaoFormStatic.getAllErrorsFlat(this);
  }

  /**
   * Check if get patch exists
   */
  public exists(path: Array<string | number> | string): boolean {
    return super.get(path) !== null;
  }

  /**
   * Retrieves a child control given the control's name or path from a formGroup typecasted as NaoFormArray
   */
  public getAsNaoFormArray(path: Array<string | number> | string): NaoFormArray | null {
    const getValue = super.get(path);
    if (getValue && (getValue instanceof NaoFormArray)) {
      return getValue as NaoFormArray;
    }
    return null;
  }

  /**
   *  Retrieves a child control given the control's name or path from a formGroup typecasted as as NaoFormControl
   */
  public getAsNaoFormControl(path: Array<string | number> | string): NaoFormControl | null {
    const getValue = super.get(path);
    if (getValue && (getValue instanceof NaoFormControl)) {
      return getValue as NaoFormControl;
    }
    return null;
  }

  /**
   *  Retrieves a child control given the control's name or path from a formGroup typecasted as as NaoFormGroup
   */
  public getAsNaoFormGroup(path: Array<string | number> | string): NaoFormGroup | null {
    const getValue = super.get(path);
    if (getValue && (getValue instanceof NaoFormGroup)) {
      return getValue as NaoFormGroup;
    }
    return null;
  }

  /**
   *  Get data as FromData
   *  @experimental
   */
  public getAsFromData(path: Array<string | number> | string): FormData | null {
    const formData = new FormData();
    const value: any = this.getValue();

    for (const key of Object.keys(value)) {
      formData.append(key, value[key]);
    }

    return formData;
  }

  /**
   * Retrieves a child control from a formGroup and returns only the value, not the entire object
   */
  public getValueFrom<A = any>(path: Array<string | number> | string): A | null {
    const getValue = super.get(path);
    if (getValue) {
      return getValue.value as A;
    }
    return null;
  }

  /**
   * Get file list form data
   */
  public getFormData(path: string): { data: FormData, contentLength: number } | null {
    return path ? this.formData[path] || null : null;
  }

  /**
   * Add form data to an existing FormData instance
   */
  public setFormData(path: string, data: any): void {
    // -->Check: the form data
    if (!(this.formData[path] instanceof FormData)) {
      this.formData[path] = {data: new FormData(), contentLength: 0};
    }

    // -->Set: data
    if (data) {
      Object.keys(data).map(k => {
        // -->Append: data
        this.formData[path].data.append(k, data[k]);
      });
    }
  }

  /**
   * Remove form data
   */
  public removeFormData(path: string): void {
    if (path && this.formData[path]) {
      delete this.formData[path];
    }
  }

  /**
   * Resets the FormGroup, marks all descendants are marked pristine and untouched, and the value of all descendants to null.
   */
  public empty(options: { onlySelf?: boolean; emitEvent?: boolean; } = {}): void {
    return super.reset({}, options);
  }

  /**
   * Clone the current formControl
   */
  public clone(reset = false, formGroupKeys?: string[]): NaoFormGroup {
    const fc = cloneAbstractControl<NaoFormGroup>(this, formGroupKeys, false);
    if (reset) {
      fc.reset({onlySelf: false, emitEvent: false});
    }
    return fc;
  }

  /**
   * Clone the current formGroup and exclude some keys
   */
  public cloneExclude(reset = false, formGroupKeys: string[]): NaoFormGroup {
    const fc = cloneAbstractControl<NaoFormGroup>(this, formGroupKeys, true);
    if (reset) {
      fc.reset({onlySelf: false, emitEvent: false});
    }
    return fc;
  }
}





