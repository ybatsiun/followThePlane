import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private httpCLient: HttpClientService,private router: Router) { }
  username; error;

  ngOnInit() {
    this.getUser();
  }

  logout() {
    this.httpCLient.logout().subscribe(() => {
      document.cookie = 'followThePlaneCookie=; Max-Age=0'
      this.router.navigateByUrl('/');
    });
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
