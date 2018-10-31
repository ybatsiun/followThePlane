import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../http-client.service';

@Component({
  selector: 'app-planes-list',
  templateUrl: './planes-list.component.html',
  styleUrls: ['./planes-list.component.css']
})
export class PlanesListComponent implements OnInit {

  constructor(private httpCLient: HttpClientService) { }
  
  settings = {
    columns: {
      icao: {
        title: 'icao'
      },
      originCountry: {
        title: 'origin country'
      }
    }
  };

  
  planesList;
  ngOnInit() {
    this.httpCLient.getPlanesList().subscribe(data => {
      this.planesList = data.icaoList;
    })
  }
}
