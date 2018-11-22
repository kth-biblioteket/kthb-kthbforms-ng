import { Component, ElementRef } from '@angular/core';

import { Title } from '@angular/platform-browser';

import { AppConfigService } from './app-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  formfields;
  header;
  description;
  language = "";
  formid = "";
  form;

  constructor(
    private titleService: Title,
    private settings: AppConfigService,
    private elementRef: ElementRef
  ) { 
    console.log("KTHB-form-app");
    this.printParams();
    this.language = this.getParam('lang');
    this.elementRef.nativeElement.getAttribute('language') == 'swedish' ? this.language = 'swedish' : this.language = 'english';
    this.formid = this.elementRef.nativeElement.getAttribute('formid');

    //hämta rätt formulärdata beroende på angivet formid i app-root attribute
    this.form = this.getFormdata (this.formid)

    this.setTitle(this.form.name);
    this.formfields = this.form.formfields;
    this.header =  this.form.header;
    this.description = this.form.description;
  }
  
  getFormdata (formid) {
    var formArray = this.settings.config.forms;
    for (var i = 0; i < formArray.length; i++) {
        if (formArray[i].id == formid) {
          return formArray[i];
        }
    }
  }
  setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  getParam(name){
    const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if(!results){
      return "english";
    }
    return results[1] || "english";
  }

  printParams() {
  }

}
