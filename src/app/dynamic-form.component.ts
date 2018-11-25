import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BackendService } from './backend.service';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

//TODO Flytta style från inline i template till css
@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: [ './dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  // inputvariabler som skickas med från App
  //@Input() dataObject; //formulärfält
  @Input() language; //språk
  @Input() formid; //formid 

  form: FormGroup;
  objectProps;
  //Variabel för att hålla reda på om formuläret initierats och är redo att visas i template
  init = false;
  optionalfieldtext;
  status;
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
  
  /**
   * 
   * Hämta rätt formulärdata från JSON beroende på angivet formid i app-root attribute
   */
  async getFormData() {
    let formdata:any;
    formdata = await this.http.get(environment.formdataurl + this.formid + ".json" + '?time=' + Date.now()).toPromise();
    this.setTitle(formdata.header.swedish);
    this.optionalfieldtext = formdata.optionalfieldtext;
    this.posturl = formdata.posturl;
    this.status = formdata.status;
    this.description = formdata.description;
    //skapa ett object som t ex formulärtemplate kan iterera.
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
    //Hämta eventuella url-parametrar
    //Exempelvis om någon klickat på länk i Primo, Libris...
    if(this.getParam("source")!= ""){
      console.log("Formulär som skapats via klick från Primo etc...");
      //Fyll i fält från parametrar (exvis genre(materialtype))
      for(let prop of this.objectProps) {
        if(this.getParam("genre")!= "") {
          if(prop.key=="materialtype") {
            this.form.get("materialtype").setValue(this.getParam("genre")); 
            //sätt fältet till prefilled
            prop.prefilled = true;
          }
        }
        if(this.getParam("article")!= "") {
          if(prop.key=="title") {
            this.form.get("title").setValue(decodeURI(this.getParam("title"))); 
            //sätt fältet till prefilled
            prop.prefilled = true;
          }
        }
        if(this.getParam("title")!= "") {
          if(prop.key=="title") {
            this.form.get("title").setValue(decodeURI(this.getParam("title"))); 
            //sätt fältet till prefilled
            prop.prefilled = true;
          }
        }
      }
    };

  }

  ngOnInit() {
    this.getFormData();
  }

  /**
   * 
   * @param name 
   * 
   * hämta eventuella urlparametrar
   */
  getParam(name){
    const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if(!results){
      return "";
    }
    return results[1] || "";
  }

  /**
   * 
   * @param newTitle 
   * 
   * Sätt title för sidan
   */
  setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  /**
   * 
   * @param validators 
   * 
   * Skapa eventuella valideringar från JSON
   */
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

  /**
   * 
   * @param object 
   * 
   * Se till att en checkbox inte har något värde alls när den inte är checked
   * annars valideras den som giltig.
   */
  checkboxchange(object) {
    console.log(this.form.get(object).value);
    if (!this.form.get(object).value){
      this.form.get(object).setValue("");
    }
  }

  /**
   * 
   * @param domobj 
   * 
   * @param object 
   * 
   * Hantera klick på formulärfält och aktivera/inaktivera beroende på inläst JSON
   */
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
            //om ett radio/checkbox-fält, kolla också kriterier för varje option
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
          //gör fältet klickbart
          this.form.get(prop.key).enable();
          //visar fältet
          prop.enabled = true;
        } else {
          // gör fältet låst
          this.form.get(prop.key).disable();
          // döljer fältet
          prop.enabled = false;
        }
        if(prop.prefilled) {
          //gör fältet låst
          this.form.get(prop.key).disable();
        }
      }
    }
  }

  postformvalues(form) {
    this.backend.postForm(this.posturl, form).subscribe((result) => {
     console.log(result);
    }, (err) => {
      console.log(err);
    });
  }

  /**
   * 
   * @param form 
   * 
   * Hantera beställningen
   * 
   * Skicka via http post
   */
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
