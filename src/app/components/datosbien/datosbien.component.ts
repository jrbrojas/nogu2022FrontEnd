import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatosBienModule } from '../../models/datos-bien/datos-bien.module';
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
  selector: 'app-datosbien',
  templateUrl: './datosbien.component.html',
  styleUrls: ['./datosbien.component.css']
})
export class DatosbienComponent implements OnInit {
  tipo_documento: string;
  tipo_estado: string;
  separacion_patrimonio: string;
  monedas: any = [{ 'id': 'SOLES', 'nombre': 'SOLES' }, { 'id': "DOLARES", 'nombre': 'DOLARES' }];
  seasons: any = [{ 'id': 0, 'nombre': 'Vehículo' }, { 'id': 1, 'nombre': 'Arma de Fuego' }];
  separacions: any = [{ 'id': 0, 'nombre': 'SI' }, { 'id': 1, 'nombre': 'NO' }];
  bien: any = {}
  movil: boolean = false;

  datosBienModule: DatosBienModule = new DatosBienModule();

  constructor(
    private _router: Router,
    public logInComponent: LogInComponent,
    private formularioService: FormularioService
  ) {
    window.scrollTo(0, 0);
    this.formularioService.verifyItemStatus();
    if (isMobile.any())
      this.movil = true;
    else
      this.movil = false;
    this.bien.otro = 0;
  }

  ngOnInit() {
  }

  describir() {
    if (this.bien.otro == 0) {
      this.bien.otro = 1;
    }
    else {

      this.bien.otro = 0;
    }
  }

  onReset() {
    this.logInComponent.onReset();
  }

  datosfinales() {
    //this._router.navigate(['/jurado']);
    this.logInComponent.registroPosi = 8;
  }

  return() {
    if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_persona == 1) {
      this.logInComponent.registroPosi = 13;
      //this._router.navigate(['/jurado']);
    } else {
      if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_opcion == 2)
        this.logInComponent.registroPosi = 3;
      else
        this.logInComponent.registroPosi = 2;
      //this._router.navigate(['/apoderado']);
    }
  }

  next() {

  }

}
