import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OpenurlService {

  constructor() { }

  //skapa en array av openurlparametrar
  parseopenurl (payload) {

  }

  openurlparametersToJSON() {			
    var pairs = location.search.slice(1).split('&');
    var result = {};
    pairs.forEach(function(pair:any) {
      pair = pair.split('=');
      result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result));
  }
}
