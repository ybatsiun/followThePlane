import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlanesListComponent } from './planes-list/planes-list.component';
import { AvailablePlanesComponent } from './available-planes/available-planes.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', component: LoginFormComponent },
  {
    path: 'welcome', component: DashboardComponent, children: [
      { path: 'myPlaneList', component: PlanesListComponent },
      { path: 'availablePlanes', component: AvailablePlanesComponent }
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
