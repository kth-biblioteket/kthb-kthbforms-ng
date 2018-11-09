import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'dynamic-form2',
  template: `
  <div id="form_body">
    <form novalidate (ngSubmit)="onSubmit(form.value)" [formGroup]="form">
      <div *ngFor="let prop of objectProps">
        <div *ngIf="prop.enabled">
          <label [attr.for]="prop.key">{{prop.label}}</label>
          <div [ngSwitch]="prop.type">
            <input class="form-control medium" *ngSwitchCase="'text'" 
              [formControlName]="prop.key"
              [id]="prop.key" [type]="prop.type">
            
            <div *ngSwitchCase="'textarea'">
              <textarea class="form-control medium" [formControlName]="prop.key" [id]="prop.key"></textarea>
            </div>

            <div *ngSwitchCase="'checkbox'">
              <label *ngFor="let option of prop.options">
                <input 
                  type="checkbox"
                  [name]="prop.key"
                  [formControlName]="prop.key"
                  [value]="option.value"> {{option.label}}
              </label>
            </div>

            <div *ngSwitchCase="'radio'">
              <label *ngFor="let option of prop.options">
                <input (click)="activateformobject(option.label)" (change)="onchangeformobject(this,prop.key)"
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

            <!--div class="controls" *ngSwitchCase="'submit'">
              <input [attr.disabled]="!form.valid" class="form-control button" *ngSwitchCase="'submit'" 
                [formControlName]="prop.key"
                [id]="prop.key" [type]="prop.type">
            </div-->
          </div>

          <div class="error" *ngIf="form.get(prop.key).invalid && (form.get(prop.key).dirty || form.get(prop.key).touched)">
              <div *ngIf="form.get(prop.key).errors.required">
                {{ prop.label }} {{ prop.validation.required.errormessage }}
              </div>
              <div *ngIf="form.get(prop.key).errors.pattern">
                {{ prop.label }} {{ prop.validation.pattern.errormessage }}
              </div>
          </div>
        </div>          
      </div>
      <div class="controls">
        <input [disabled]="!form.valid" class="form-control button" type="submit" value="Skicka">
      </div>
    </form>
    <div>
    <br/>
    <strong>Form Value</strong>
    <pre>{{ form.value | json }}</pre>
    <strong>Form is valid:</strong> {{form.valid}}
  `,
  styles: [
    `
    input[type=submit] {
      width: unset;
      float: right;
    }
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

  /***************************************************************************************
   * 
   * 
   * Skapa formulär från inläst JSON
   ***************************************************************************************/
  ngOnInit() {
    this.objectProps = 
      Object.keys(this.dataObject)
        .map(prop => {
          return Object.assign({}, { key: prop} , this.dataObject[prop]);
        });
    
    const formGroup = {};
    for(let prop of Object.keys(this.dataObject)) {
      formGroup[prop] = new FormControl(this.dataObject[prop].value || '', this.mapValidators(this.dataObject[prop].validation));
    }

    this.form = new FormGroup(formGroup);
  }


  /***************************************************************************************
   * 
   * @param validators 
   * 
   * Skapa eventuella valideringar utifrån inlästa JSON
   ***************************************************************************************/
  private mapValidators(validators) {
    const formValidators = [];

    if(validators) {
      for(const validation of Object.keys(validators)) {
        if(validation === 'required') {
          formValidators.push(Validators.required);
        } else if(validation === 'min') {
          formValidators.push(Validators.min(validators[validation].value));
        } else if (validation === 'pattern') {
          formValidators.push(Validators.pattern(validators[validation].value));
        }
      }
    }

    return formValidators;
  }

  /***************************************************************************************
   * 
   * @param domobj 
   * 
   * @param object 
   * 
   * Hantera klick på formulärkontroller och aktivera/inaktivera beroende på inläst JSON
   ***************************************************************************************/
  onchangeformobject(domobj, object){
    console.log(this.form);
    console.log("onchangeformobject: "  + this.form.get(object).value);
    //kolla om något annat formulärobjekt är beroende av aktuellt objekts värde
    var show;
    for(let prop of this.objectProps) {
      show = false;
      if (prop.showcriteria==object) {
        for(let index of Object.keys(prop.showvalues)){
          if(this.form.get(object).value == prop.showvalues[index] || (prop.showvalues[index] == "any" && this.form.get(object).value!="")) {
            show = true;
            break;
          }
        }
        if (show){
          this.form.get(prop.key).enable();
          prop.enabled = true;
        } else {
          this.form.get(prop.key).disable();
          prop.enabled = false;
        }
      }
    }
  }

  /***************************************************************************************
   * 
   * @param form 
   * 
   * Hantera beställningen
   ***************************************************************************************/
  onSubmit(form) {
    console.log(form);
  }
}
