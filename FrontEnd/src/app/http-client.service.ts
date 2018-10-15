import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginFormComponent } from './login-form/login-form.component';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {
  host = 'localhost:3000';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  private extractData(res: Response) {
    let body = res;
    return body || {};
  }
  constructor(private http: HttpClient) { }

  getHelloMessage() {
    console.log('getting hello message from be');
    return this.http.get(/*this.host +*/ 'http://localhost:3000/');
  }

}