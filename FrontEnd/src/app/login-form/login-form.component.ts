import { Component, OnInit } from '@angular/core';
import { UserLoginInfo } from '../user-login-info';
import { HttpClientService } from '../http-client.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {

  constructor(private httpCLient: HttpClientService) {

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

        };
      });
  }
}
