import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { DatosEntityUifModule } from 'src/app/models/datos-entity-uif/datos-entity-uif.module';
import { FormularioService } from '../../services/formulario.service';
import { LogInComponent } from '../log-in/log-in.component';

var isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function () {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

@Component({
  selector: 'app-uifcontribuyente',
  templateUrl: './uifcontribuyente.component.html',
  styleUrls: ['./uifcontribuyente.component.css']
})
export class UifcontribuyenteComponent implements OnInit {
  separacions: any = [{ 'id': 0, 'nombre': 'SI' }, { 'id': 1, 'nombre': 'NO' }];
  laborales: any = {}
  data_paises: any;
  datosEntityUifModule: DatosEntityUifModule = new DatosEntityUifModule();
  movil: boolean = false;

  constructor(private _router: Router, private mantenimientoService: MantenimientoService, private formularioService: FormularioService, public logInComponent: LogInComponent) {
    window.scrollTo(0, 0);
    this.formularioService.verifyItemStatus();
    if (isMobile.any())
      this.movil = true;
    else
      this.movil = false;
    this.mantenimientoService.getListPaises().subscribe(
      (data: any) => {
        this.data_paises = data['data'];
      }
    );
  }

  ngOnInit() {
  }

  onReset() {
    this.logInComponent.onReset();
  }

  return() {
    this.logInComponent.registroPosi = 11;
  }

  datoslaborales() {
    //this._router.navigate(['/lcontribuyente']);
    this.logInComponent.registroPosi = 13;
  }
  otroorigen() {

  }
  otromediopago() {

  }
}
