import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-planes-detail',
  templateUrl: './planes-detail.component.html',
  styleUrls: ['./planes-detail.component.css']
})
export class PlanesDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }
  id
  ngOnInit() {
    debugger
    this.id = this.route.snapshot.params.id;
  }

}
