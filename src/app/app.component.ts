import { Component } from '@angular/core';

import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

import { Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  profileForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: [''],
    address: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      zip: ['']
    }),
  });

  constructor(
    private formBuilder: FormBuilder
  ) { 
    //this.createForm();
    this.PrintParams();
  }
  
  title = 'kthb-bestall-ng';

  GetParam(name){
    const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if(!results){
      return 0;
    }
    return results[1] || 0;
  }

  PrintParams() {
    console.log('param1 = ' + this.GetParam('animal'));
    console.log('param2 = ' + this.GetParam('param2'));
  }

  cjson(obj) {
    console.log(obj);
    return JSON.stringify(obj);
  }
  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }

}
