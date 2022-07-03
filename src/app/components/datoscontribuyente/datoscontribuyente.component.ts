import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatosEntityModule } from '../../models/datos-entity/datos-entity.module';
import { ContribuyenteModule } from '../../models/contribuyente/contribuyente.module';
import { FormularioService } from '../../services/formulario.service';
import { LogInComponent } from '../log-in/log-in.component';
import { Funciones } from '../../funciones/funciones';
import { DatosBienModule } from '../../models/datos-bien/datos-bien.module';
import { DatosEntityUifModule } from '../../models/datos-entity-uif/datos-entity-uif.module';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { MantenimientoService } from '../../services/mantenimiento.service';

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
  selector: 'app-datoscontribuyente',
  templateUrl: './datoscontribuyente.component.html',
  styleUrls: ['./datoscontribuyente.component.css']
})
export class DatoscontribuyenteComponent implements AfterViewInit, OnDestroy {

  public ubigeoCtrl: FormControl = new FormControl();
  public ubigeoFilterCtrl: FormControl = new FormControl();
  @ViewChild('singleSelect', { static: true }) singleSelectUbigeo: MatSelect;
  private _onDestroyUbigeo = new Subject<void>();
  UbigeoList: any;
  public filteredUbigeo: ReplaySubject<any> = new ReplaySubject<any>(1);

  public formData: FormControl = new FormControl();
  myControl = new FormControl();

  separacions: any = [{ 'id': 0, 'nombre': 'SI' }, { 'id': 1, 'nombre': 'NO' }];
  datosEntityModule: DatosEntityModule = new DatosEntityModule();
  movil: boolean = false;

