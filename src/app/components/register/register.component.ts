import { Component, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from '../../services/formulario.service';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { DatosApoderadoModule } from '../../models/datos-apoderado/datos-apoderado.module';
import { DatosBasicosModule } from '../../models/datos-basicos/datos-basicos.module';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { MatSelect } from '@angular/material';
import { LogInComponent } from '../log-in/log-in.component';
import { DatosBienModule } from '../../models/datos-bien/datos-bien.module';
import { DatosLaboralesModule } from '../../models/datos-laborales/datos-laborales.module';
import { DatosEntityUifModule } from '../../models/datos-entity-uif/datos-entity-uif.module';
import { DatosEntityModule } from '../../models/datos-entity/datos-entity.module';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements AfterViewInit, OnDestroy {

  public ubigeoCtrl: FormControl = new FormControl();
  public ubigeoFilterCtrl: FormControl = new FormControl();

  public formData: FormControl = new FormControl();
  myControl = new FormControl();
  UbigeoList: any;
  public filteredUbigeo: ReplaySubject<any> = new ReplaySubject<any>(1);
  @ViewChild('singleSelect', { static: true }) singleSelectUbigeo: MatSelect;
  private _onDestroyUbigeo = new Subject<void>();

  item: boolean = true;
  validateTitular: boolean = false;
  standalone: true;
  data_documento: any;
  data_paises: any;
  data_estadocivil: any;
  separacions: any = [{ 'id': 0, 'nombre': 'SI' }, { 'id': 1, 'nombre': 'NO' }];


  constructor(
    private _router: Router,
    private mantenimientoService: MantenimientoService,
    public logInComponent: LogInComponent,
    private formularioService: FormularioService) {
    window.scrollTo(0, 0);
    this.formularioService.verifyItemStatus();
    //if (parseInt(localStorage.getItem('tamite_opciones_tipo_opcion')) == 1) {
    if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_opcion == 1) {
      this.validateTitular = true;
    }
    this.mantenimientoService.getListTipoDocumento().subscribe(
      (data: any) => {
        this.data_documento = data['data'];
        this.mantenimientoService.getListPaises().subscribe(
          (data: any) => {
            this.data_paises = data['data'];
            this.mantenimientoService.getListEstadoCivil().subscribe(
              (data: any) => {
                this.data_estadocivil = data['data'];
                var dat = { 'id': 0 };
                if (localStorage.getItem('ubigeo') != undefined && localStorage.getItem('ubigeo') != null && localStorage.getItem('ubigeo') != '') {
                  this.UbigeoList = JSON.parse(localStorage.getItem('ubigeo'));
                  this.filteredUbigeo.next(this.UbigeoList.slice());
                  this.loadInitUbigeo();
                } else {
                  this.mantenimientoService.postUbigeo(dat).subscribe(
                    (data: any) => {
                      this.UbigeoList = data["data"];
                      localStorage.setItem('ubigeo', JSON.stringify(data["data"]));
                      this.filteredUbigeo.next(this.UbigeoList.slice());
                      this.loadInitUbigeo();
                    }
                  );
                }
              }
            );
          }
        );
      }
    );
  }

  loadInitUbigeo() {
    this.ubigeoFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroyUbigeo))
      .subscribe(() => {
        this.filterUbigeo();
      });
    for (let a = 0; a < this.UbigeoList.length; a++) {
      if (this.UbigeoList[a].id === this.logInComponent.datosBasicosModuleSend.id_ubigeo) {
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

  isTokenLogin(): boolean {
    var token = localStorage.getItem('token');
    if (token == undefined || token == null || token == '') return false;
    return true;
  }

  validaMostrarInformacionPersonalInput(): boolean {
    if (this.logInComponent.biDocumentoEncontrado && !this.isTokenLogin() && this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite === 2) return false;
    return true;
  }

  async onBucarInformacion() {
    this.logInComponent.biDocumentoEncontrado = false;
    if (this.logInComponent.datosBasicosModuleSend.num_documento != undefined && this.logInComponent.datosBasicosModuleSend.num_documento != null && this.logInComponent.datosBasicosModuleSend.num_documento != '' && this.logInComponent.datosBasicosModuleSend.num_documento.length > 0) {
      this.logInComponent.NDocumento = this.logInComponent.datosBasicosModuleSend.num_documento;
      this.logInComponent.funciones.showLoading();
      this.logInComponent.formularioService.verifyItemStatus();
      var data = {
        'tipoQuery': false,
        'numeroDocumento': this.logInComponent.NDocumento,
        'tipo': this.logInComponent.opciones.tipo_persona,
        'tipo_busqueda': 1
      };
      await this.logInComponent.mantenimientoService.postFillDocumento(data).subscribe(
        data => {
          this.logInComponent.funciones.showLoading();
          if (data['statuscode'] == 200) {
            this.logInComponent.funciones.hideLoading();
            var msn = data['mensaje'].split('|');
            this.logInComponent.funciones.mensajeConfirmar('Se encontró datos registrados previamente', '¿Desea cargar los datos?', () => {
              this.logInComponent.documento = 0;
              if (this.logInComponent.opciones.tipo_persona == 1) {
                this.logInComponent.opciones.tipo_transmite = 0;
              }
              
              this.logInComponent.funciones.mensajeOk(msn[1], msn[0]);
              this.logInComponent.funciones.hideLoading();
              var dataTemmp = data['data'];
              this.logInComponent.biDocumentoEncontrado = true;
              if (this.logInComponent.opciones.tipo_persona == 2) {
                var basicos = dataTemmp.resp_basicos;
                var apoderado = dataTemmp.resp_apoderado;
                var laborales = dataTemmp.resp_laborales;

                if (basicos == null) {
                  basicos = new DatosBasicosModule();
                } else {
                  if (basicos.fecha_nacimiento != null && basicos.fecha_nacimiento != '') {
                    basicos.fecha_nacimiento = basicos.fecha_nacimiento.substr(0, 10);
                  }
                  if (basicos.id_pais_nacionalidad == null) {
                    basicos.id_pais_nacionalidad = "";
                  }
                }
    
                this.logInComponent.datosBasicosModuleSend = basicos;
    
                for (let a = 0; a < this.UbigeoList.length; a++) {
                  if (this.UbigeoList[a].id === this.logInComponent.datosBasicosModuleSend.id_ubigeo) {
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

                this.logInComponent.datosBasicosModuleSend.fecha_nacimiento = this.logInComponent.formato_fecha(this.logInComponent.datosBasicosModuleSend.fecha_nacimiento);
                this.logInComponent.datosBasicosModuleSend.conyugue_fecha_nacimiento = this.logInComponent.formato_fecha(this.logInComponent.datosBasicosModuleSend.conyugue_fecha_nacimiento);
                if (apoderado == null ) {
                  apoderado = new DatosApoderadoModule();
                } else {
                  if (apoderado.fecha_nacimiento != null && apoderado.fecha_nacimiento != '') {
                    apoderado.fecha_nacimiento = this.logInComponent.formato_fecha(apoderado.fecha_nacimiento);
                  }
                  this.logInComponent.datosApoderadoModuleSend = apoderado;
                }
    
                if (laborales == null) {
                  laborales = new DatosLaboralesModule();
                } else {
                  laborales.mp_bien_inmueble = laborales.mp_bien_inmueble == 0 ? 1 : 0;
                  laborales.mp_bien_mueble = laborales.mp_bien_mueble == 0 ? 1 : 0;
                  laborales.mp_cheque = laborales.mp_cheque == 0 ? 1 : 0;
                  laborales.mp_deposito_cuenta = laborales.mp_deposito_cuenta == 0 ? 1 : 0;
                  laborales.mp_efectivo = laborales.mp_efectivo == 0 ? 1 : 0;
                  laborales.mp_otros_describir = laborales.mp_otros_describir == 0 ? 1 : 0;
                  laborales.mp_transferencia_bancaria = laborales.mp_transferencia_bancaria == 0 ? 1 : 0;
                  laborales.of_comercio = laborales.of_comercio == 0 ? 1 : 0;
                  laborales.of_donacion = laborales.of_donacion == 0 ? 1 : 0;
                  laborales.of_donacion_pago = laborales.of_donacion_pago == 0 ? 1 : 0;
                  laborales.of_haberes = laborales.of_haberes == 0 ? 1 : 0;
                  laborales.of_herencia = laborales.of_herencia == 0 ? 1 : 0;
                  laborales.of_otros_describir = laborales.of_otros_describir == 0 ? 1 : 0;
                  laborales.of_prestamos_bancario = laborales.of_prestamos_bancario == 0 ? 1 : 0;
                  laborales.of_prestamos_familiares = laborales.of_prestamos_familiares == 0 ? 1 : 0;
                  laborales.of_rentas = laborales.of_rentas == 0 ? 1 : 0;
                  laborales.of_venta_bien_inmieble = laborales.of_venta_bien_inmieble == 0 ? 1 : 0;
                  laborales.of_venta_vehiculo = laborales.of_venta_vehiculo == 0 ? 1 : 0;
                  this.logInComponent.datosLaboralesModuleSend = laborales;
                }
              } else {
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
                  this.logInComponent.contribuyenteModuleArr = contribuyentes;
                  if (this.logInComponent.contribuyenteModuleArr != undefined && this.logInComponent.contribuyenteModuleArr != null) {
                    for (let index = 0; index < this.logInComponent.contribuyenteModuleArr.length; index++) {
                      this.logInComponent.contribuyenteModuleArr[index].fecha_nacimiento = this.logInComponent.formato_fecha(this.logInComponent.contribuyenteModuleArr[index].fecha_nacimiento);
                    }
                  } else {
                    this.logInComponent.contribuyenteModuleArr = [];
                  }
                } else { contribuyentes = []; }
                if (entidad == null) {
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
                  this.logInComponent.datosEntityModuleSend = entidad;
                }
    
                if (bien == null) {
                  bien = new DatosBienModule();
                } else {
                  bien.mp_compra_venta = bien.mp_compra_venta == 0 ? 1 : 0;
                  bien.mp_donacion = bien.mp_donacion == 0 ? 1 : 0;
                  bien.mp_anticipo_legitima = bien.mp_anticipo_legitima == 0 ? 1 : 0;
                  bien.mp_permuta = bien.mp_permuta == 0 ? 1 : 0;
                  bien.mp_dacion_pago = bien.mp_dacion_pago == 0 ? 1 : 0;
                  bien.mp_otro = bien.mp_otro == 0 ? 1 : 0;
                  this.logInComponent.datosBienModuleSend = bien;
                }
    
                if (entidad_uif == null) {
                  entidad_uif = new DatosEntityUifModule();
                } else {
                  entidad_uif.of_giro_negocio = entidad_uif.of_giro_negocio == 0 ? 1 : 0;
                  entidad_uif.of_prestamos_socios = entidad_uif.of_prestamos_socios == 0 ? 1 : 0;
                  entidad_uif.of_venta_bien_inmueble = entidad_uif.of_venta_bien_inmueble == 0 ? 1 : 0;
                  entidad_uif.of_intermediacion_financiera = entidad_uif.of_intermediacion_financiera == 0 ? 1 : 0;
                  entidad_uif.of_prestamo_bancario = entidad_uif.of_prestamo_bancario == 0 ? 1 : 0;
                  entidad_uif.of_prestamo_terceros = entidad_uif.of_prestamo_terceros == 0 ? 1 : 0;
                  entidad_uif.of_venta_activos = entidad_uif.of_venta_activos == 0 ? 1 : 0;
                  entidad_uif.of_otros_escribir_of = entidad_uif.of_otros_escribir_of == 0 ? 1 : 0;
                  entidad_uif.mp_efectivo = entidad_uif.mp_efectivo == 0 ? 1 : 0;
                  entidad_uif.mp_deposito_cuenta = entidad_uif.mp_deposito_cuenta == 0 ? 1 : 0;
                  entidad_uif.mp_bien_inmueble = entidad_uif.mp_bien_inmueble == 0 ? 1 : 0;
                  entidad_uif.mp_cheque = entidad_uif.mp_cheque == 0 ? 1 : 0;
                  entidad_uif.mp_transferencia_bancaria = entidad_uif.mp_transferencia_bancaria == 0 ? 1 : 0;
                  entidad_uif.mp_bien_mueble = entidad_uif.mp_bien_mueble == 0 ? 1 : 0;
                  entidad_uif.mp_otros_describir = entidad_uif.mp_otros_describir == 0 ? 1 : 0;
                  this.logInComponent.datosEntityUifModuleSend = entidad_uif;
      
                }
                
                localStorage.setItem('data_bien', JSON.stringify(bien));
                localStorage.setItem('datos_entidad', JSON.stringify(entidad));
                localStorage.setItem('datos_entidad_uif', JSON.stringify(entidad_uif));
                localStorage.setItem('data_contribuyentes', JSON.stringify(contribuyentes));
                localStorage.setItem('numero_servicio', null);
              }
            });
          } else {
            this.logInComponent.funciones.hideLoading();
          }
        },
        error => {
          this.logInComponent.funciones.hideLoading();
        }
      )
    }
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

  onResetValidate() {
    if (this.logInComponent.datosBasicosModuleSend.id_estado_civil == 5)
      this.logInComponent.datosBasicosModuleSend.separa_patrimonio = 0;
  }

  private filterUbigeo() {

    if (!this.UbigeoList) {
      return;
    }
    // get the search keyword
    let search = this.ubigeoFilterCtrl.value;
    if (!search) {
      this.filteredUbigeo.next(this.UbigeoList.slice());
      this.logInComponent.datosBasicosModuleSend.id_ubigeo = this.ubigeoCtrl.value == null ? 0 : this.ubigeoCtrl.value.id;
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredUbigeo.next(
      this.UbigeoList.filter(bank => bank.nombre.toLowerCase().indexOf(search) > -1)
    );
  }

  onReset() {
    this.logInComponent.onReset();
  }

  datoslaborales() {
      this.logInComponent.datosBasicosModuleSend.id_ubigeo = this.ubigeoCtrl.value == null ? 0 : this.ubigeoCtrl.value.id;
      this.formularioService.verifyItemStatus();
    if (this.validaMostrarInformacionPersonalInput()) {
      this.logInComponent.registroPosi = 2;
    } else {
      this.logInComponent.registroPosi = 7;
    }
  }

  onExtranjero(value: boolean) {
    this.logInComponent.datosBasicosModuleSend.extranjero = value;
    if (value) {
      this.ubigeoCtrl.setValue({ id: 0 });
    }
  }

  valida1():boolean {
    return (
        this.logInComponent.datosBasicosModuleSend.apellidos != null &&
        this.logInComponent.datosBasicosModuleSend.nombres != null &&
        (this.logInComponent.datosBasicosModuleSend.id_ubigeo > 0 || this.logInComponent.datosBasicosModuleSend.extranjero) &&
        this.logInComponent.datosBasicosModuleSend.num_documento != null &&
        this.logInComponent.datosBasicosModuleSend.num_documento.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.nombres.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.apellidos.length > 0
    );
  }
  
  valida2():boolean {
    return (
        this.logInComponent.datosBasicosModuleSend.apellidos != null &&
        this.logInComponent.datosBasicosModuleSend.fecha_nacimiento != null &&
        this.logInComponent.datosBasicosModuleSend.domicilio != null &&
        this.logInComponent.datosBasicosModuleSend.correo_electronico != null &&
        this.logInComponent.datosBasicosModuleSend.nombres != null &&
        this.logInComponent.datosBasicosModuleSend.num_documento != null &&
        (this.logInComponent.datosBasicosModuleSend.id_ubigeo > 0 || this.logInComponent.datosBasicosModuleSend.extranjero) &&
        this.logInComponent.datosBasicosModuleSend.num_documento.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.fecha_nacimiento.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.domicilio.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.correo_electronico.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.nombres.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.apellidos.length > 0
    );
  }

  valida3():boolean {
    return (
        this.logInComponent.datosBasicosModuleSend.fecha_nacimiento != null &&
        this.logInComponent.datosBasicosModuleSend.id_estado_civil != null &&
        this.logInComponent.datosBasicosModuleSend.domicilio != null &&
        this.logInComponent.datosBasicosModuleSend.correo_electronico != null &&
        this.logInComponent.datosBasicosModuleSend.partida != null &&
        this.logInComponent.datosBasicosModuleSend.sede != null &&
        this.logInComponent.datosBasicosModuleSend.num_documento != null &&
        this.logInComponent.datosBasicosModuleSend.nombres != null &&
        (this.logInComponent.datosBasicosModuleSend.id_ubigeo > 0 || this.logInComponent.datosBasicosModuleSend.extranjero) &&
        this.logInComponent.datosBasicosModuleSend.apellidos != null &&
        this.logInComponent.datosBasicosModuleSend.id_estado_civil > 0 &&
        this.logInComponent.datosBasicosModuleSend.fecha_nacimiento.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.domicilio.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.correo_electronico.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.partida.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.sede.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.num_documento.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.nombres.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.apellidos.length > 0
    );
  }
  
  valida4():boolean {
    return (
        this.logInComponent.datosBasicosModuleSend.partida != null &&
        this.logInComponent.datosBasicosModuleSend.sede != null &&
        this.logInComponent.datosBasicosModuleSend.num_documento != null &&
        this.logInComponent.datosBasicosModuleSend.nombres != null &&
        this.logInComponent.datosBasicosModuleSend.apellidos != null &&
        (this.logInComponent.datosBasicosModuleSend.id_ubigeo > 0 || this.logInComponent.datosBasicosModuleSend.extranjero) &&
        this.logInComponent.datosBasicosModuleSend.partida.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.sede.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.num_documento.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.nombres.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.apellidos.length > 0
    );
  }
  
  valida5():boolean {
    return (
        this.logInComponent.datosBasicosModuleSend.fecha_nacimiento != null &&
        this.logInComponent.datosBasicosModuleSend.id_estado_civil > 0 &&
        this.logInComponent.datosBasicosModuleSend.domicilio != null &&
        this.logInComponent.datosBasicosModuleSend.correo_electronico != null &&
        this.logInComponent.datosBasicosModuleSend.num_documento != null &&
        (this.logInComponent.datosBasicosModuleSend.id_ubigeo > 0 || this.logInComponent.datosBasicosModuleSend.extranjero) &&
        this.logInComponent.datosBasicosModuleSend.nombres != null &&
        this.logInComponent.datosBasicosModuleSend.apellidos != null &&
        this.logInComponent.datosBasicosModuleSend.fecha_nacimiento.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.id_estado_civil > 0 &&
        this.logInComponent.datosBasicosModuleSend.domicilio.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.correo_electronico.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.num_documento.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.nombres.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.apellidos.length > 0
    );
  }
  
  valida6():boolean {
    return (
        this.logInComponent.datosBasicosModuleSend.fecha_nacimiento != null &&
        this.logInComponent.datosBasicosModuleSend.id_estado_civil > 0 &&
        this.logInComponent.datosBasicosModuleSend.domicilio != null &&
        this.logInComponent.datosBasicosModuleSend.num_documento != null &&
        this.logInComponent.datosBasicosModuleSend.nombres != null &&
        (this.logInComponent.datosBasicosModuleSend.id_ubigeo > 0 || this.logInComponent.datosBasicosModuleSend.extranjero) &&
        this.logInComponent.datosBasicosModuleSend.apellidos != null &&
        this.logInComponent.datosBasicosModuleSend.id_estado_civil > 0 &&
        this.logInComponent.datosBasicosModuleSend.num_documento.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.nombres.length > 0 &&
        this.logInComponent.datosBasicosModuleSend.apellidos.length > 0
    );
  }
}