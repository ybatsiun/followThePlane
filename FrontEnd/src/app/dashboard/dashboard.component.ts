import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../http-client.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private httpCLient: HttpClientService) { }
  username; error;

  ngOnInit() {
    this.getUser();
  }

  logout() {
    this.httpCLient.logout().subscribe(() => { });
  }


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
