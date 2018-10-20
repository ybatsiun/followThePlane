import { Component, OnInit } from '@angular/core';
import { UserLoginInfo } from '../user-login-info';
import { HttpClientService } from '../http-client.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {

  constructor(private httpCLient: HttpClientService) { }
  submitted = false;
  error;

  onSubmit() {
    this.submitted = true;
    const m = this.httpCLient.login(this.model).subscribe(
      userLoginInfo => {
        debugger
        if (userLoginInfo.error) {
          this.model.error = userLoginInfo.error
        } else {
          this.model.error = "";
        };
        console.log(this.model);
      });
  }
  model = new UserLoginInfo('testtest', 'testtest', '');
}
