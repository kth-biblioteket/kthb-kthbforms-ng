import { Component, ViewChild } from '@angular/core';

import { Title } from '@angular/platform-browser';

import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AppConfigService } from './app-config.service';

import { FieldConfig } from "./field.interface";

import { DynamicFormComponent } from "./components/dynamic-form/dynamic-form.component";

import { person } from './person';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
 
  //hämta formulärfält från service(config-fil)
  config = this.settings.config.formfields;

  person;

  regConfig: FieldConfig[] = [
    {
      type: "input",
      label: "Username",
      inputType: "text",
      name: "name",
      validations: [
        {
          name: "required",
          validator: Validators.required,
          message: "Name Required"
        },
        {
          name: "pattern",
          validator: Validators.pattern("^[a-zA-Z]+$"),
          message: "Accept only text"
        }
      ]
    },
    {
      type: "input",
      label: "Email Address",
      inputType: "email",
      name: "email",
      validations: [
        {
          name: "required",
          validator: Validators.required,
          message: "Email Required"
        },
        {
          name: "pattern",
          validator: Validators.pattern(
            "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"
          ),
          message: "Invalid email"
        }
      ]
    },
    {
      type: "input",
      label: "Password",
      inputType: "password",
      name: "password",
      validations: [
        {
          name: "required",
          validator: Validators.required,
          message: "Password Required"
        }
      ]
    },
    {
      type: "radiobutton",
      label: "Gender",
      name: "gender",
      options: ["Male", "Female"],
      value: "Male"
    },
    {
      type: "date",
      label: "DOB",
      name: "dob",
      validations: [
        {
          name: "required",
          validator: Validators.required,
          message: "Date of Birth Required"
        }
      ]
    },
    {
      type: "select",
      label: "Country",
      name: "country",
      value: "UK",
      options: ["India", "UAE", "UK", "US"]
    },
    {
      type: "checkbox",
      label: "Accept Terms",
      name: "term",
      value: true
    },
    {
      type: "button",
      label: "Save"
    }
  ];

  submit(value: any) {}

  profileForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    ])],
    password: [''],
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
    //this.person = person;
    this.person = this.settings.config.formfields2
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

  onSubmit() {
    console.warn(this.profileForm.value);
  }

  formSubmitted(value) {
    console.log(value);
  }

}
