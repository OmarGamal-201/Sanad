import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { InfoComponent } from './components/info/info.component';
import { ReviewComponent } from './components/review/review.component';
import { AdminComponent } from './components/admin/admin.component';
import { ClientdashboardComponent } from './components/clientdashboard/clientdashboard.component';
import { ServicesComponent } from './components/services/services.component';
import { ProviderdashboardComponent } from './components/providerdashboard/providerdashboard.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // ← add this

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    InfoComponent,
    ReviewComponent,
    AdminComponent,
    ClientdashboardComponent,
    ServicesComponent,
    ProviderdashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
      HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
