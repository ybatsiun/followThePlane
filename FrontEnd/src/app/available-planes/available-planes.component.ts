import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClientService } from '../http-client.service';
import { Router } from "@angular/router"

@Component({
  selector: 'app-available-planes',
  templateUrl: './available-planes.component.html',
  styleUrls: ['./available-planes.component.css']
})
export class AvailablePlanesComponent implements OnInit {

  constructor(private route: ActivatedRoute, private httpCLient: HttpClientService, private router: Router) { }

  availablePlanes;
  selectedPlanes;

  settings = {
    mode: 'external',
    selectMode: 'multi',
    pager: { perPage: 20 },
    columns: {
      icao: {
        title: 'Icao number'
      },
      origin_country: {
        title: 'Origin Country'
      }
    },
    editable: false,
    noDataMessage: 'oops, no available planes for the moment',
    actions: {
      edit: false, add: false, delete: false, position: 'right', columnTitle: ''
    }
  };

  ngOnInit() {
    this.httpCLient.getAvailablePlanes().subscribe(data => {
      this.availablePlanes = data;
    });
  }

  onUserRowSelect(event) {
    this.selectedPlanes = event.selected.map(i => i.icao);
  }

  addPlanes() {
    this.httpCLient.addPlanes(this.selectedPlanes).subscribe(function () {
    })
  }

}
