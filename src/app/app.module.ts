import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppConfigService } from './app-config.service';

import { DynamicFormComponent } from './dynamic-form.component';

import { MyDatePickerModule } from 'mydatepicker';

import { ActivateaccountComponent } from './activateaccount/activateaccount.component';


const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};

@NgModule({
  declarations: [
    AppComponent,
    DynamicFormComponent,
    ActivateaccountComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MyDatePickerModule
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
  bootstrap: [AppComponent]
})
export class AppModule { }
