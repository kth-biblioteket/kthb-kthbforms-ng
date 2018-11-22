import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})


export class BackendService {
  
  form;

  constructor(
    private http: HttpClient,
    private settings: AppConfigService
    ) {
    }

  
  getFormdata (formid) {
    var formArray = this.settings.config.forms;
    for (var i = 0; i < formArray.length; i++) {
        if (formArray[i].id == formid) {
          return formArray[i];
        }
    }
  }

  postForm(payload, formid): Observable<any> {
     //hämta rätt formulärdata beroende på angivet formid i app-root attribute
    this.form = this.getFormdata (formid)
    console.log(this.form.posturl);
    return this.http.post<any>(this.form.posturl, payload, httpOptions).pipe(
      //tap((product) => console.log(`added product w/ id=${product.id}`)),
      catchError(this.handleError<any>('postForm'))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
