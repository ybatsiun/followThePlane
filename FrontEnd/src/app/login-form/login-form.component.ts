import { Component, OnInit } from '@angular/core';
import { UserLoginInfo } from '../user-login-info';
import { HttpClientService } from '../http-client.service';
import { Observable } from 'rxjs';
import { Router } from "@angular/router";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  ngOnInit(): void {
    debugger
    if (this.getCookie('followThePlaneCookie')) {
      this.router.navigateByUrl('/myPlaneList');
    }
  }
  constructor(private httpCLient: HttpClientService, private router: Router) {

  }
  model = new UserLoginInfo('testtest', 'testtest', '');
  submitted = false;

  login() {
    this.formAction(this.httpCLient.login(this.model));
  }

  register() {
    this.formAction(this.httpCLient.register(this.model));
  }

  private formAction(action: Observable<any>) {
    this.submitted = true;
    action.subscribe(
      userLoginInfo => {
        if (userLoginInfo.error) {
          this.model.error = userLoginInfo.error
        } else {
          this.model.error = "";
          document.cookie = `followThePlaneCookie=${userLoginInfo.tokens.slice(-1)[0].token}`;
          this.router.navigateByUrl('/myPlaneList');
        };
      });
  }

  //dublicate!
  private getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
}
