import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../http-client.service';


@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnInit {

  constructor(private httpCLient: HttpClientService) { }
  ngOnInit(){
    this.getUser();
  }
  username; error;

  getUser(): void {
    this.httpCLient.getCurrentUser().subscribe(userInfo => {
      if (userInfo.error) {
        this.error = userInfo.error
      } else {
        this.username = userInfo.username;
      }
    });
  };

}
