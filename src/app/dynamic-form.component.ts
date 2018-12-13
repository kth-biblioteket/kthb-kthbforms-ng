import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BackendService } from './backend.service';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

import {IMyDpOptions} from 'mydatepicker';

//TODO Flytta style från inline i template till css
@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: [ './dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  @Input() language;
  @Input() formid;

  isprod = environment.production;

  loading = false;
  loaderurl;

  isopenurl = false;
  openurlsource;
  openurljson:any;
  objectOpenurl;
  objectFormfields;
  openurlboxlabel;  

  kthbform: FormGroup;
  formdata: any;
  formisinit = false;
  formstatus;
  formdescription;
  formsubmitted = false;
  optionalfieldtext;
  
  posturl;
  warning = false;
  showtoperrormessage = false;
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
    const formGroup = {};

    this.formdata = await this.http.get(environment.formdataurl + this.formid + ".json" + '?time=' + Date.now()).toPromise();

    this.setTitle(this.formdata.header.swedish);
    this.optionalfieldtext = this.formdata.optionalfieldtext;
    this.openurlboxlabel = this.formdata.openurlboxlabel;
    this.posturl = this.formdata.posturl;
    this.loaderurl = this.formdata.loaderurl;
    this.formstatus = this.formdata.status;
    this.formdescription = this.formdata.description;

    //Skapa ett object som t ex formulärtemplate kan iterera.
    this.objectFormfields = 
      Object.keys(this.formdata.formfields)
        .map(prop => {
          return Object.assign({}, { key: prop} , this.formdata.formfields[prop]);
        });

    //Validering
    for(let prop of Object.keys(this.formdata.formfields)) {
      formGroup[prop] = new FormControl(this.formdata.formfields[prop].value || '', this.mapValidators(this.formdata.formfields[prop].validation));
    }

    this.kthbform = new FormGroup(formGroup);
    this.formisinit = true;

    //Källa
    if(this.formdata.openurlsourceparameters) {
      for(let source of this.formdata.openurlsourceparameters) {
        if(this.getParam(source)!= ""){
          this.isopenurl = true;
          this.openurlsource = this.getParam(source);
          break;
        }
      }
    }

    //OpenURL, matcha fält i formulär mot openurlparametrar
    if(this.isopenurl){
      this.openurljson = this.openurlparametersToJSON();
      for(let prop of this.objectFormfields) {
        if(this.openurljson[prop.key]) {
          this.kthbform.get(prop.key).setValue(decodeURI(this.openurljson[prop.key]));
        }
      }
    }
  }

  ngOnInit() {
    this.getFormData();
  }

  /**
   * 
   * Funktion som konfigurerar datepicker
   * 
   * locale="sv" sätts på directive i html-component
   */
  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    alignSelectorRight: true
  };

  /**
   * 
   * @param name 
   * 
   * Funktion för att hämta eventuella urlparametrar
   */
  getParam(name){
    const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if(!results){
      return "";
    }
    return decodeURIComponent(results[1]) || "";
  }

  /**
   * 
   * Funktion för att skapa JSON av operurlparametrar
   */
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
    if (!this.kthbform.get(object).value){
      this.kthbform.get(object).setValue("");
    }
  }

  /**
   * 
   * @param url 
   * 
   * Funktion för att skicka vidare till extern URL
   */
  changelocation (url) {
    window.location.href = url;
  }

  /**
   * 
   * @param domobj 
   * 
   * @param object 
   * 
   * Hantera klick på formulärfält och aktivera/inaktivera beroende på inläst JSON
   * 
   * Fälten har "showcritera" som talar om ifall de ska visas eller inte beroende
   * på värden i andra fält
   * 
   *  "showcriteria": [
        {
          "field": "iam",
          "values": ["student"]
        },
        {
          "field": "genre",
          "values": ["article"]
        }
      ],
   * 
   * Är det ett fält med options(exvis "radio") så kontrollera även
   * varje option
   * 
   * "showcriteria": [{
            "field": "iam",
            "values": ["student","employee"]
          }]
   */
  onchangeformobject(domobj, object, event){
    var validfield;
    var show;
    var optionvalidchoice;
    var enableoption;
    for(let prop of this.objectFormfields) {
      show = false;
      if (prop.showcriteria) {
        for(let index1 of Object.keys(prop.showcriteria)){
          validfield = false;
          for(let index2 of Object.keys(prop.showcriteria[index1].values)){
            if (this.kthbform.get(prop.showcriteria[index1].field).value == prop.showcriteria[index1].values[index2] || prop.showcriteria[index1].values[index2] == "any") {
              validfield = true;
              break;
            } else {
              validfield = false;
            }
          }
          if (validfield){
            show = true;
            if(prop.type=="radio") {
              if(prop.options) {
                for (let index3 of Object.keys(prop.options) ){
                  optionvalidchoice = false                  
                  if (prop.options[index3].showcriteria) {
                    for(let index4 of Object.keys(prop.options[index3].showcriteria)){
                      enableoption = false;
                      for(let index5 of Object.keys(prop.options[index3].showcriteria[index4].values)){
                        if (this.kthbform.get(prop.options[index3].showcriteria[index4].field).value == prop.options[index3].showcriteria[index4].values[index5] || prop.options[index3].showcriteria[index4].values[index5] == "any") {
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

        /**
         *
         * Aktivera/Inaktivera och/eller visa/dölj fälten 
         * 
         * Visa inte de fält som kommer via openurl
         * 
         * Se till att de som är openurl är aktiva och 
         * att de inte behöver valideras
         */
        if (show) {
          this.kthbform.get(prop.key).enable();
          prop.enabled = true;
        } else {
          this.kthbform.get(prop.key).disable();
          prop.enabled = false;
        }

        if(this.isopenurl && !prop.openurlenabled) {
          //this.kthbform.get(prop.key).disable();
          prop.enabled = false;
        }
        
        if(this.isopenurl && prop.openurl) {
          this.kthbform.get(prop.key).enable();
          this.kthbform.get(prop.key).clearValidators();
        }
      }
    }
  }

  /**
   * 
   * @param kthbform 
   * 
   * Posta till backend
   */
  postformvalues(kthbform) {
    this.backend.postForm(this.posturl + "?language=" + this.language, kthbform).subscribe(
      (result) => {
        //Allt är OK
        if(result.status == 201 || result.status == 200) {
          this.backendresponse = true;
          this.backendresult = true;
          this.loading = false;
          this.formsubmitted = false;
          window.scroll(0,0);
          this.kthbform.reset();
          this.getFormData();
        }
        //Delvis OK (exvis användare skapad men mail misslyckades)
        if(result.status == 202) {
          this.backendresponse = true;
          this.backendresult = true;
          this.warning = true;
          this.backendresulterror = result.body.message;
          this.loading = false;
          this.formsubmitted = false;
          window.scroll(0,0);
          this.kthbform.reset();
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
   * @param kthbform 
   * 
   * Skicka formulärdata till backend
   * 
   * Skicka via http post
   */
  onSubmit(kthbform) {
    this.backendresponse = false;
    this.warning = false;
    this.formsubmitted = true;
    if (this.kthbform.invalid) {
      this.showtoperrormessage = true;
      window.scroll(0,0);
      return;
    }
    if(this.kthbform.valid) {
      this.loading = true;
      this.showtoperrormessage = false;
      var postform = {
        "form" : {}
      };
      postform.form = kthbform;
      this.postformvalues(postform);
    }
  }
}
