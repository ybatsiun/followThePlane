import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClientService } from '../http-client.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-planes-detail',
  templateUrl: './planes-detail.component.html',
  styleUrls: ['./planes-detail.component.css']
})
export class PlanesDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute, private httpCLient: HttpClientService, private router: Router) { }
  id;
  planeState;
  icao;
  settings = {
    mode: 'external',
    columns: {
      avarageGeoAltitude: {
        title: 'Avarage Geo Altitude'
      },
      avarageVelocity: {
        title: 'Avarage Velocity'
      },
      flightTime: {
        title: 'Flight Time'
      },
      startLocationCountry: {
        title: 'Travelled from'
      },
      finishLocationCountry: {
        title: 'Travelled to'
      },
    },
    editable: false,
    noDataMessage: 'there are no trips data for ' + this.icao,
    actions: {
      edit: false, add: false, delete: false, position: 'right', columnTitle: ''
    }
  };

  ngOnInit() {
    this.id = this.route.snapshot.params.id;

    this.httpCLient.getCurrentPlaneStates(this.id).subscribe(data => {

      this.icao = data[0].icao;
      this.planeState = data[0].tripsData;

      for (const trip of this.planeState) {

        if (trip.hasOwnProperty('finishLocationObj') && trip.hasOwnProperty('startLocationObj')) {
          trip.startLocationCountry = trip.startLocationObj[0].adminArea1;
          trip.finishLocationCountry = trip.finishLocationObj[0].adminArea1;
        } else {
          trip.startLocationCountry = 'no data';
          trip.finishLocationCountry = 'no data';
        };

      };

    });
  }
}






