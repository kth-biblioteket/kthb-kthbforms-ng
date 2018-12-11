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
  @Input() language; //språk
  @Input() formid; //formid 

  // Prod/dev?
  isprod = environment.production;
  // datepicker
  dpmodel;

  // laddar-ikkonen
  loading = false;
  loaderurl;
  
  form: FormGroup;
  formdata:any;
  isopenurl = false;
  openurlsource;
  openurljson:any;
  objectOpenurl;
  objectFormfields;
  //openurlparameters;
  //Variabel för att hålla reda på om formuläret initierats och är redo att visas i template
  init = false;
  openurlboxlabel;
  optionalfieldtext;
  status;
  description;
  submitted = false;
  isValidFormSubmitted = null;
  showtoperrormessage = false;
  posturl;
  warning = false;
  backendresponse = false;
  backendresult = false;
  backendresulterror;

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
    this.formdata = await this.http.get(environment.formdataurl + this.formid + ".json" + '?time=' + Date.now()).toPromise();
    this.setTitle(this.formdata.header.swedish);
    this.optionalfieldtext = this.formdata.optionalfieldtext;
    this.openurlboxlabel = this.formdata.openurlboxlabel;
    this.posturl = this.formdata.posturl;
    this.loaderurl = this.formdata.loaderurl;
    this.status = this.formdata.status;
    this.description = this.formdata.description;
    //skapa ett object som t ex formulärtemplate kan iterera.
    this.objectFormfields = 
      Object.keys(this.formdata.formfields)
        .map(prop => {
          return Object.assign({}, { key: prop} , this.formdata.formfields[prop]);
        });
    const formGroup = {};
    for(let prop of Object.keys(this.formdata.formfields)) {
      formGroup[prop] = new FormControl(this.formdata.formfields[prop].value || '', this.mapValidators(this.formdata.formfields[prop].validation));
    }
    this.form = new FormGroup(formGroup);
    this.init = true;
    //Kolla vilka sourceparametrar som finns angivna i "openurlsourceparameters" 
    //om någon av dessa finns i url så får det anses vara en openurlrequest
    if(this.formdata.openurlsourceparameters) {
      for(let source of this.formdata.openurlsourceparameters) {
        if(this.getParam(source)!= ""){
          this.isopenurl = true;
          this.openurlsource = this.getParam(source);
          //sätt värde på source till form-fält
          //this.form.get('source').setValue(this.openurlsource);
          break;
        }
      }
    }

    if(this.isopenurl){
      //Gör parametrar till payload
      this.openurljson = this.openurlparametersToJSON();
      //om openurlparameter matchar fält i formulär sätt fältets värde = värdet i parameter
      for(let prop of this.objectFormfields) {
        if(this.openurljson[prop.key]) {
          this.form.get(prop.key).setValue(decodeURI(this.openurljson[prop.key]));
        }
      }
    }
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

  openurlparametersToJSON() {	    		
    var pairs = location.search.slice(1).split('&');
    var result = {};
    var openurlsource = this.openurlsource;
    var formfields = this.objectFormfields;
    pairs.forEach(function(pair:any) {
      pair = pair.split('=');
      //Översätt openurlparametrar som eventuellt har andra namn än standard
      for(let field of formfields) {
        if(typeof field.openurlnames !== "undefined") {
          if(field.openurlnames[openurlsource]==[pair[0]]){
            pair[0] = field.openurlnames['standard'];
            break;
          }
        }
      }
      result[pair[0]] = decodeURIComponent(pair[1] || '').replace(/\+/g, ' ');
    });
    
    return result;
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
    //kolla igenom alla fält och sätt enable = true/false beroende på aktuella värden
    var validfield;
    var show;
    var optionvalidchoice;
    var enableoption;
    for(let prop of this.objectFormfields) {
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
            //om ett radio-fält, kolla också kriterier för varje option
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
        if (show) {
          //gör fältet aktivt
          this.form.get(prop.key).enable();
          //visar fältet
          prop.enabled = true;
        } else {
          // gör fältet inaktivt
          this.form.get(prop.key).disable();
          // döljer fältet
          prop.enabled = false;
        }
        //hantera om formuläret är openurl
          //visa inte de fält som kommer via openurl
          
        if(this.isopenurl && !prop.openurlenabled) {
          //gör fältet inaktivt
          //this.form.get(prop.key).disable();
          //gör fältet dolt
          prop.enabled = false;
        }
        //Se till att de som är openurl är aktiva och inte behöver valideras
        if(this.isopenurl && prop.openurl) {
          this.form.get(prop.key).enable();
          this.form.get(prop.key).clearValidators();
        }
      }
    }
  }

  /**
   * 
   * @param form 
   * 
   * Posta till backend
   */
  postformvalues(form) {
    this.backend.postForm(this.posturl + "?language=" + this.language, form).subscribe(
      (result) => {
        //Allt är OK
        if(result.status == 201 || result.status == 200) {
          this.backendresponse = true;
          this.backendresult = true;
          this.loading = false;
          this.submitted = false;
          window.scroll(0,0);
          this.form.reset();
          this.getFormData();
        }
        //Delvis OK (exvis användare skapad men mail misslyckades)
        if(result.status == 202) {
          this.backendresponse = true;
          this.backendresult = true;
          this.warning = true;
          this.backendresulterror = result.body.message;
          this.loading = false;
          this.submitted = false;
          window.scroll(0,0);
          this.form.reset();
          this.getFormData();
        }
      },
      //FEL, api har gett ett felmeddelande(diverse orsaker) 
      (err) => {
        this.backendresponse = true;
        this.backendresult = false;
        this.backendresulterror = err.error.message;
        this.loading = false;
        if(err.status == 422) {
          this.backendresponse = true;
          this.backendresult = false;
          this.backendresulterror = JSON.stringify(err.error);
        } else {
          this.backendresponse = true;
          this.backendresult = false;
          this.backendresulterror = err.error.message;
        }
        window.scroll(0,0);
      }
    );
  }

  /**
   * 
   * @param form 
   * 
   * Skicka formulärdata till backend
   * 
   * Skicka via http post
   */
  onSubmit(form) {
    this.backendresponse = false;
    this.warning = false;
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.form.invalid) {
      this.showtoperrormessage = true;
      window.scroll(0,0);
      return;
    }
    this.isValidFormSubmitted = true;
    if(this.form.valid) {
      this.loading = true;
      this.showtoperrormessage = false;
      /*
      // skapa ett sammanslaget objekt av form och openurljson
      var newjson = {
        "form" : {},
        "openurl": {}
      };
      newjson.form=form;
      newjson.openurl = this.openurljson;
      */
      var postform = {
        "form" : {}
      };
      postform.form = form;
      this.postformvalues(postform);
    }
  }
}
