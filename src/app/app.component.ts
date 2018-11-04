import { Component } from '@angular/core';

import { Title }     from '@angular/platform-browser';

import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

import { Validators } from '@angular/forms';

import { AppConfigService } from './app-config.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  config = [
    {
      type: 'input',
      label: 'Full name',
      name: 'name',
      placeholder: 'Enter your name',
    },
    {
      type: 'select',
      label: 'Favourite food',
      name: 'food',
      options: ['Pizza', 'Hot Dogs', 'Knakworstje', 'Coffee'],
      placeholder: 'Select an option',
    },
    {
      label: 'Skicka',
      name: 'submit',
      type: 'button',
    },
  ];

  profileForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    ])],
    address: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      zip: ['']
    }),
  });

  formheader =  this.settings.config.formheader;

  

  constructor(
    private titleService: Title,
    private formBuilder: FormBuilder,
    private settings: AppConfigService
  ) { 
    this.PrintParams();
    this.setTitle(this.settings.config.apptitle);
  }
  
  setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  GetParam(name){
    const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if(!results){
      return 0;
    }
    return results[1] || 0;
  }

  PrintParams() {
    console.log('param1 = ' + this.GetParam('animal'));
  }

  cjson(obj) {
    return JSON.stringify(obj);
  }

  onSubmit() {
    console.warn(this.profileForm.value);
  }

  formSubmitted(value) {
    console.log(value);
  }

}
