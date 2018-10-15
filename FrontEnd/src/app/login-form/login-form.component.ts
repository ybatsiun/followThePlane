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

  onSubmit() {
    this.submitted = true;
    console.log('submitted')
    this.getWelcomeMessageFromBE();
  }
  model = new UserLoginInfo('foo@email.com', 'Dr IQ');

  getWelcomeMessageFromBE() {
    this.httpCLient.getHelloMessage().subscribe((data) => {

    })


  }
}
