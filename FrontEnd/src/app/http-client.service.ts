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
  private auth = '/authenticated'
  private routes = {
    login: '/login',
    register: '/register',
    logout: `${this.auth}/logout`,
    currentUser: `${this.auth}/me`,
    planesList: `${this.auth}/getMyIcaoList`,
    deleteIcao: `${this.auth}/deleteIcao`
  };

  constructor(private http: HttpClient) { }

  getHelloMessage() {
    return this.http.get(this.beHost + '/');
  }

  register(userRegisterInfo: any): Observable<UserLoginInfo> {
    return this.userInfoAction(userRegisterInfo, this.routes.register);
  };

  login(userLoginInfo: any): Observable<UserLoginInfo> {
    return this.userInfoAction(userLoginInfo, this.routes.login);
  };

  logout(): Observable<any> {
    return this.http.delete<any>(this.beHost + this.routes.logout).pipe(
      catchError(this.handleError<any>())
    );
  };

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(this.beHost + this.routes.currentUser).pipe(
      catchError(this.handleError<any>())
    );
  };

  getPlanesList(): Observable<any> {
    return this.http.get<any>(this.beHost + this.routes.planesList).pipe(
      catchError(this.handleError<any>())
    )
  }

  deleteIcao(icao): Observable<any> {
    return this.http.delete<any>(this.beHost + this.routes.deleteIcao + '/' + icao).pipe(
      catchError(this.handleError<any>())
    )
  }

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

  public getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
}