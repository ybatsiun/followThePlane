import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpInterceptor,HTTP_INTERCEPTORS } from '@angular/common/http';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { AppComponent } from './app.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ApiRequestInterceptor } from './http-interceptor';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlanesListComponent } from './planes-list/planes-list.component';
import { AvailablePlanesComponent } from './available-planes/available-planes.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PlanesDetailComponent } from './planes-detail/planes-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    DashboardComponent,
    PlanesListComponent,
    AvailablePlanesComponent,
    PageNotFoundComponent,
    PlanesDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    Ng2SmartTableModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiRequestInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
