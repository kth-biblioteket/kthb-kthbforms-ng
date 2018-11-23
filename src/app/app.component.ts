import { Component, ElementRef, OnInit } from '@angular/core';

import { AppConfigService } from './app-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  language = "";
  formid = "";

  constructor(
    private settings: AppConfigService,
    private elementRef: ElementRef
  ) {
  }

  ngOnInit(){
    console.log("KTHB-form-app");
    this.elementRef.nativeElement.getAttribute('language') == 'swedish' ? this.language = 'swedish' : this.language = 'english';
    this.formid = this.elementRef.nativeElement.getAttribute('formid');
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

}
