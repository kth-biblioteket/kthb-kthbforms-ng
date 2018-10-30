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

  constructor(private formBuilder: FormBuilder) { 
    //this.createForm();
  }
  
  title = 'kthb-bestall-ng';

  cjson(obj) {
    console.log(obj);
    return JSON.stringify(obj);
  }
  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }

}
