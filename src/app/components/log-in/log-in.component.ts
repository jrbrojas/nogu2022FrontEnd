import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { FormularioService } from '../../services/formulario.service';
import { TamiteOpcionesModule } from '../../models/tamite-opciones/tamite-opciones.module';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Funciones } from '../../funciones/funciones';
import { DatosBienModule } from '../../models/datos-bien/datos-bien.module';
import { DatosLaboralesModule } from '../../models/datos-laborales/datos-laborales.module';
import { DatosApoderadoModule } from '../../models/datos-apoderado/datos-apoderado.module';
import { DatosBasicosModule } from '../../models/datos-basicos/datos-basicos.module';
import { DatosEntityModule } from '../../models/datos-entity/datos-entity.module';
import { DatosEntityUifModule } from '../../models/datos-entity-uif/datos-entity-uif.module';
import { ContribuyenteModule } from '../../models/contribuyente/contribuyente.module';
import { FormControl } from '@angular/forms';
import { async } from '@angular/core/testing';

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
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {

  public registroPosi: number = 0;
  documento: number = 0;
  NDocumento: string = "";
  inicio: boolean = true;
  opciones: any = {};
  movil: boolean = false;

  public biDocumentoEncontrado: boolean = false;
  public datosBasicosModuleSend: DatosBasicosModule = new DatosBasicosModule();
  public datosLaboralesModuleSend: DatosLaboralesModule = new DatosLaboralesModule();
  public datosApoderadoModuleSend: DatosApoderadoModule = new DatosApoderadoModule();
  public datosBienModuleSend: DatosBienModule = new DatosBienModule();
  public datosTamiteOpcionesModuleSend: TamiteOpcionesModule = new TamiteOpcionesModule();

  public datosEntityModuleSend: DatosEntityModule = new DatosEntityModule();
  public datosEntityUifModuleSend: DatosEntityUifModule = new DatosEntityUifModule();
  public contribuyenteModule: ContribuyenteModule = new ContribuyenteModule();
  public contribuyenteModuleArr: any = [];

  constructor(
    public _router: Router,
    public formularioService: FormularioService,
    public mantenimientoService: MantenimientoService,
    public funciones: Funciones) {
    window.scrollTo(0, 0);
    this.documento = 0;
    if (isMobile.any())
      this.movil = true;
    else
      this.movil = false;
    this.inicio = true;
    this.opciones.tipo_persona = 0;
    this.opciones.opcion_transmite = 0;
    this.opciones.tipo_transmite = 5;
    if (localStorage.getItem('update') != undefined && localStorage.getItem('update') != null && localStorage.getItem('update') != '') {
      if (localStorage.getItem('update') == '1') {
        localStorage.setItem('update', '0');
        this.datosBienModuleSend = JSON.parse(localStorage.getItem('data_bien'));
        this.datosLaboralesModuleSend = JSON.parse(localStorage.getItem('datos_laborales'));
        this.datosTamiteOpcionesModuleSend = JSON.parse(localStorage.getItem('tramite_opciones'));
        this.datosBasicosModuleSend = JSON.parse(localStorage.getItem('datos_basicos'));
        this.datosApoderadoModuleSend = JSON.parse(localStorage.getItem('datos_apoderado'));
        this.registroPosi = 1;
        //this.ubigeoCtrl.setValue({ id: this.datosBasicosModuleSend.id_ubigeo });
        this.datosBasicosModuleSend.fecha_nacimiento = this.formato_fecha(this.datosBasicosModuleSend.fecha_nacimiento);
        this.datosBasicosModuleSend.conyugue_fecha_nacimiento = this.formato_fecha(this.datosBasicosModuleSend.conyugue_fecha_nacimiento);
        this.datosApoderadoModuleSend.fecha_nacimiento = this.formato_fecha(this.datosApoderadoModuleSend.fecha_nacimiento);
      }
      if (localStorage.getItem('update') == '2') {
        localStorage.setItem('update', '0');
        this.datosBienModuleSend = JSON.parse(localStorage.getItem('data_bien'));
        this.datosTamiteOpcionesModuleSend = JSON.parse(localStorage.getItem('tramite_opciones'));
        this.datosEntityModuleSend = JSON.parse(localStorage.getItem('datos_entidad'));
        this.datosEntityUifModuleSend = JSON.parse(localStorage.getItem('datos_entidad_uif'));
        this.contribuyenteModuleArr = JSON.parse(localStorage.getItem('data_contribuyentes'));
        if (this.contribuyenteModuleArr != undefined && this.contribuyenteModuleArr != null) {
          for (let index = 0; index < this.contribuyenteModuleArr.length; index++) {
            this.contribuyenteModuleArr[index].fecha_nacimiento = this.formato_fecha(this.contribuyenteModuleArr[index].fecha_nacimiento);
          }
        } else {
          this.contribuyenteModuleArr = [];
        }
        this.registroPosi = 11;
      }
    }

  }

  ngOnInit() {
    this.inicio = true;
  }

  onInicio() {
    localStorage.setItem('windows', '1');
    this.inicio = !this.inicio;
  }

  acciones(id: number) {
    this.formularioService.verifyItemStatus();
    this.opciones.tipo_persona = id;
    this.datosTamiteOpcionesModuleSend.tipo_persona = id;
    this.documento = 1;
    this.onOpcionDocumento(2);
  }

  titular(x: number) {
    this.formularioService.verifyItemStatus();
    this.opciones.opcion_transmite = x;
    this.datosTamiteOpcionesModuleSend.tipo_opcion = x;
    this.opciones.tipo_transmite = 0;
  }

  transmite(id: number) {
    this.formularioService.verifyItemStatus();
    this.opciones.tipo_transmite = id;
    this.datosTamiteOpcionesModuleSend.tipo_tramite = id;
    if (id != 2) {
      if (this.opciones.tipo_persona == 2) {
        //this._router.navigate(['/register']);
        this.registroPosi = 1;
      }
      else {
        this.registroPosi = 11;
        //this._router.navigate(['/contribuyente']);
      }
    }
  }

  trasnferencia(id: number) {
    this.formularioService.verifyItemStatus();
    this.datosTamiteOpcionesModuleSend.tipo_condicion = id;
    if (this.opciones.tipo_persona == 2) {
      //this._router.navigate(['/register']);
      this.registroPosi = 1;
    }
    else {
      this.registroPosi = 11;
      //this._router.navigate(['/contribuyente']);
    }
  }

  onOpcionDocumento(tipo: number) {
    this.formularioService.verifyItemStatus();
    if (tipo == 1) {
      this.documento = 2;
    } else {
      this.documento = 0;
      if (this.opciones.tipo_persona == 1) {
        this.opciones.tipo_transmite = 0;
      }
    }
  }

  cancelar() {
    this.formularioService.verifyItemStatus();
    this.documento = 1;
  }

  returnRegistro(registroPosi: number) {
    this.registroPosi = registroPosi;
  }

  next() {
    //this.registroPosi++;
  }

  returm() {
    this.registroPosi--;
  }

  onReset() {
    this.biDocumentoEncontrado = false;
    this.registroPosi = 0;
    this.documento = 0;
    this.NDocumento = "";
    this.inicio = true;
    this.opciones = {};
    this.datosBasicosModuleSend = new DatosBasicosModule();
    this.datosLaboralesModuleSend = new DatosLaboralesModule();
    this.datosApoderadoModuleSend = new DatosApoderadoModule();
    this.datosBienModuleSend = new DatosBienModule();
    this.datosTamiteOpcionesModuleSend = new TamiteOpcionesModule();

    this.datosEntityModuleSend = new DatosEntityModule();
    this.datosEntityUifModuleSend = new DatosEntityUifModule();
    this.contribuyenteModule = new ContribuyenteModule();
    this.contribuyenteModuleArr = [];

    localStorage.setItem('update', '0');
    window.scrollTo(0, 0);
    if (isMobile.any())
      this.movil = true;
    else
      this.movil = false;
    this.opciones.tipo_persona = 0;
    this.opciones.opcion_transmite = 0;
    this.opciones.tipo_transmite = 5;
  }

  formato_fecha(fecha) {
    try {
      console.log(fecha);
      if (fecha != undefined && fecha != null && fecha != '') {
        var fechaArr = fecha.split("/")
        if (fechaArr.length === 3) {
          var newD = (fechaArr[2] + "-" + fechaArr[1] + "-" + fechaArr[0]);
          console.log(newD);
          return newD
        }
        return '';
      } else {
        return ''
      }
    } catch (error) {
      return '';
    }
  }
}
