import { BrowserModule } from '@angular/platform-browser';

/* Routing */
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

/* Angular Material */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* FormsModule */
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Angular Flex Layout */
import { FlexLayoutModule } from "@angular/flex-layout";

/* Components */
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { DatoslaboralesComponent } from './components/datoslaborales/datoslaborales.component';
import { DatosapoderadoComponent } from './components/datosapoderado/datosapoderado.component';
import { DatosbienComponent } from './components/datosbien/datosbien.component';
import { DatosjuradosComponent } from './components/datosjurados/datosjurados.component';
import { DatosfinalesComponent } from './components/datosfinales/datosfinales.component';
import { DatoscontribuyenteComponent } from './components/datoscontribuyente/datoscontribuyente.component';
import { HttpClientModule } from '@angular/common/http';
import { RecaptchaModule } from 'ng-recaptcha';
import { UifcontribuyenteComponent } from './components/uifcontribuyente/uifcontribuyente.component';
import { RepresentantescontribuyenteComponent } from './components/representantescontribuyente/representantescontribuyente.component';
import { ListrepresentantescontribuyenteComponent } from './components/listrepresentantescontribuyente/listrepresentantescontribuyente.component';
import { ListaregistrosComponent } from './components/listaregistros/listaregistros.component';
import { ROUTES } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatAutocompleteModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from "ngx-spinner";
import { MatFormFieldModule, MatSelectModule } from '@angular/material';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { GestionnotarialComponent } from './components/gestionnotarial/gestionnotarial.component';
import { GenerarplantillasComponent } from './components/generarplantillas/generarplantillas.component';

@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    RegisterComponent,
    LogInComponent,
    DatoslaboralesComponent,
    DatosapoderadoComponent,
    DatosbienComponent,
    DatosjuradosComponent,
    DatosfinalesComponent,
    DatoscontribuyenteComponent,
    UifcontribuyenteComponent,
    RepresentantescontribuyenteComponent,
    ListrepresentantescontribuyenteComponent,
    ListaregistrosComponent,
    LoginComponent,
    NavbarComponent,
    GestionnotarialComponent,
    GenerarplantillasComponent
  ],
  imports: [
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatFormFieldModule,
    NgxSpinnerModule,
    MatAutocompleteModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    RecaptchaModule,
    NgxPaginationModule,
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],
  providers: [
    RegisterComponent,
    LogInComponent,
    DatoslaboralesComponent
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [LogInComponent]
})

export class AppModule { }