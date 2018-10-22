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
  private beHost = 'http://localhost:3000';
  private routes = {
    login: '/login',
    register: '/register',
    currentUser: '/authenticated/me'
  };

  constructor(private http: HttpClient) { }

  getHelloMessage() {
    console.log('getting hello message from be');
    return this.http.get(this.beHost + '/');
  }

  register(userRegisterInfo: any): Observable<UserLoginInfo> {
    return this.userInfoAction(userRegisterInfo, this.routes.register);
  };

  login(userLoginInfo: any): Observable<UserLoginInfo> {
    return this.userInfoAction(userLoginInfo, this.routes.login);
  };

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(this.beHost + this.routes.currentUser).pipe(
      catchError(this.handleError<any>())
    );
  };

  private userInfoAction(userLoginInfo: any, route: string): Observable<any> {
    return this.http.post<UserLoginInfo>(this.beHost + route, {
      'username': userLoginInfo.username,
      'password': userLoginInfo.password
    }).pipe(
      catchError(this.handleError<any>())
    )
  };

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // Let the app keep running by returning an empty result.
      return of(error as T);
    };
  };
}