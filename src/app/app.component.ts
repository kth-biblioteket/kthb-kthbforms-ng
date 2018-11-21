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
  header =  this.settings.config.form.header;
  description =  this.settings.config.form.description;
  language = "";

  constructor(
    private titleService: Title,
    private settings: AppConfigService,
    private elementRef: ElementRef
  ) { 
    console.log("KTHB-form-app");
    this.PrintParams();
    this.setTitle(this.settings.config.apptitle);
    this.formfields = this.settings.config.formfields;
    this.language = this.GetParam('lang');
    this.elementRef.nativeElement.getAttribute('language') == 'swedish' ? this.language = 'swedish' : this.language = 'english';
  }
  
  setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  GetParam(name){
    const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if(!results){
      return "english";
    }
    return results[1] || "english";
  }

  PrintParams() {
  }

}
