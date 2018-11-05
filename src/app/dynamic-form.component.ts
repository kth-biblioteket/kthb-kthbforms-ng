import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'dynamic-form2',
  template: `
    <form novalidate (ngSubmit)="onSubmit(form.value)" [formGroup]="form">
      <div *ngFor="let prop of objectProps">
        <label [attr.for]="prop">{{prop.label}}</label>

        <div [ngSwitch]="prop.type">
          <input class="form-control medium" *ngSwitchCase="'text'" 
            [formControlName]="prop.key"
            [id]="prop.key" [type]="prop.type">
          
          <div *ngSwitchCase="'radio'">
            <label *ngFor="let option of prop.options">
              <input
                type="radio"
                [name]="prop.key"
                [formControlName]="prop.key"
                [value]="option.value"> {{option.label}}
            </label>
          </div>

          <div *ngSwitchCase="'select'">
            <select [formControlName]="prop.key">
              <option *ngFor="let option of prop.options" [value]="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="error" *ngIf="form.get(prop.key).invalid && (form.get(prop.key).dirty || form.get(prop.key).touched)">
            <div *ngIf="form.get(prop.key).errors.required">
              {{ prop.label }} is required.
            </div>
          </div>
      </div>
      <p>
        <button type="submit">Save</button>
      </p>
    </form>
    <hr />
    <strong>Form Value</strong>
    <pre>{{ form.value | json }}</pre>
    <strong>Form is valid:</strong> {{form.valid}}
  `,
  styles: [
    `
    .error { color: red; }
    `
  ]
})
export class DynamicFormComponent2 implements OnInit {
  @Input() dataObject;
  form: FormGroup;
  objectProps;

  constructor() {
  }

  ngOnInit() {
    // remap the API to be suitable for iterating over it
    this.objectProps = 
      Object.keys(this.dataObject)
        .map(prop => {
          return Object.assign({}, { key: prop} , this.dataObject[prop]);
        });

    // setup the form
    const formGroup = {};
    for(let prop of Object.keys(this.dataObject)) {
      formGroup[prop] = new FormControl(this.dataObject[prop].value || '', this.mapValidators(this.dataObject[prop].validation));
    }

    this.form = new FormGroup(formGroup);
  }

  private mapValidators(validators) {
    const formValidators = [];

    if(validators) {
      for(const validation of Object.keys(validators)) {
        if(validation === 'required') {
          formValidators.push(Validators.required);
        } else if(validation === 'min') {
          formValidators.push(Validators.min(validators[validation]));
        }
      }
    }

    return formValidators;
  }

  onSubmit(form) {
    console.log(form);
  }
}
