import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-planes-list',
  templateUrl: './planes-list.component.html',
  styleUrls: ['./planes-list.component.css']
})
export class PlanesListComponent implements OnInit {

  constructor(private httpCLient: HttpClientService, private router: Router) { }

  settings = {
    mode: 'external',
    columns: {
      icao: {
        title: 'icao'
      },
      originCountry: {
        title: 'origin country'
      }
    },
    editable: false,
    noDataMessage: 'there are no planes in your list',
    actions: {
      edit: false, add: false, position: 'right', columnTitle: ''
    }
  };


  planesList;
  ngOnInit() {
    this.httpCLient.getPlanesList().subscribe(data => {
      this.planesList = data.icaoList;
    })
  }

  onDelete(event) {
    this.httpCLient.deleteIcao(event.data.icao).subscribe(function () {
      this.ngOnInit();
    }.bind(this))
  }

  onUserRowSelect(event) {
    this.router.navigateByUrl('/planeDetailView/' + event.data.id)
  }
}
