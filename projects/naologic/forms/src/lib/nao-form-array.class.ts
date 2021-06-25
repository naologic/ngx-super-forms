import { AbstractControl, FormArray } from '@angular/forms';
import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { callNativeMarkAsFunction, cloneAbstractControl, getValuesByMarkedAs, NaoFormStatic } from './nao-form-static.class';
import { NaoFormGroup } from './nao-form-group.class';
import { NaoFormOptions } from './nao-form-options';
import { NaoAbstractControlOptions} from './nao-form.interface';
import { NaoFormControl } from './nao-form-control.class';
import { isPlainObject, merge, pick } from 'lodash';
import { BehaviorSubject } from 'rxjs';



export class NaoFormArray<T = any> extends FormArray {
  public metadata$ = new BehaviorSubject<any>(null);
  constructor(
    controls: AbstractControl[],
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
  public setMetadata(meta: any, mergeData = false): NaoFormArray {
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
  public clearMetadata(): NaoFormArray {
    this.metadata$.next(null);
    return this;
  }

  /**
   * Check if get patch exists
   */
  public exists(path: Array<string | number> | string): boolean {
    return super.get(path) !== null;
  }

  /**
   * Validate the contents of the array between these 2 indexes, everything else, remove validations
   */
  public validationInterval(startAt = 0, endAt = this.controls.length): void {
    this.controls.map((control, index: number) => {
      if (index < startAt || index > endAt) {
        control.clearValidators();
      }
      return control;
    });
  }

  /**
   * Minimum valid values in an array
   * @experimental
   */
  public minValid(no: number): boolean {
    const errs = this.getAllErrorsFlat();
    return errs ? this.controls.length - Object.keys(errs).length > no : true;
  }

  /**
   * Maximum valid values in an array
   * @experimental
   */
  public maxValid(no: number): boolean {
    const errs = this.getAllErrorsFlat();
    return errs ? this.controls.length - Object.keys(errs).length < no : false;
  }

  /**
   * Merge this form with another form
   */
  public merge(fa: NaoFormArray, options = { startAt: 0 }): void {
    if (fa instanceof NaoFormArray) {
      fa.controls.map((c, i) => {
        this.insert(options.startAt + i, c);
      });
    }
  }

  /**
   * The splice() method changes the contents of an array by removing or replacing existing
   */
  public splice(startAt: number, deleteCount = 0, ...items: AbstractControl[]): void {
    // -->Splice: the controls
    this.controls.splice(startAt, deleteCount, ...items);
  }

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   */
  public filter(fn: (control: AbstractControl, index?: number, array?: AbstractControl[]) => boolean): void {
    // -->Filter: the controls
    this.controls.filter(fn);
  }

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   */
  // public filterValues(fn: (value: T, index?: number, array?: AbstractControl[]) => T[]): void {
  //   // -->Filter: the controls
  //   this.getValue().filter<T>(fn);
  // }

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   */
  public map(fn: (control: AbstractControl, index?: number, array?: AbstractControl[]) => AbstractControl): void {
    // -->Filter: the controls
    this.controls.map(fn);
  }

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   */
  public mapValues(fn: (value: any, index?: number, array?: any[]) => any): void {
    // -->Filter: the controls
    this.getValue().map(fn);
  }

  /**
   * Get the `NaoFormControl` at the given `index` in the array.
   */
  public atAsNaoFormControl(i: number): NaoFormControl {
    return super.at(i) as NaoFormControl;
  }

  /**
   * Get the `NaoFormArray` at the given `index` in the array.
   */
  public atAsNaoFormArray(i: number): NaoFormArray {
    return super.at(i) as NaoFormArray;
  }

  /**
   * Get the `NaoFormGroup` at the given `index` in the array.
   */
  public atAsNaoFormGroup(i: number): NaoFormGroup {
    return super.at(i) as NaoFormGroup;
  }

  /**
   * Get the `AbstractControl` at the given `index` in the array.
   */
  public atAsAbstractControl(i: number): AbstractControl {
    return super.at(i) as AbstractControl;
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
  public getTouchedValues(): Partial<T[]> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'touched');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Return only the values of abstract controls marked as `untouched`
   */
  public getUntouchedValues(): Partial<T[]> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'untouched');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Return only the values of abstract controls marked as `dirty`
   */
  public getDirtyValues(): Partial<T[]> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'dirty');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Return only the values of abstract controls marked as `pristine`
   */
  public getPristineValues(): Partial<T[]> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'pristine');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Return only the values of abstract controls marked as `pending`
   */
  public getPendingValues(): Partial<T[]> {
    // -->Get: only values markAs type
    const values = getValuesByMarkedAs(this, 'pending');

    // -->Check: and return
    return values && values.ok ? values.value : null;
  }

  /**
   * Get value of this shit
   */
  public getValue(): T[] {
    return super.getRawValue() as T[];
  }

  /**
   * Get forma array values by index
   */
  public getValues(...indexes: number[]): Partial<T[]> {
    if (Array.isArray(indexes)) {
      const fa = new NaoFormArray(indexes
        .map(i => super.at(i))
        .filter(e => {
          return !!e;
      }));
      return fa.getValue() as Partial<T[]>;
    }
    return [] as Partial<T[]>;
  }

  /**
   * Trigger the native `markAs` function
   * @param formGroup
   * @param type
   * @param options
   */
  private markAs(formGroup: NaoFormGroup|NaoFormArray, type: 'touched'|'untouched'|'dirty'|'pristine'|'pending', options?: NaoAbstractControlOptions): void {
    if (formGroup && Array.isArray(formGroup.controls)) {
      formGroup.controls.map((control) => {
        if ( control instanceof NaoFormGroup || control instanceof NaoFormArray ) {
          this.markAs( control, type, options );
        } else {
          callNativeMarkAsFunction(control, type, options);
        }
      });
    }
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsTouched on all controls;
   * for NaoFormControl it references the native function markAsTouched
  */
  public markAllAsTouched(opts?: NaoAbstractControlOptions): void {
    this.markAs( this, 'touched', opts );
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsUntouched on all controls
   * for NaoFormControl it references the native function markAsUntouched
  */
  public markAllAsUntouched(opts?: NaoAbstractControlOptions): void {
    this.markAs( this, 'untouched', opts );
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsDirty on all controls
   * for NaoFormControl it references the native function markAsDirty
  */
  public markAllAsDirty(opts?: NaoAbstractControlOptions): void {
    this.markAs( this, 'dirty', opts );
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsPristine on all controls
   * for NaoFormControl it references the native function markAsPristine
  */
  public markAllAsPristine(opts?: NaoAbstractControlOptions): void {
    this.markAs( this, 'pristine', opts );
  }

  /**
   * Iterates through all the children of the NaoFormGroup, NaoFormArray and calls markAsPending on all controls
   * for NaoFormControl it references the native function markAsPending
  */
  public markAllAsPending(opts?: NaoAbstractControlOptions): void {
    this.markAs( this, 'pending', opts );
  }

  /**
   * Get all errors from this form
   */
  public getAllErrors() {
    return NaoFormStatic.getAllErrors(this);
  }

  /**
   * Check if it has errors
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
   * Get last item
   */
  public getLast(): AbstractControl | null {
    return this.length > 0 ? super.at(this.length - 1) : null;
  }

  /**
   * Get first item
   */
  public getFirst(): AbstractControl | null {
    return super.at(0) || null;
  }

  /**
   * Resets the FormArray and all descendants are marked pristine and untouched, and the value of all descendants to null or null maps.
   */
  public empty(options: { onlySelf?: boolean; emitEvent?: boolean; } = {}): void {
    this.controls = [];
    return super.reset( [], options );
  }

  /**
   * Remove all the empty values: null, undefined, ''
   */
  public removeEmpty(): void {
    this.removeEmptyFromNaoFormArray(this);
  }

  /**
   * Remove empty or null values from NaoFormArray
   * @param array
   */
  public removeEmptyFromNaoFormArray(array: NaoFormArray) {
    const arrIndex: number[] = [];

    Object.keys(array.controls).map((key: string, index: number) => {
      // -->Get: Abstract control
      const abstractControl = array.get(key);

      if (abstractControl instanceof NaoFormGroup) {
        // -->Iterate: over NaoFormGroup
        abstractControl.removeEmpty();
        // -->Check: if the NaoFormGroup is empty and remove it
        if (!Object.keys(abstractControl.controls).length) {
          array.removeAt(index);
        }
      } else if (abstractControl instanceof NaoFormArray) {
        // -->Iterate: over NaoFormArray
        this.removeEmptyFromNaoFormArray(abstractControl);
        // -->Check: if the NaoFormArray is empty and remove it
        if (!Object.keys(abstractControl.controls).length) {
          array.removeAt(index);
        }
      } else if (abstractControl instanceof NaoFormControl) {
        // -->Remove: control if it's empty or null
        if (abstractControl.value === '' || abstractControl.value === null) {
          arrIndex.push(index);
        }
      }
    });

    // -->Remove: all empty values
    if (arrIndex.length) {
      for (const index of arrIndex.reverse()) {
        array.removeAt(index);
      }
    }
  }

  /**
   * Clone the current formControl
   */
  public clone(reset = false): NaoFormArray {
    const fc = cloneAbstractControl<NaoFormArray>(this);
    if (reset) {
      fc.reset({ onlySelf: false, emitEvent: false });
    }
    return fc;
  }
}
