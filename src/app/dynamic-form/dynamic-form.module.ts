import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormComponent } from './containers/dynamic-form/dynamic-form.component';

import { FormButtonComponent } from './containers/components/form-button/form-button.component';
import { FormInputComponent } from './containers/components/form-input/form-input.component';
import { FormSelectComponent } from './containers/components/form-select/form-select.component';
import { DynamicFieldDirective } from './containers/components/dynamic-field/dynamic-field.directive';




@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  declarations: [
    DynamicFieldDirective,
      DynamicFormComponent,
      FormButtonComponent,
      FormInputComponent,
      FormSelectComponent,
    ],
  exports: [DynamicFormComponent],
  entryComponents: [
    FormButtonComponent,
    FormInputComponent,
    FormSelectComponent,
  ],
})
export class DynamicFormModule {}