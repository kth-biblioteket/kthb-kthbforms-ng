import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})

export class BackendService {

  constructor(
    private http: HttpClient,
    ) {
    }

  /**
   * 
   * @param url 
   * @param payload 
   * 
   * Posta formulärdata(payload) till backend(url)
   */
  /*
  postForm(url, payload): Observable<any> {
    
    return this.http.post<any>(url, payload, httpOptions).pipe(
      catchError(this.handleError<any>('postForm'))
    );
  }
  */

 postForm(url,payload) : Observable<HttpResponse<any>>{
    let httpHeaders = new HttpHeaders({
      'Content-Type' : 'application/json'
    }); 
    return this.http.post<any>(url, payload,{
		  headers: httpHeaders,
		  observe: 'response'
		});
  }
  /**
   * 
   * @param operation 
   * @param result 
   * 
   * Hantera eventuella fel.
   */
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
