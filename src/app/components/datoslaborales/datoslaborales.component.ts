import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatosLaboralesModule } from '../../models/datos-laborales/datos-laborales.module';
import { MantenimientoService } from '../../services/mantenimiento.service';
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
  selector: 'app-datoslaborales',
  templateUrl: './datoslaborales.component.html',
  styleUrls: ['./datoslaborales.component.css']
})
export class DatoslaboralesComponent implements OnInit {
  data_documento: any;
  data_paises: any;
  data_estadocivil: any;
  datosLaboralesModule: DatosLaboralesModule = new DatosLaboralesModule();
  separacions: any = [{ 'id': 0, 'nombre': 'SI' }, { 'id': 1, 'nombre': 'NO' }];
  movil: boolean = false;

  constructor(
    private _router: Router,
    private mantenimientoService: MantenimientoService,
    public logInComponent: LogInComponent,
    private formularioService: FormularioService) {
    window.scrollTo(0, 0);
    this.formularioService.verifyItemStatus();
    if (isMobile.any())
      this.movil = true;
    else
      this.movil = false;
    this.mantenimientoService.getListTipoDocumento().subscribe(
      (data: any) => {
        this.data_documento = data['data'];
        this.mantenimientoService.getListPaises().subscribe(
          (data: any) => {
            this.data_paises = data['data'];
            this.mantenimientoService.getListEstadoCivil().subscribe(
              (data: any) => {
                this.data_estadocivil = data['data'];
              }
            );
          }
        );
      }
    );
  }

  ngOnInit() {
  }

  onReset() {
    this.logInComponent.onReset();
  }

  datosapoderados() {
    this.formularioService.verifyItemStatus();
    if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_opcion == 1 && this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite != 2) {
      if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite == 2) {
        this.logInComponent.registroPosi = 7;
        //this._router.navigate(['/bien']);
      } else {
        this.logInComponent.registroPosi = 8;
        //this._router.navigate(['/jurado']);
      }
    }
    else {
      if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_opcion == 1) {
        if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite == 2) {
          this.logInComponent.registroPosi = 7;
          //this._router.navigate(['/bien']);
        } else {
          this.logInComponent.registroPosi = 8;
          //this._router.navigate(['/jurado']);
        }
      } else {
        this.logInComponent.registroPosi = 3;
        //this._router.navigate(['/apoderado']);
      }
    }
  }

  return() {
    this.logInComponent.registroPosi = 1;
  }
}
