import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BackendService } from './backend.service';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from './app-config.service';

import { IMyDpOptions } from 'mydatepicker';

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: [ './dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  @Input() language;
  @Input() formid;

  /*för att ladda upp filer */
  errors: Array<string> =[];
  dragAreaClass: string = 'dragarea';
  @Input() fileExt: string = "JPG, GIF, PNG, PDF";
  @Input() maxFiles: number = 5;
  @Input() maxSize: number = 5; // 5MB
  @Output() uploadStatus = new EventEmitter();

  public files: Set<File> = new Set();
  filelistlength;
  currenturl = window.location.href;

  isprod = environment.production;

  loading = false;
  loaderurl;

  isopenurl = false;
  openurlsuffix = "";
  openurlsource;
  openurljson:any;
  objectOpenurl;
  objectFormfields;
  openurlboxlabel;  

  kthbform: FormGroup;
  formdataresponse;
  formdata: any;
  formisinit = false;
  formtype;
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

  token;

  constructor(
    public backend:BackendService,
    private http: HttpClient,
    private titleService: Title,
    private settings: AppConfigService
  ) {
  }
  
  /**
   * 
   * Hämta rätt formulärdata från JSON beroende på angivet formid i app-root attribute
   */
  async getFormData() {
    const formGroup = {};
    //Implementera token?
    this.token = this.settings.config.headers.get('token');
    //Källa
    if(this.settings.config.body.openurlsourceparameters) {
      for(let source of this.settings.config.body.openurlsourceparameters) {
        if(this.getParam(source)!= ""){
          this.isopenurl = true;
          this.openurlsuffix = "openurl";
          this.openurlsource = this.getParam(source);
          break;
        }
      }
    }
    this.formdataresponse = await this.http.get(
      environment.server + environment.formdataurl + this.formid + this.openurlsuffix + ".json" + '?time=' + Date.now(),
        { observe: 'response' }
      ).toPromise();
    this.formdata = this.formdataresponse.body;
    //this.setTitle(this.formdata.header.swedish);
    this.optionalfieldtext = this.formdata.optionalfieldtext;
    this.openurlboxlabel = this.formdata.openurlboxlabel;
    this.posturl = environment.server + this.formdata.posturl;
    this.loaderurl = environment.server + this.formdata.loaderurl;
    this.formstatus = this.formdata.status;
    this.formdescription = this.formdata.description;
    this.formtype = this.formdata.type;

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

    //OpenURL, matcha fält i formulär mot openurlparametrar
    if(this.isopenurl){
      this.openurljson = this.openurlparametersToJSON();
      //Hantera kapitel i bok/artikel(båda har nämligen atitle som titel)
      //ctitle sätts först(först i listan av formfields)
      if(this.openurljson['ctitle'] != '' && this.openurljson['genre'] == 'article') { 
        this.openurljson['atitle']=this.openurljson['ctitle'];
        this.openurljson['ctitle']='';
      }
      
      for(let prop of this.objectFormfields) {
        if(this.openurljson[prop.key]) {
          this.kthbform.get(prop.key).setValue(decodeURI(this.openurljson[prop.key]));
        }
      }
      
      this.onchangeformobject('','','');
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
    /*openSelectorOnInputClick: true,
    editableDateField: false*/
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
      //Översätt openurlparametrar som eventuellt har andra namn än standard(primo och libris)
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
    window.location.href = url + '?language=' + this.language;
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
   *
   * Vid klick på mainoption-fält så ska övriga optionfält rensas
  */
  onchangeformobject(domobj, object, event){
    var validfield;
    var show;
    var optionvalidchoice;
    var enableoption;
    if(typeof object !== 'undefined' && object!= '') {
      if (this.formdata.formfields[object].mainoption) {
        for(let prop of this.objectFormfields) {
          if (prop.type=='radio' && !prop.mainoption) {
            this.kthbform.get(prop.key).setValue('');
          }
        }
      }
    }
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

  private isValidFileSize(file) {
    var fileSizeinMB = file.size / (1024 * 1000);
    var size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
    if (size > this.maxSize)
        this.errors.push("Error (File Size): " + file.name + ": exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )");
  }

  private isValidFileExtension(files){
    // Make array of file extensions
    var extensions = (this.fileExt.split(','))
                    .map(function (x) { return x.toLocaleUpperCase().trim() });
    for (var i = 0; i < files.length; i++) {
        // Get file extension
        var ext = files[i].name.toUpperCase().split('.').pop() || files[i].name;
        // Check the extension exists
        var exists = extensions.includes(ext);
        if (!exists) {
            this.errors.push("Error (Extension): " + files[i].name);
        }
        // Check file size
        this.isValidFileSize(files[i]);
    }
  }

  private isValidFiles(files){
    // Check Number of files
     if (files.length > this.maxFiles) {
         this.errors.push("Error: At a time you can upload only " + this.maxFiles + " files");
         return;
     }        
     this.isValidFileExtension(files);
     return this.errors.length === 0;
 }
 
  saveFiles(files){
    this.errors = []; // Clear error
    // Validate file size and allowed extensions
    if (files.length > 0 && (!this.isValidFiles(files))) {
        this.uploadStatus.emit(false);
        return;
    }       
    if (files.length > 0) {
          let formData_: FormData = new FormData();
          for (var j = 0; j < files.length; j++) {
              formData_.append("file[]", files[j], files[j].name);
              this.kthbform.get('files').setValue(files[j]);
          }
      } 
  }

  /**
   * 
   * @param event 
   * 
   * Hantera file inputs
   */
  onFileChange(event) {
    const files_: { [key: string]: File } = event.target.files;
    this.filelistlength = 0;
    for (let key in files_) {
      if (!isNaN(parseInt(key))) {
        this.files.add(files_[key]);
      }
    }
    
    this.files.forEach(file => {
      this.filelistlength++;
    });
    //addera filer till lista som visas
    this.kthbform.get('files').setValue(this.files);
    //rensa file input
    this.kthbform.get(event.srcElement.attributes[3].value).setValue('');
  }

  /* Funktion som tar bort vald fil */
  removeFile(file) {
    var index = this.files.delete(file);
    if (this.filelistlength > 0) {
      this.filelistlength--;
    }
  }

  /**
   * 
   * @param kthbform 
   * 
   * Posta till backend
   */
  postformvalues(postform) {
    //Är det ett json-form eller ett upload-form?
    if(this.formtype == 'upload') {
      const formData = new FormData();
      let i=0;
      //lägg till filer som ska skickas med.
      //Validering? (storlek, antal, extension)
        this.files.forEach(file => {
          formData.append('localImage' + i, file, file.name);
          i++;
        });
      //lägg till formulärets fält/värden
      for (let item in this.kthbform.value) {
        if (item !== 'files' && item !== 'file1') {
            formData.append(item, this.kthbform.value[item]);
        }
      }
      postform = formData;
    }
    
    
    this.backend.postForm(this.posturl + "?language=" + this.language, postform).subscribe(
    //this.backend.postForm(this.posturl + "?language=" + this.language, formData).subscribe(
      (result) => {
        //Allt är OK
        if(result.status == 201 || result.status == 200) {
          this.backendresponse = true;
          this.backendresult = true;
          this.loading = false;
          this.formsubmitted = false;
          window.scroll(0,0);
          this.kthbform.reset();
          this.files.forEach(file => {
            this.removeFile(file)
          });
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
        //Inte skickat json
        if(result.status == 203) {
          this.backendresponse = true;
          this.backendresult = false;
          this.backendresulterror = result.body.message;
          this.loading = false;
          this.formsubmitted = false;
          window.scroll(0,0);
        }
      },
      //FEL, api har gett ett felmeddelande(diverse orsaker) 
      (err) => {
        this.backendresponse = true;
        this.backendresult = false;
        this.backendresulterror = err.error.message;
        this.loading = false;
        //console.log(err);
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
