import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginFormComponent } from './login-form/login-form.component';
import { UserLoginInfo } from './user-login-info';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {
  beHost = 'http://localhost:3000';
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
    return this.http.get(this.beHost + '/');
  }

  login(userLoginInfo: UserLoginInfo) {
    return this.http.post(this.beHost + '/login', {
      'username': userLoginInfo.username,
      'password': userLoginInfo.password
    }).subscribe(data => {
      debugger
    }, error => {
      debugger
    })
  }

}