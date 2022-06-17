import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from '../../services/formulario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { keyRecaptchaClient, keyRecaptchaServer } from '../../config/methods';
import { Funciones } from '../../funciones/funciones';
import { LogInComponent } from '../log-in/log-in.component';

@Component({
  selector: 'app-datosjurados',
  templateUrl: './datosjurados.component.html',
  styleUrls: ['./datosjurados.component.css']
})
export class DatosjuradosComponent implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  estadoCapcha: boolean = false;
  acuerdos1: boolean = false;
  acuerdos2: boolean = false;
  spinner: boolean = false;
  acuerdo: boolean = false;
  captchaResponseToken: string = "";

  keyRecaptchaClient: string = "";
  keyRecaptchaServer: string = "";

  tipo: boolean = true;

  constructor(
    private _router: Router,
    private formularioService: FormularioService,
    public logInComponent: LogInComponent,
    private _formBuilder: FormBuilder,
    private funciones: Funciones
  ) {
    window.scrollTo(0, 0);
    this.formularioService.verifyItemStatus();
    this.acuerdo = false;
    this.keyRecaptchaClient = keyRecaptchaClient;
    this.keyRecaptchaServer = keyRecaptchaServer;
    if (localStorage.getItem('token') != undefined && localStorage.getItem('token') != null && localStorage.getItem('token') != '') {
      this.validar(true);
    } else {
      this.validar(false);
    }
  }
  validar(value) {
    this.tipo = value;
  }

  openCondiciones() {
    this.acuerdo = !this.acuerdo;
  }

  onReset() {
    this.logInComponent.onReset();
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  datosguardar() {
    this._router.navigate(['/terminado']);
  }

  resolved(captchaResponse: string) {
    this.captchaResponseToken = captchaResponse;
    if (captchaResponse != null && captchaResponse != "") {
      this.estadoCapcha = true;
    }
  }

  resertCapcha() {
    var verifyCallback = function (response) {
      alert(response);
    };
    var widgetId2;
    var onloadCallback = function () {
      widgetId2 = grecaptcha.render(document.getElementById('formGuardar'), {
        'sitekey': this.keyRecaptchaClient
      });
    };

  }

  postInsert() {
    var v = localStorage.getItem('windows');
    var acuerdos = false;
    if (this.acuerdos1 == true && this.acuerdos2 == true) {
      acuerdos = true;
    }
    if (this.tipo) {
      acuerdos = true;
    } else {
      grecaptcha.reset();
    }
    if (acuerdos) {
      this.estadoCapcha = false;
      this.spinner = true;
      if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_persona == 1) {
        const dataSend = JSON.stringify({
          'token': localStorage.getItem('token'),
          'captchaResponseToken': this.captchaResponseToken,
          'datosBienModuleSend': this.logInComponent.datosBienModuleSend,
          'datosEntityModuleSend': this.logInComponent.datosEntityModuleSend,
          'datosEntityUifModuleSend': this.logInComponent.datosEntityUifModuleSend,
          'datosTamiteOpcionesModuleSend': this.logInComponent.datosTamiteOpcionesModuleSend,
          'contribuyenteModuleArr': this.logInComponent.contribuyenteModuleArr,
        });
        this.captchaResponseToken = "";
        if (this.logInComponent.datosTamiteOpcionesModuleSend.id > 0)
          this.postUpdateB(dataSend);
        else
          this.postInsertB(dataSend);
      } else {
        const dataSend = JSON.stringify({
          'token': localStorage.getItem('token'),
          'captchaResponseToken': this.captchaResponseToken,
          'datosBienModuleSend': this.logInComponent.datosBienModuleSend,
          'datosTamiteOpcionesModuleSend': this.logInComponent.datosTamiteOpcionesModuleSend,
          'datosBasicosModuleSend': this.logInComponent.datosBasicosModuleSend,
          'datosLaboralesModuleSend': this.logInComponent.datosLaboralesModuleSend,
          'datosApoderadoModuleSend': this.logInComponent.datosApoderadoModuleSend
        });
        this.captchaResponseToken = "";
        if (this.logInComponent.datosTamiteOpcionesModuleSend.id > 0)
          this.postUpdateA(dataSend);
        else
          this.postInsertA(dataSend);
      }
    } else {
      this.funciones.mensajeError("", "Debe aceptar los acuerdos");
    }
  }

  postInsertA(data: any) {
    this.funciones.showLoading();
    this.formularioService.postInsertFormulaioA(data)
      .subscribe(
        (data: any) => {
          this.funciones.hideLoading();
          if (data['statuscode'] == 200) {
            this.funciones.mensajeOk("", data['mensaje']);
            this.logInComponent.onReset();
            //this._router.navigate(['/home']);
            //this._router.navigate(['/terminado', data['mensaje']]);
          } else {
            this.spinner = false;
            this.funciones.mensajeError("", data['mensaje']);
          }
        },
        (error: any) => {
          this.funciones.hideLoading();
          this.spinner = false;
          this.funciones.mensajeError("", "Falta ingresar datos");
        }
      )
  }

  postInsertB(data: any) {
    this.funciones.showLoading();
    this.formularioService.postInsertFormulaioB(data)
      .subscribe(
        (data: any) => {
          this.funciones.hideLoading();
          if (data['statuscode'] == 200) {
            this.funciones.mensajeOk("", data['mensaje']);
            //this._router.navigate(['/home']);
            this.logInComponent.onReset();
            //this._router.navigate(['/terminado', data['mensaje']]);
          } else {
            this.spinner = false;
            this.funciones.mensajeError("", data['mensaje']);
          }
        },
        (error: any) => {
          this.spinner = false;
          this.funciones.hideLoading();
          this.funciones.mensajeError("", "Falta ingresar datos");
        }
      )
  }
  postUpdateA(data: any) {
    this.funciones.showLoading();
    this.formularioService.postUpdateFormulaioA(data)
      .subscribe(
        (data: any) => {
          this.funciones.hideLoading();
          if (data['statuscode'] == 200) {
            this.funciones.mensajeOk("", data['mensaje']);
            //this._router.navigate(['/home']);
            this.logInComponent.onReset();
            //this._router.navigate(['/terminado', data['mensaje']]);
          } else {
            this.spinner = false;
            this.funciones.mensajeError("", data['mensaje']);
          }
        },
        (error: any) => {
          this.funciones.hideLoading();
          this.spinner = false;
          this.funciones.mensajeError("", "Falta ingresar datos");
        }
      )
  }

  postUpdateB(data: any) {
    this.funciones.showLoading();
    this.formularioService.postUpdateFormulaioB(data)
      .subscribe(
        (data: any) => {
          this.funciones.hideLoading();
          if (data['statuscode'] == 200) {
            this.funciones.mensajeOk("", data['mensaje']);
            this.logInComponent.onReset();
            //this._router.navigate(['/home']);
            //this._router.navigate(['/terminado', data['mensaje']]);
          } else {
            this.spinner = false;
            this.funciones.mensajeError("", data['mensaje']);
          }
        },
        (error: any) => {
          this.funciones.hideLoading();
          this.spinner = false;
          this.funciones.mensajeError("", "Falta ingresar datos");
        }
      )
  }

  return() {
    if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_opcion == 1) {
      if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite == 2) {
        this.logInComponent.registroPosi = 7;
        //this._router.navigate(['/bien']);
      } else {
        if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_persona == 1) {
          if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite == 2) {
            this.logInComponent.registroPosi = 7;
          } else {
            this.logInComponent.registroPosi = 13;
          }
        } else {
          this.logInComponent.registroPosi = 2;
        }
        //this._router.navigate(['/jurado']);
      }
    } else {
      if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_persona == 1) {
        if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite == 2) {
          this.logInComponent.registroPosi = 7;
        } else {
          this.logInComponent.registroPosi = 13;
        }
      } else {
        if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite == 2) {
          this.logInComponent.registroPosi = 7;
        } else {
          this.logInComponent.registroPosi = 3;
        }
      }
      //this._router.navigate(['/apoderado']);
    }
  }
}
