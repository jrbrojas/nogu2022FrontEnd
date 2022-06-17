import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { DatoslaboralesComponent } from './components/datoslaborales/datoslaborales.component';
import { DatosapoderadoComponent } from './components/datosapoderado/datosapoderado.component';
import { DatosbienComponent } from './components/datosbien/datosbien.component';
import { DatosjuradosComponent } from './components/datosjurados/datosjurados.component';
import { DatosfinalesComponent } from './components/datosfinales/datosfinales.component';
import { DatoscontribuyenteComponent } from './components/datoscontribuyente/datoscontribuyente.component';
import { UifcontribuyenteComponent } from './components/uifcontribuyente/uifcontribuyente.component';
import { repeatWhen } from 'rxjs/operators';
import { RepresentantescontribuyenteComponent } from './components/representantescontribuyente/representantescontribuyente.component';
import { ListrepresentantescontribuyenteComponent } from './components/listrepresentantescontribuyente/listrepresentantescontribuyente.component';
import { ListaregistrosComponent } from './components/listaregistros/listaregistros.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GestionnotarialComponent } from './components/gestionnotarial/gestionnotarial.component';
import { GenerarplantillasComponent } from './components/generarplantillas/generarplantillas.component';

//export const ROUTES: Routes = [
const routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: LogInComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'laborales', component: DatoslaboralesComponent },
  { path: 'apoderado', component: DatosapoderadoComponent },
  { path: 'bien', component: DatosbienComponent },
  { path: 'jurado', component: DatosjuradosComponent },
  { path: 'terminado/:serie', component: DatosfinalesComponent },
  { path: 'contribuyente', component: DatoscontribuyenteComponent },
  { path: 'ucontribuyente', component: UifcontribuyenteComponent },
  { path: 'ncontribuyente', component: RepresentantescontribuyenteComponent },
  { path: 'lcontribuyente', component: ListrepresentantescontribuyenteComponent },
  { path: 'login', component: LoginComponent },
  { path: 'lregistros', component: ListaregistrosComponent },
  { path: 'plantillas', component: GenerarplantillasComponent },
  //{ path: 'gestionnotarial', component: GestionnotarialComponent },
  { path: '...', component: NavbarComponent },
  //{ path: 'login', component: LoginComponent },
  /*{
    path: 'login',
    component: LoginComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ]
  },*/
  { path: '**', pathMatch: 'full', redirectTo: 'home' }
];

export const ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'lregistros', component: ListaregistrosComponent },
  { path: 'plantillas', component: GenerarplantillasComponent },
  //{ path: 'gestionnotarial', component: GestionnotarialComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
