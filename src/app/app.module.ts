import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./material.module";

import { HttpModule }      from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppConfigService } from './app-config.service';

import { InputComponent } from "./components/input/input.component";
import { ButtonComponent } from "./components/button/button.component";
import { SelectComponent } from "./components/select/select.component";
import { DateComponent } from "./components/date/date.component";
import { RadiobuttonComponent } from "./components/radiobutton/radiobutton.component";
import { CheckboxComponent } from "./components/checkbox/checkbox.component";
import { DynamicFieldDirective } from "./components/dynamic-field/dynamic-field.directive";
import { DynamicFormComponent } from "./components/dynamic-form/dynamic-form.component";

import { DynamicFormComponent2 } from './dynamic-form.component';


const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};

@NgModule({
  declarations: [
    AppComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    DynamicFieldDirective,
    DynamicFormComponent,
    DynamicFormComponent2
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    HttpClientModule
  ],
  providers: [
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService]
    },
    Title
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent
  ]
})
export class AppModule { }
