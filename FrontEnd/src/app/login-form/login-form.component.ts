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
// TODO onInit if you are logged in go to welcome
export class LoginFormComponent {

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
          this.router.navigateByUrl('/welcome');
        };
      });
  }
}
