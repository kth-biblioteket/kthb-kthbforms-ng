import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable()
export class AppConfigService {
    private appConfig;

    constructor (
        private injector: Injector
    ) { }

    /**
     * 
     * Läs in konfiguration från JSON
     * 
     * Anpassa hämtning av konfiguration beroende på development eller production
     * via environment
     * 
     */
    loadAppConfig() {
        let http = this.injector.get(HttpClient);
        return http.get(environment.configurl + '?time=' + Date.now())
        .toPromise()
        .then(data => {
            this.appConfig = data;
        })
    }

    get config() {
        return this.appConfig;
    }
}