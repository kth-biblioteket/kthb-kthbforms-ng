import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BackendService } from './backend.service';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

//TODO Flytta style från inline template till css
@Component({
  selector: 'dynamic-form',
  template: `
  <div *ngIf="init">
    <div style="margin-top:15px;margin-bottom:15px">{{language=='swedish' ? description.swedish : description.english}}</div>
    <div class="webform message">
      <div *ngIf="showtoperrormessage" id="formd_error_message" class="alert alert-danger"><p>Formuläret är inte korrekt ifyllt! Se rödmarkerad text nedan.</p>
      </div>
    </div>
    <div id="form_body">
      <form novalidate (ngSubmit)="onSubmit(form.value)" [formGroup]="form">
        <div style="margin-bottom:15px" *ngFor="let prop of objectProps">
          <div *ngIf="prop.enabled">
            <label [ngStyle]="prop.isgrouped ? {'margin-top':'0px','font-weight': 'normal'} : {'margin-top':'0px'}" [attr.for]="prop.key">
              {{language=='swedish' ? prop.label.swedish : prop.label.english}}
              <span style="font-style:italic;font-weight:normal">
                {{!prop.validation.required.value && language=='swedish' ? '(' + optionalfieldtext.swedish + ')': ''}}{{!prop.validation.required.value && language=='english' ? '(' + optionalfieldtext.english + ')' : ''}}
              </span>
            </label>
            <div class="error" *ngIf="form.get(prop.key).invalid && (form.get(prop.key).dirty || form.get(prop.key).touched)">
              <div *ngIf="form.get(prop.key).errors.required">
                {{language=='swedish' ? prop.label.swedish : prop.label.english}} {{ language=='swedish' ? prop.validation.required.errormessage.swedish : prop.validation.required.errormessage.english }}
              </div>
              <div *ngIf="form.get(prop.key).errors.pattern">
                {{language=='swedish' ? prop.label.swedish : prop.label.english}} {{ language=='swedish' ? prop.validation.pattern.errormessage.swedish : prop.validation.pattern.errormessage.english }}
              </div>
            </div>
            <div *ngIf="prop.description">{{language=='swedish' ? prop.description.swedish : prop.description.english}}</div>
            <div style="margin-bottom:10px" *ngIf="prop.link"><a target="_new" href="{{language=='swedish' ? prop.link.swedish.url : prop.link.english.url}}">{{language=='swedish' ? prop.link.swedish.text : prop.link.english.text}}</a></div>
            <div [ngSwitch]="prop.type">
              <input style="margin-top:0px;" class="form-control medium" *ngSwitchCase="'text'" 
                [formControlName]="prop.key"
                [id]="prop.key" [type]="prop.type">
              
              <div *ngSwitchCase="'textarea'">
                <textarea class="form-control medium" [formControlName]="prop.key" [id]="prop.key"></textarea>
              </div>

              <div *ngSwitchCase="'checkbox'">
                <label style="margin-top:0px;font-weight: normal;" *ngFor="let option of prop.options">
                  <input 
                    type="checkbox"
                    [name]="prop.key"
                    [formControlName]="prop.key"
                    [value]="option.value"> {{language=='swedish' ? option.label.swedish : option.label.english}}
                </label>
              </div>

              <div *ngSwitchCase="'radio'">
                <div *ngFor="let option of prop.options">
                  <label style="margin-top:0px;font-weight: normal;" *ngIf="option.enabled">
                  <input (change)="onchangeformobject(this,prop.key)"
                    type="radio"
                    [name]="prop.key"
                    [formControlName]="prop.key"
                    [value]="option.value"> {{language=='swedish' ? option.label.swedish : option.label.english}}
                  </label>
                </div>
              </div>

              <div *ngSwitchCase="'select'">
                <select [formControlName]="prop.key">
                  <option *ngFor="let option of prop.options" [value]="option.value">
                    {{ language=='swedish' ? option.label.swedish : option.label.english}}
                  </option>
                </select>
              </div>

              <!--div class="controls" *ngSwitchCase="'submit'">
                <input [attr.disabled]="!form.valid" class="form-control button" *ngSwitchCase="'submit'" 
                  [formControlName]="prop.key"
                  [id]="prop.key" [type]="prop.type">
              </div-->
            </div>
          </div>          
        </div>
        <div class="controls">
          <input [disabled]="!form.valid" class="form-control button" type="submit" value="Skicka">
        </div>
      </form>
      <div>
      <br/>
      <strong>Formulärvärden</strong>
      <pre>{{ form.value | json }}</pre>
      <strong>Formulär är giltigt:</strong> {{form.valid}}
    <div>
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
export class DynamicFormComponent implements OnInit {
  // inputvariabler som skickas med från App
  //@Input() dataObject; //formulärfält
  @Input() language; //språk
  @Input() formid; //formid 

  form: FormGroup;
  objectProps;
  init = false;
  optionalfieldtext;
  description;
  isValidFormSubmitted = null;
  showtoperrormessage = false;
  posturl;

  constructor(
    public backend:BackendService,
    private http: HttpClient,
    private titleService: Title
  ) {
  }

  /***************************************************************************************
   * 
   * 
   * Skapa formulär från inläst JSON
   * 
   ***************************************************************************************/

  //hämta rätt formulärdata beroende på angivet formid i app-root attribute
  async getFormData() {
    let formdata:any;
    formdata = await this.http.get(environment.formdataurl + this.formid + ".json").toPromise();
    this.setTitle(formdata.header.swedish);
    this.optionalfieldtext = formdata.optionalfieldtext;
    this.posturl = formdata.posturl;
    this.description = formdata.description;
    this.objectProps = 
      Object.keys(formdata.formfields)
        .map(prop => {
          return Object.assign({}, { key: prop} , formdata.formfields[prop]);
        });
        
      const formGroup = {};
      for(let prop of Object.keys(formdata.formfields)) {
        formGroup[prop] = new FormControl(formdata.formfields[prop].value || '', this.mapValidators(formdata.formfields[prop].validation));
      }
 
      this.form = new FormGroup(formGroup);
      this.init = true;
  }

  ngOnInit() {
    this.getFormData(); 
  }

  setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
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
          if (validators[validation].value) {
            formValidators.push(Validators.required);
          }
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
    if (!this.form.get(object).valid) {
      this.showtoperrormessage = true;
    } else {
      this.showtoperrormessage = false;
    }
    //kolla igenom alla fält(som hämtats via JSON) och sätt enable = true/false beroende på aktuella värden
    var validfield;
    var show;
    var optionvalidchoice;
    var enableoption;
    for(let prop of this.objectProps) {
      show = false;
      //om fältet har kriterier för att visas
      if (prop.showcriteria) {
        //hämta kriterier
        
        for(let index1 of Object.keys(prop.showcriteria)){
          //för varje, kolla om kriterie är uppfyllt
          //console.log(prop.showcriteria[index1].field);
          //console.log(this.form.get(prop.showcriteria[index1].field).value);
          validfield = false;
          for(let index2 of Object.keys(prop.showcriteria[index1].values)){
            if (this.form.get(prop.showcriteria[index1].field).value == prop.showcriteria[index1].values[index2] || prop.showcriteria[index1].values[index2] == "any") {
              validfield = true;
              break;
            } else {
              validfield = false;
            }
          }

          if (validfield){
            show = true;
            //om en radio/checkbox-kontroll, kolla också kriterier för varje option
            if(prop.type=="radio") {
              //om options finns
              if(prop.options) {
                for (let index3 of Object.keys(prop.options) ){
                  optionvalidchoice = false                  
                  if (prop.options[index3].showcriteria) {
                    for(let index4 of Object.keys(prop.options[index3].showcriteria)){
                      enableoption = false;
                      for(let index5 of Object.keys(prop.options[index3].showcriteria[index4].values)){
                        if (this.form.get(prop.options[index3].showcriteria[index4].field).value == prop.options[index3].showcriteria[index4].values[index5] || prop.options[index3].showcriteria[index4].values[index5] == "any") {
                          optionvalidchoice = true;
                          break;                       
                        } else {
                          optionvalidchoice = false;
                        }
                      }
                      if (optionvalidchoice){
                        enableoption = true;
                      } else {
                        enableoption = false;
                        break;
                      }
                    }
                    if (enableoption){
                      prop.options[index3].enabled = true;
                    } else {
                      prop.options[index3].enabled = false;
                    }
                  }
                }
              }
            }
          } else {
            show = false;
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

  postformvalues(form) {
    this.backend.postForm(this.posturl, form, this.formid).subscribe((result) => {
     console.log(result);
    }, (err) => {
      console.log(err);
    });
  }

  /***************************************************************************************
   * 
   * @param form 
   * 
   * Hantera beställningen
   * 
   * Skicka via http post
   ***************************************************************************************/
  onSubmit(form) {
    this.isValidFormSubmitted = false;
     if (this.form.invalid) {
        return;
     }
     this.isValidFormSubmitted = true;

     if(this.form.valid) {
      this.postformvalues(form);
  }
  }
}
