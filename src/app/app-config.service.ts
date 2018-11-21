import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppConfigService {
    private appConfig;

    constructor (private injector: Injector) { }

    /**
     * 
     * Läs in konfiguration från JSON
     */
    loadAppConfig() {
        let http = this.injector.get(HttpClient);

        //return http.get('https://apps.lib.kth.se/forms/bestallng/assets/appConfig.json')
        return http.get('./assets/appConfig.json')
        .toPromise()
        .then(data => {
            this.appConfig = data;
        })
    }

    get config() {
        return this.appConfig;
    }
}