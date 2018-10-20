import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginFormComponent } from './login-form/login-form.component';
import { UserLoginInfo } from './user-login-info';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


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

  login(userLoginInfo: any): Observable<UserLoginInfo> {
    return this.http.post<UserLoginInfo>(this.beHost + '/login', {
      'username': userLoginInfo.username,
      'password': userLoginInfo.password
    }).pipe(
      catchError(this.handleError<UserLoginInfo>())
    )
  };

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // Let the app keep running by returning an empty result.
      return of(error as T);
    };
  }
}