  constructor(private funciones: Funciones, private mantenimientoService: MantenimientoService, private _router: Router, private formularioService: FormularioService, public logInComponent: LogInComponent) {
    this.formularioService.verifyItemStatus();
    window.scrollTo(0, 0);
    if (isMobile.any())
      this.movil = true;
    else
      this.movil = false;
    var dat = { 'id': 0 };
    this.mantenimientoService.postUbigeo(dat).subscribe(
      (data: any) => {
        this.UbigeoList = data["data"];
        localStorage.setItem('ubigeo', JSON.stringify(data["data"]));
        this.filteredUbigeo.next(this.UbigeoList.slice());
        for (let a = 0; a < this.UbigeoList.length; a++) {
          if (this.UbigeoList[a].id === this.logInComponent.datosEntityModuleSend.id_distrito) {
            this.ubigeoCtrl.setValue(this.UbigeoList[a]);
            this.filteredUbigeo.next(this.UbigeoList.slice());
            this.ubigeoFilterCtrl.valueChanges
              .pipe(takeUntil(this._onDestroyUbigeo))
              .subscribe(() => {
                this.filterUbigeo();
              });
            break;
          }
        }
      }
    );
    this.ubigeoFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroyUbigeo))
      .subscribe(() => {
        this.filterUbigeo();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  protected setInitialValue() {
    this.filteredUbigeo
      .pipe(take(1), takeUntil(this._onDestroyUbigeo))
      .subscribe(() => {
        this.singleSelectUbigeo.compareWith = (a: any, b: any) => a && b && a.id === b.id;
      });
  }

  ngOnDestroy() {
    this._onDestroyUbigeo.next();
    this._onDestroyUbigeo.complete();
  }

  onReset() {
    this.logInComponent.onReset();
  }

  onBucarInformacion() {
    if (this.logInComponent.datosEntityModuleSend.ruc != undefined && this.logInComponent.datosEntityModuleSend.ruc != null && this.logInComponent.datosEntityModuleSend.ruc != '' && this.logInComponent.datosEntityModuleSend.ruc.length > 0) {
      this.logInComponent.NDocumento = this.logInComponent.datosEntityModuleSend.ruc;
      this.onDocumento();
    }
  }
 
  private filterUbigeo() {

    if (!this.UbigeoList) {
      return;
    }
    // get the search keyword
    let search = this.ubigeoFilterCtrl.value;
    if (!search) {
      this.filteredUbigeo.next(this.UbigeoList.slice());
      this.logInComponent.datosEntityModuleSend.id_distrito = this.ubigeoCtrl.value == null ? 0 : this.ubigeoCtrl.value.id;
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredUbigeo.next(
      this.UbigeoList.filter(bank => bank.nombre.toLowerCase().indexOf(search) > -1)
    );
  }
 
  async onDocumento(): Promise<any> {
    this.funciones.showLoading();
    this.formularioService.verifyItemStatus();
    var data = {
      'tipoQuery': false,
      'numeroDocumento': this.logInComponent.NDocumento,
      'tipo': this.logInComponent.opciones.tipo_persona
    };
    this.logInComponent.mantenimientoService.postFillDocumento(data).subscribe(
      data => {
        this.funciones.showLoading();
        var msn = data['mensaje'].split('|');
        if (data['statuscode'] == 200) {
          this.logInComponent.documento = 0;
          if (this.logInComponent.opciones.tipo_persona == 1) {
            this.logInComponent.opciones.tipo_transmite = 0;
          }
          this.funciones.mensajeOk(msn[1], msn[0]);
          this.funciones.hideLoading();
          var dataTemmp = data['data'];
          if (this.logInComponent.opciones.tipo_persona !== 2) {
            var entidad = dataTemmp.resp_datos_entidad;
            var entidad_uif = dataTemmp.resp_select_datos_entidad_uif;
            var bien = dataTemmp.resp_select_bien;
            var contribuyentes = dataTemmp.resp_select_contribuyentes;
            if (contribuyentes != null && contribuyentes.length > 0) {
              for (let index = 0; index < contribuyentes.length; index++) {
                if (contribuyentes[index].fecha_nacimiento != null && contribuyentes[index].fecha_nacimiento != '') {
                  contribuyentes[index].fecha_nacimiento = contribuyentes[index].fecha_nacimiento.substr(0, 10);
                }
              }
            } else { contribuyentes = []; }
            localStorage.setItem('windows', '0');

            if (entidad == undefined || entidad == null || entidad.length == 0) {
              entidad = new DatosEntityModule();
            } else {
              entidad.comercial = entidad.comercial == 0 ? 1 : 0;
              entidad.industrial = entidad.industrial == 0 ? 1 : 0;
              entidad.construccion = entidad.construccion == 0 ? 1 : 0;
              entidad.transporte = entidad.transporte == 0 ? 1 : 0;
              entidad.pesca = entidad.pesca == 0 ? 1 : 0;
              entidad.intermediacion_financiera = entidad.intermediacion_financiera == 0 ? 1 : 0;
              entidad.hoteles_restaurantes = entidad.hoteles_restaurantes == 0 ? 1 : 0;
              entidad.agricultura = entidad.agricultura == 0 ? 1 : 0;
              entidad.ensenanza = entidad.ensenanza == 0 ? 1 : 0;
              entidad.suministro_electricidad_gas = entidad.suministro_electricidad_gas == 0 ? 1 : 0;
              entidad.otro_opcion = entidad.otro_opcion == 0 ? 1 : 0;

              entidad_uif.of_giro_negocio = entidad_uif.of_giro_negocio == 0 ? 1 : 0;
              entidad_uif.of_prestamos_socios = entidad_uif.of_prestamos_socios == 0 ? 1 : 0;
              entidad_uif.of_venta_bien_inmueble = entidad_uif.of_venta_bien_inmueble == 0 ? 1 : 0;
              entidad_uif.of_intermediacion_financiera = entidad_uif.of_intermediacion_financiera == 0 ? 1 : 0;
              entidad_uif.of_prestamo_bancario = entidad_uif.of_prestamo_bancario == 0 ? 1 : 0;
              entidad_uif.of_prestamo_terceros = entidad_uif.of_prestamo_terceros == 0 ? 1 : 0;
              entidad_uif.of_venta_activos = entidad_uif.of_venta_activos == 0 ? 1 : 0;
              entidad_uif.of_otros_escribir_of = entidad_uif.of_otros_escribir_of == 0 ? 1 : 0;
              entidad_uif.of_otros_escribir_of_text = entidad_uif.of_otros_escribir_of_text == 0 ? 1 : 0;
              entidad_uif.mp_efectivo = entidad_uif.mp_efectivo == 0 ? 1 : 0;
              entidad_uif.mp_deposito_cuenta = entidad_uif.mp_deposito_cuenta == 0 ? 1 : 0;
              entidad_uif.mp_bien_inmueble = entidad_uif.mp_bien_inmueble == 0 ? 1 : 0;
              entidad_uif.mp_cheque = entidad_uif.mp_cheque == 0 ? 1 : 0;
              entidad_uif.mp_transferencia_bancaria = entidad_uif.mp_transferencia_bancaria == 0 ? 1 : 0;
              entidad_uif.mp_bien_mueble = entidad_uif.mp_bien_mueble == 0 ? 1 : 0;
              entidad_uif.mp_otros_describir = entidad_uif.mp_otros_describir == 0 ? 1 : 0;
            }

            if (bien == undefined || bien == null || bien.length == 0) {
              bien = new DatosBienModule();
            } else {
              bien.mp_compra_venta = bien.mp_compra_venta == 0 ? 1 : 0;
              bien.mp_donacion = bien.mp_donacion == 0 ? 1 : 0;
              bien.mp_anticipo_legitima = bien.mp_anticipo_legitima == 0 ? 1 : 0;
              bien.mp_permuta = bien.mp_permuta == 0 ? 1 : 0;
              bien.mp_dacion_pago = bien.mp_dacion_pago == 0 ? 1 : 0;
              bien.mp_otro = bien.mp_otro == 0 ? 1 : 0;
            }

            if (entidad_uif == undefined || entidad_uif == null || entidad_uif.length == 0) {
              entidad_uif = new DatosEntityUifModule();
            }

            this.logInComponent.datosBienModuleSend = bien;
            this.logInComponent.datosEntityModuleSend = entidad;
            this.logInComponent.datosEntityUifModuleSend = entidad_uif;
            this.logInComponent.contribuyenteModuleArr = contribuyentes;

            for (let a = 0; a < this.UbigeoList.length; a++) {
              if (this.UbigeoList[a].id === this.logInComponent.datosEntityModuleSend.id_distrito) {
                this.ubigeoCtrl.setValue(this.UbigeoList[a]);
                this.filteredUbigeo.next(this.UbigeoList.slice());
                this.ubigeoFilterCtrl.valueChanges
                  .pipe(takeUntil(this._onDestroyUbigeo))
                  .subscribe(() => {
                    this.filterUbigeo();
                  });
                break;
              }
            }

            localStorage.setItem('data_bien', JSON.stringify(bien));
            localStorage.setItem('datos_entidad', JSON.stringify(entidad));
            localStorage.setItem('datos_entidad_uif', JSON.stringify(entidad_uif));
            localStorage.setItem('data_contribuyentes', JSON.stringify(contribuyentes));
            localStorage.setItem('numero_servicio', null);
          }
        } else {
          this.funciones.hideLoading();
          this.funciones.mensajeError(msn[1], msn[0]);
        }
      },
      error => {
        this.funciones.hideLoading();
        this.funciones.mensajeError("", "No se encontraron datos");
      }
    )
  }


  next() {
    this.logInComponent.registroPosi = 12;
    //this._router.navigate(['/ucontribuyente']);
  }
}
