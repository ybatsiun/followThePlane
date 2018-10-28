import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlanesListComponent } from './planes-list/planes-list.component';
import { AvailablePlanesComponent } from './available-planes/available-planes.component';

const routes: Routes = [
  { path: '', component: LoginFormComponent }, //TODO if you re logged in and go to root you are still asked to log in
  {
    path: 'welcome', component: DashboardComponent, children: [
      { path: 'myPlaneList', component: PlanesListComponent },
      { path: 'availablePlanes', component: AvailablePlanesComponent }
    ]
  }
  //{ path: '**', component: PageNotFoundComponent } TODO
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
