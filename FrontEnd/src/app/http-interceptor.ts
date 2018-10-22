import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ApiRequestInterceptor implements HttpInterceptor {
    public intercept(request: HttpRequest<any>, next: HttpHandler) {
        if (request.url.includes('/authenticated')) {
            const cookie = this.getCookie('followThePlaneCookie')
            return next.handle(request.clone({
                setHeaders: {
                    "content-type": "application/json",
                    "x-auth": cookie
                },
            }));
        } else { return next.handle(request.clone()) }
    }

    private getCookie(name) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
}