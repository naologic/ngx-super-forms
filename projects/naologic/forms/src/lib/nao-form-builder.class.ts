import {NaoFormControl} from './nao-form-control.class';
import {NaoFormGroup} from './nao-form-group.class';
import {FormBuilder,} from '@angular/forms';
import {NaoFormOptions} from './nao-form-options';
import {NaoFormArray} from './nao-form-array.class';


export class NaoFormBuilder extends FormBuilder {
  constructor() {
    super();
  }
  public group(controlsConfig: { [key: string]: any }, extra?: NaoFormOptions): NaoFormGroup {
    return super.group(controlsConfig, extra) as NaoFormGroup;
  }

  public naoGroup(controlsConfig: { [key: string]: any }, extra?: NaoFormOptions): NaoFormGroup {
    return super.group(controlsConfig, extra) as NaoFormGroup;
  }

  public naoArray(controlsConfig: any[], extra?: NaoFormOptions): NaoFormArray {
    return super.array(controlsConfig, extra ? extra.validators : null, extra ? extra.asyncValidators : null) as NaoFormArray;
  }

  public naoControl(formState: any, extra?: NaoFormOptions): NaoFormControl {
    return super.control(formState, extra ? extra.validators : null, extra ? extra.asyncValidators : null) as NaoFormControl;
  }
}
