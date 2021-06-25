import {NgModule} from '@angular/core';
import {NaoForm} from './nao-form.class';

@NgModule({
  imports: [
  ],
  declarations: [NaoForm],
  providers: [],
  exports: []
})
export class NaoFormsModule {
  static forRoot(options?: any) {
    return {
      ngModule: NaoFormsModule
    };
  }
  static forChild() {
    return {
      ngModule: NaoFormsModule
    };
  }
}
