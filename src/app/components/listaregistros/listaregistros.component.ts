import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { DatosBasicosModule } from '../../models/datos-basicos/datos-basicos.module';
import { FormularioService } from '../../services/formulario.service';
import { MatPaginatorIntl, MatSort, MatTableDataSource } from '@angular/material';
import { MatPaginator } from '@angular/material';
import { Funciones } from '../../funciones/funciones';
import { DatosApoderadoModule } from '../../models/datos-apoderado/datos-apoderado.module';
import { DatosLaboralesModule } from '../../models/datos-laborales/datos-laborales.module';
import { DatosBienModule } from '../../models/datos-bien/datos-bien.module';
import { DatosEntityModule } from '../../models/datos-entity/datos-entity.module';
import { DatosEntityUifModule } from '../../models/datos-entity-uif/datos-entity-uif.module';
import { LogInComponent } from '../log-in/log-in.component';
import pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import Swal from 'sweetalert2';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

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

export interface PeriodicElement {
  nombre: string;
  created_at: string;
  tipo: number;
  numero_servicio: number;
  id: number;
}

@Component({
  selector: 'app-listaregistros',
  templateUrl: './listaregistros.component.html',
  styleUrls: ['./listaregistros.component.css']
})

export class ListaregistrosComponent implements AfterViewInit {
  pageNumber: number = 10;
  pageSize: number = 10;
  resultsLength: number = 0;
  numero_servicio: number = 0;
  nombre: string = "";
  //dataSource: any;
  displayedColumns: any;
  displayedColumnsMovil: string[] = ['index', 'created_at'];
  datosBasicosModule: DatosBasicosModule = new DatosBasicosModule();
  movil: boolean = false;

  dataSource: MatTableDataSource<PeriodicElement>;
  @ViewChild(MatSort, { static: true }) set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private _router: Router,
    private mantenimientoService: MantenimientoService,
    public logInComponent: LogInComponent,
    private formularioService: FormularioService,
    public funciones: Funciones
  ) {
    localStorage.setItem('update', '0');
    
    this.dataSource = new MatTableDataSource<PeriodicElement>([]);
    this.dataSource.sort = this.matSort;
    this.dataSource.paginator = this.paginator;
    window.scrollTo(0, 0);
    //localStorage.setItem('windows', '-1');
    if (isMobile.any())
      this.movil = true;
    else
      this.movil = false;
    var token = localStorage.getItem('token');
    if (token == undefined || token == null || token == '') {
      this._router.navigate(['/login']);
    } else {
      this.onLoadData(this.pageNumber, this.pageSize, false);
      //this.formularioService.resetItem(2);
    }
    
    if (this.funciones.isAdministrador()) {
      this.displayedColumns = [
        'index',
        'created_at',
        'nombre',
        'tipo_opcion',
        'tipo_persona',
        'tipo_condicion',
        'tipo_tramite',
        'numero_servicio',
        'id',
        'estado'];
    } else {
      this.displayedColumns = [
        'index',
        'created_at',
        'nombre',
        'tipo_opcion',
        'tipo_persona',
        'tipo_condicion',
        'tipo_tramite',
        'numero_servicio',
        'id'];
    }
    var timeout;
    document.onmousemove = function () {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        localStorage.removeItem('token');
        localStorage.removeItem('tipo');
        location.reload();
        /*let timerInterval
        Swal.fire({
          title: 'Sesión expirada por inactividad',
          html: '',
          timer: 100000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
            localStorage.removeItem('token');
            localStorage.removeItem('tipo');
            timerInterval = setInterval(() => {
              const content = Swal.getContent();
              location.reload();
            }, 100000)
          },
          willClose: () => {
            location.reload();
            clearInterval(timerInterval)
          }
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.timer) {
            console.log('I was closed by the timer')
          }
        })*/
      }, 1000000);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onDelete(element: any) {
    this.funciones.mensajeConfirmar('¿Está seguro?', 'Que desea eliminar', () => {
      this.formularioService.postDelete(element).subscribe(
        (data: any) => {
          this.funciones.hideLoading();
          if (data['statuscode'] == 200) {
            this.funciones.mensajeOk("", data['mensaje']);
            this.onLoadData(this.pageNumber, this.pageSize, false);
          } else {
            this.funciones.mensajeOk("", data['mensaje']);
          }
        }
      ), error => {
        this.funciones.hideLoading();
      }
    });
  }

  onVS(valor: any): string {
    if (valor === undefined || valor === null)
      return '';
    return valor;
  }

  onGenerar(data: any, tipo) {
    this.funciones.showLoading();
    data.tipoQuery = tipo;
    data.tipo = data.tipo_persona;
    if (data.tipo == 2) {
      this.mantenimientoService.postRegistroNaturalPDF(data)
        .subscribe(
          (data: any) => {
            if (data['statuscode'] == 200) {
              var dataTemmp = data['data'];
              var opciones = dataTemmp[4];

              var basicos = dataTemmp[0];
              var apoderado = dataTemmp[1];
              var laborales = dataTemmp[2];
              var bien = dataTemmp[3];
              if (basicos == null || basicos.length == 0) {
                basicos = new DatosBasicosModule();
              }
              if (apoderado == null || apoderado.length == 0) {
                apoderado = new DatosApoderadoModule();
              }
              if (laborales == null || laborales.length == 0) {
                laborales = new DatosLaboralesModule();
              }
              if (bien == null || bien.length == 0) {
                bien = new DatosBienModule();
              }
              if (basicos.fecha_nacimiento != null && basicos.fecha_nacimiento != '') {
                basicos.fecha_nacimiento = basicos.fecha_nacimiento.substr(0, 10);
              }
              if (basicos.conyugue_fecha_nacimiento != null && basicos.conyugue_fecha_nacimiento != '') {
                basicos.conyugue_fecha_nacimiento = basicos.conyugue_fecha_nacimiento.substr(0, 10);
              }
              if (basicos.id_pais_nacionalidad == null) {
                basicos.id_pais_nacionalidad = "";
              }
              if (apoderado.fecha_nacimiento != null && apoderado.fecha_nacimiento != '') {
                apoderado.fecha_nacimiento = apoderado.fecha_nacimiento.substr(0, 10);
              }
              if (tipo == true) {
                const natural = this.getDocumentNatural(dataTemmp);
                pdfMake.createPdf(natural).download('datos_persona_natural.pdf');
                if (/*opciones.tipo_tramite == 1 || */opciones.tipo_tramite == 2) {
                  const bien = this.getDocumentBienes(dataTemmp);
                  pdfMake.createPdf(bien).download('datos_bien.pdf');
                }
                this.funciones.hideLoading();
                //pdfMake.createPdf(natural, 'Documento persona natural').open();
              } else {

                bien.mp_compra_venta = bien.mp_compra_venta == 0 ? 1 : 0;
                bien.mp_donacion = bien.mp_donacion == 0 ? 1 : 0;
                bien.mp_permuta = bien.mp_permuta == 0 ? 1 : 0;
                bien.mp_dacion_pago = bien.mp_dacion_pago == 0 ? 1 : 0;
                bien.mp_anticipo_legitima = bien.mp_anticipo_legitima == 0 ? 1 : 0;
                bien.mp_otro = bien.mp_otro == 0 ? 1 : 0;

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

                localStorage.setItem('update', '1');
                localStorage.setItem('data_bien', JSON.stringify(bien));
                localStorage.setItem('tramite_opciones', JSON.stringify(opciones));
                localStorage.setItem('datos_basicos', JSON.stringify(basicos));
                localStorage.setItem('datos_laborales', JSON.stringify(laborales));
                localStorage.setItem('datos_apoderado', JSON.stringify(apoderado));

                this.funciones.hideLoading();
                this._router.navigate(['/home']);
              }
            } else {
              this.funciones.hideLoading();
              this.funciones.mensajeError("", data['mensaje']);
            }
          },
          error => {
            this.funciones.hideLoading();
          }
        )
    } else {
      this.mantenimientoService.postRegistroJuridicaPDF(data)
        .subscribe(
          (data: any) => {
            if (data['statuscode'] == 200) {
              var dataTemmp = data['data'];
              var opciones = dataTemmp[2];

              var entidad = dataTemmp[0];
              var entidad_uif = dataTemmp[1];
              var bien = dataTemmp[3];
              var contribuyentes = dataTemmp[4];

              if (entidad == null || entidad.length == 0) {
                entidad = new DatosEntityModule();
              }
              if (entidad_uif == null || entidad_uif.length == 0) {
                entidad_uif = new DatosEntityUifModule();
              }
              if (bien == null || bien.length == 0) {
                bien = new DatosBienModule();
              }
              if (contribuyentes == null || contribuyentes.length == 0) {
                contribuyentes = new Array<DatosApoderadoModule>();
              }
              if (contribuyentes.length > 0) {
                for (let index = 0; index < contribuyentes.length; index++) {
                  if (contribuyentes[index].fecha_nacimiento != null && contribuyentes[index].fecha_nacimiento != '') {
                    contribuyentes[index].fecha_nacimiento = contribuyentes[index].fecha_nacimiento.substr(0, 10);
                  }
                }
              }

              if (tipo == true) {
                const juridica = this.getDocumentJuridica(dataTemmp);
                const bien = this.getDocumentBienes(dataTemmp);
                //pdfMake.createPdf(juridica, 'Documento persona natural').open();
                pdfMake.createPdf(juridica).download('persona_juridica.pdf');
                if (opciones.tipo_tramite == 2) {
                  const bien = this.getDocumentBienes(dataTemmp);
                  pdfMake.createPdf(bien).download('datos_bien.pdf');
                }
                this.funciones.hideLoading();
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

                bien.mp_compra_venta = bien.mp_compra_venta == 0 ? 1 : 0;
                bien.mp_donacion = bien.mp_donacion == 0 ? 1 : 0;
                bien.mp_anticipo_legitima = bien.mp_anticipo_legitima == 0 ? 1 : 0;
                bien.mp_permuta = bien.mp_permuta == 0 ? 1 : 0;
                bien.mp_dacion_pago = bien.mp_dacion_pago == 0 ? 1 : 0;
                bien.mp_otro = bien.mp_otro == 0 ? 1 : 0;

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

                localStorage.setItem('update', '2');
                localStorage.setItem('data_bien', JSON.stringify(bien));
                localStorage.setItem('tramite_opciones', JSON.stringify(opciones));
                localStorage.setItem('datos_entidad', JSON.stringify(entidad));
                localStorage.setItem('datos_entidad_uif', JSON.stringify(entidad_uif));
                localStorage.setItem('data_contribuyentes', JSON.stringify(contribuyentes));
                this.funciones.hideLoading();
                this._router.navigate(['/home']);
              }
            } else {
              this.funciones.mensajeError("", data['mensaje']);
            }
          },
          error => {
            this.funciones.hideLoading();
          }
        )
    }
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe((props: MatPaginator) => {
      //const page = props.pageIndex + 1;
      this.pageNumber = this.paginator.pageSize;
      this.pageSize = ((this.paginator.pageIndex * 10) + 10);
      //this.dataSource.paginator = this.paginator;
      this.funciones.showLoading();
      var data = {
        numero_servicio: this.numero_servicio,
        nombre: this.nombre,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize
      }
      this.onLoadData(this.pageNumber, this.pageSize, false);
    });
  }

  onLoadData(pageNumber: number, pageSize: number, tipo: boolean) {
    this.funciones.showLoading();
    var data = {
      numero_servicio: this.numero_servicio,
      nombre: this.nombre,
      pageNumber: pageNumber,
      pageSize: pageSize
    }
    this.mantenimientoService.postListRegistros(data).subscribe((data: any) => {
      this.funciones.hideLoading();
      console.log("222222222222222");
      if (data['statuscode'] == 200) {
        this.dataSource = new MatTableDataSource<PeriodicElement>(data['data']);
        if (tipo)
          this.dataSource.paginator = this.paginator;
        this.resultsLength = data['count'];
      } else {
        this.funciones.mensajeError("", data['mensaje']);
      }
    },
    error => {
      this.funciones.hideLoading();
    }); 
  }

  getDocumentBienes(data: any) {
    var sizeText = 8;
    var bien = data[3];
    var opciones = data[4];
    if (opciones.tipo_condicion == undefined || opciones.tipo_condicion == null)
      opciones = data[2];
    var marca = 'X';
    return {
      content: [
        {
          table: {
            widths: [150, 346.5],
            body: [
              [{
                border: [true, true, false, true],
                image: "data:image/png;base64,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" +
                  "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" +
                  "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",
                width: 150
              }, {
                border: [false, true, true, true],
                text: '\nSOLICITUD DE TRANSFERENCIA DE BIENES MUEBLES REGISTRALES',
                bold: true,
                color: '#FFFFFF',
                fontSize: 11,
                alignment: 'center',
              }],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                { border: [true, false, true, false], text: 'Por el presente documento, declaro bajo juramento, lo siguiente:', fontSize: 11 },
              ],
            ]
          }
        },
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  border: [true, true, true, true], text: 'DATOS DEL BIEN', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11
                },
              ],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        {
          table: {
            widths: [20, 476.5],
            body: [
              [{ border: [true, false, true, false], text: 'a)', fontSize: sizeText }, { border: [true, false, true, false], text: ('Transferente ( ' + (opciones.tipo_condicion == 1 ? marca : '') + ' )   \t\t\t\t\t\t\t\t\t\t   Adquiriente ( ' + (opciones.tipo_condicion == 2 ? marca : '') + ' )'), fontSize: sizeText }],
              [{ text: 'b)', fontSize: sizeText }, {
                text: ('Tipo de Transferencia:   Compra-venta ( ' + (bien.mp_compra_venta == 0 ? marca : '') + ' ), Donación ( ' + (bien.mp_donacion == 0 ? marca : '') + ' ), Anticipo de legítima ( ' + (bien.mp_anticipo_legitima == 0 ? marca : '') + ' ), Dación en Pago ( ' + (bien.mp_dacion_pago == 0 ? marca : '') + ' ), Permuta ( ' + (bien.mp_permuta == 0 ? marca : '') + ' ), \nOtro ( ' + ((bien.mp_otro == 0 ? marca : '') + ' ) ' + (bien.mp_otro == 0 ? bien.mp_otros_describir : ''))), fontSize: sizeText
              }],
              [{ text: 'c)', fontSize: sizeText }, { text: ('Tipo Bien: Vehículo ( ' + (bien.tipo_bien == 0 ? marca : '') + ' ), Arma de Fuego ( ' + (bien.tipo_bien == 1 ? marca : '') + ' ) '), fontSize: sizeText }],
              [{ text: 'd)', fontSize: sizeText }, { text: ('Vehiculo N° Placa: \t\t' + bien.num_placa), fontSize: sizeText }],
              [{ border: [true, true, true, false], text: 'e)', fontSize: sizeText }, { border: [true, true, true, false], text: ('Arma de Fuego N° de Licencia: \t\t' + bien.numero_tarjeta_propiedad), fontSize: sizeText }],
              [{ border: [true, true, true, false], text: 'f)', fontSize: sizeText }, { border: [true, true, true, false], text: ((bien.tipo_bien == 0 ? '¿Cuenta con tarjeta de propiedad?: SI (  )  NO (  )' : '¿Cuenta con tarjeta de propiedad?: \t\t SI ( ' + (bien.targeta_propiedad == 0 ? marca : '') + ' ) NO ( ' + (bien.targeta_propiedad == 1 ? marca : '') + ' )  ')), fontSize: sizeText }],
            ]
          }
        },
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  text: 'DATOS DE LA TRASACCIÓN', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11
                },
              ],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        {
          table: {
            widths: [20, 476.5],
            body: [
              [{ border: [true, false, true, false], text: 'a)', fontSize: sizeText }, { border: [true, false, true, false], text: ('Moneda: \t\t' + bien.moneda), fontSize: sizeText }],
              [{ text: 'b)', fontSize: sizeText }, { text: ('Precio o Valor de la Transacción: \t\t' + bien.valor), fontSize: sizeText }],
            ]
          }
        },
        {
          table: {
            widths: [500],
            body: [
              [{ border: [false, false, false, false], text: '\n\n', bold: true, fontSize: sizeText }],
              [{ border: [false, false, false, false], text: '* Confirmo los datos antes consignados.', bold: true, fontSize: sizeText }],
              [{ border: [false, false, false, false], text: '* Advertencia: Este documento no es un acta de transferencia Vehicular.', bold: true, fontSize: sizeText }],
            ]
          }
        },
        {
          table: {
            widths: [200],
            body: [
              [{ border: [false, false, false, false], text: '\n\n\n\n\n\n\n\n\n\n\n\n\n', bold: true, fontSize: sizeText }],
              [{ border: [false, false, false, false], text: '________________________________', bold: true, alignment: 'center', fontSize: sizeText }],
              [{ border: [false, false, false, false], text: (opciones.tipo_condicion == 1 ? 'TRANSFERENTE' : 'ADQUIRIENTE'), bold: true, alignment: 'center', fontSize: sizeText }],
            ]
          }
        },
      ],
      styles: {
        name: {
          fontSize: 16,
          bold: true
        }
      }
    };
  }

  getDocumentNatural(data: any) {
    var espacio = "\t\t";
    var sizeText = 8;
    var basicos = data[0];
    var apoderado = data[1];
    var laborales = data[2];
    var bien = data[3];
    var opciones = data[4];
    var btd = basicos.id_tipo_documento;
    var ec = basicos.id_estado_civil;
    var sp = basicos.separa_patrimonio;
    var marca = 'X';
    return {
      content: [
        {
          table: {
            widths: [150, 346.5],
            body: [
              [{
                border: [true, true, false, true],
                image: "data:image/png;base64,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" +
                  "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" +
                  "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",
                width: 150
              }, {
                border: [false, true, true, true],
                text: '\nDECLARACIÓN JURADA DE CONOCIMIENTO DEL CLIENTE',
                bold: true,
                color: '#FFFFFF',
                fontSize: 11,
                alignment: 'center',
              }],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                { border: [true, false, true, false], text: 'Por el presente documento, declaro bajo juramento, lo siguiente:', fontSize: 11 },
              ],
            ]
          }
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  border: [true, true, true, true], text: 'PERSONA NATURAL QUE ACTUA POR DERECHO PROPIO O DATOS DE SU REPRESENTADO', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11
                },
              ],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        {
          table: {
            widths: [20, 347.5, 120],
            body: [
              [{ border: [true, false, true, false], text: 'a)', fontSize: sizeText }, { colSpan: 2, border: [true, false, true, false], text: ('Nombres y Apellidos: ' + espacio + '' + basicos.nombres + ' ' + basicos.apellidos), fontSize: sizeText }, ''],
              [{ text: 'b)', fontSize: sizeText }, { text: ('Doc. Identidad:' + espacio + ' DNI ( ' + (btd == '1' ? marca : '') + ' ), Pasaporte ( ' + (btd == '2' ? marca : '') + ' ), Carné de Extranjería ( ' + (btd == '3' ? marca : '') + ' ), PTP ( ' + (btd == '5' ? marca : '') + ' ), CCP ( ' + (btd == '6' ? marca : '') + ' ), Otros ( ' + (btd == '4' ? marca : '') + ' )'), fontSize: sizeText }, { text: 'Nro.: ' + espacio + '' + basicos.num_documento, fontSize: sizeText }],
              [{ text: 'c)', fontSize: sizeText }, { colSpan: 2, text: ('Lugar de nacimiento: \t\t\t\t\t\t Ciudad:' + espacio + '' + basicos.cuidad_origen + ' \t\t\t\t\t\t Pais: ' + espacio + '' + (basicos.id_pais_nacionalidad == undefined ? '' : basicos.id_pais_nacionalidad)), fontSize: sizeText }, ''],
              [{ text: 'd)', fontSize: sizeText }, { colSpan: 2, text: ('Nacionalidad: \t\t' + espacio + '' + basicos.pais_origen + '\t\t\t' + 'Extranjero:  SI ( ' + (basicos.extranjero == true ? marca : '') + ' )   NO ( ' + (basicos.extranjero == false ? marca : '') + ' )' + '\t\t\t\t\t\t\t\tFecha de Nacimiento: ' + espacio + '' + this.onVS(basicos.fecha_nacimiento)), fontSize: sizeText }, ''],
              [{ rowSpan: 3, text: 'e)', fontSize: sizeText }, { border: [true, false, true, false], colSpan: 2, text: ('Estado civil: ' + espacio + 'Soltero ( ' + (ec == '1' ? marca : '') + ' ), Casado ( ' + (ec == '2' ? marca : '') + ' ), Viudo ( ' + (ec == '3' ? marca : '') + ' ), Divorciado ( ' + (ec == '4' ? marca : '') + ' ), Unión de hecho ( ' + (ec == '5' ? marca : '') + ' )'), fontSize: sizeText }, ''],
              ['', { colSpan: 2, border: [true, false, true, false], text: ((ec == 2 || ec == 5 ? 'Separación de Patrimonio:' + espacio + ' SI ( ' + (sp == '0' ? marca : '') + ' )   NO ( ' + (sp == '1' ? marca : '') + ' )' : 'Separación de Patrimonio: ' + espacio + ' SI (  )   NO (  )') + '   \t\t\tPartida N°: ' + espacio + '' + basicos.partida + ' \t\t\t Sede: ' + espacio + '' + basicos.sede), fontSize: sizeText }, ''],
              ['', { colSpan: 2, border: [true, false, true, true], text: ('Nombre del cónyuge o conviviente: ' + espacio + ' ' + this.onVS(basicos.nombre_conyugue) + '\t\t DNI O C.E. N°: ' + this.onVS(basicos.nombre_conyugue_documento) + '\n Fecha de Nacimiento: ' + this.onVS(basicos.conyugue_fecha_nacimiento)), fontSize: sizeText }, ''],
              [{ text: 'f)', fontSize: sizeText }, { colSpan: 2, text: ('Domicilio declarado (lugar de residencia):' + espacio + basicos.domicilio + '\t\Distrito: ' + (basicos.id_ubigeo)), fontSize: sizeText }, ''],
              [{ text: 'g)', fontSize: sizeText }, { colSpan: 2, text: ('Télefono Fijo :  \t\t\t' + basicos.telefono_uno + '' + espacio + '\t\t\t\t\t  Celular: \t\t\t' + basicos.telefono_dos), fontSize: sizeText }, ''],
              [{ text: 'h)', fontSize: sizeText }, { colSpan: 2, text: ('Correo electrónico: ' + espacio + '' + basicos.correo_electronico), fontSize: sizeText }, ''],
              [{ rowSpan: 2, text: 'i)', fontSize: sizeText }, { colSpan: 2, text: ('Profesión u ocupación: ' + espacio + '' + laborales.profesion), fontSize: sizeText }, ''],
              ['', { colSpan: 2, text: ('Centro de Trabajo: ' + espacio + '' + laborales.centro_trabajo), fontSize: sizeText }, ''],
            ]
          }
        },
        {
          table: {
            widths: [20, 400, 67.5],
            body: [
              [{ border: [true, false, true, true], rowSpan: 3, text: 'j)', fontSize: sizeText }, { border: [true, false, true, true], text: 'Desempeña o ha desempeñado un cargo o función pública en el Perú o en el extranjero en los ultimos cinco años', fontSize: sizeText }, { border: [true, false, true, true], text: ' SI ( ' + (laborales.funcion_publica == '0' ? marca : '') + ' )   NO ( ' + (laborales.funcion_publica == '1' ? marca : '') + ' )', fontSize: sizeText }],
              ['', { colSpan: 2, border: [true, true, true, false], text: 'En caso marco SI, indicar cargo desempeñado: ' + espacio + '' + laborales.cargo_publico, fontSize: sizeText }, ''],
              ['', { colSpan: 2, border: [true, false, true, true], text: 'Adocionalmente debe llenar formato “DDJJ PEP”.   ', fontSize: sizeText }, '']
            ]
          }
        },
        {
          table: {
            widths: [20, 400, 67.5],
            body: [
              [
                { text: 'k)', border: [true, false, false, false], fontSize: sizeText },
                { border: [true, false, true, true], text: 'Algún familiar o de su cónyuge hasta el 2do. grado de consanguinidad (Padres, abuelos, hermanos, hijos, nietos) desempeñado un cargo o función púbica en le Perú o en los últimos 5 años', fontSize: sizeText },
                { border: [true, false, true, true], text: ' SI ( ' + (laborales.familiar_cargo == '0' ? marca : '') + ' )   NO ( ' + (laborales.familiar_cargo == '1' ? marca : '') + ' )', fontSize: sizeText },
              ],
            ]
          }
        },
        {
          style: 'tableExample',
          table: {
            widths: [20, 160, 160, 138.5],
            body: [
              [
                { rowSpan: 2, text: '', border: [true, false, false, true], fontSize: sizeText },
                { rowSpan: 2, text: 'En caso marcó SI, Indique el nombre de dicho familiar, así como el cargo que desempeña o ha desempeñado.', border: [true, false, false, true], fontSize: sizeText },
                { colSpan: 2, text: 'Nombre y Apellidos: ' + espacio + '' + laborales.familiar_nombres + '\n\n', border: [true, false, true, true], fontSize: sizeText },
                ''
              ],
              [
                '',
                '',
                { text: 'Cargo: ' + espacio + '' + laborales.familiar_car, border: [true, true, false, true], fontSize: sizeText },
                { text: 'País: ' + espacio + '' + (laborales.id_familiar_pais == undefined ? '' : laborales.id_familiar_pais), border: [true, true, true, true], fontSize: sizeText },
              ]
            ]
          }
        },
        {
          table: {
            widths: [20, 400, 67.5],
            body: [
              [
                { rowSpan: 2, text: 'l)', border: [true, false, true, true], fontSize: sizeText },
                { border: [true, false, true, true], text: '¿Es sujeto obligado informar a la UIF-Perú?', fontSize: sizeText },
                { border: [true, false, true, true], text: ' SI ( ' + (laborales.informar_uif == '0' ? marca : '') + ' )   NO ( ' + (laborales.informar_uif == '1' ? marca : '') + ' )', fontSize: sizeText },
              ],
              [
                '',
                { text: 'En caso marcó SI, indique si designó a su Oficial de Cumplimiento:' + espacio + '', fontSize: sizeText },
                { text: ' SI ( ' + (laborales.oficial_cumplimiento == '0' ? marca : '') + ' )   NO ( ' + (laborales.oficial_cumplimiento == '1' ? marca : '') + ' )', fontSize: sizeText },
              ],
            ]
          }
        },
        {
          table: {
            widths: [20, 476.5],
            body: [
              [
                { text: 'm)', border: [true, false, false, true], fontSize: sizeText },
                {
                  text: 'El origen de los fondos, bienes u otros activos involucrados en dicha transacción (especifique)\n\t - Haberes: ( ' + (laborales.of_haberes == 0 ? marca : '') + ' ), Préstamo bancario: ( ' + (laborales.of_prestamos_bancario == 0 ? marca : '') + ' ), Préstamo Familiar: ( ' + (laborales.of_prestamos_familiares == 0 ? marca : '') + ' ), Herencia: ( ' + (laborales.of_herencia == 0 ? marca : '') + ' ), Venta de Bien Inmueble: ( ' + (laborales.of_venta_bien_inmieble == 0 ? marca : '') + ' ), \n' +
                    ' - Venta vehículo: ( ' + (laborales.of_venta_vehiculo == 0 ? marca : '') + ' ), Rentas: ( ' + (laborales.of_rentas == 0 ? marca : '') + ' ), Comercio: ( ' + (laborales.of_comercio == 0 ? marca : '') + ' ), Donación: ( ' + (laborales.of_donacion == 0 ? marca : '') + ' ), Dación en Pago: ( ' + (laborales.of_donacion_pago == 0 ? marca : '') + ' ), \n' +
                    ' - Otros ( ' + (laborales.of_otros_describir == 0 ? marca : '') + ' ): ' + (laborales.of_otros_describir == 0 ? laborales.of_otros_describir_text : '____________________'), border: [true, false, true, true], fontSize: sizeText
                },
              ],
              [
                { text: 'n)', border: [true, false, false, false], fontSize: sizeText },
                { text: 'Medio de pago utilizado: Efectivo ( ' + (laborales.mp_efectivo == 0 ? marca : '') + ' ), Cheque ( ' + (laborales.mp_cheque == 0 ? marca : '') + ' ), Deposito en Cuenta ( ' + (laborales.mp_deposito_cuenta == 0 ? marca : '') + ' ), Transferencia Bancaria ( ' + (laborales.mp_transferencia_bancaria == 0 ? marca : '') + ' ),\n Bien Inmueble ( ' + (laborales.mp_bien_inmueble == 0 ? marca : '') + ' ), Bien Mueble ( ' + (laborales.mp_bien_mueble == 0 ? marca : '') + ' ), Otro ( ' + (laborales.mp_otros_describir == 0 ? marca : '') + ' )' + (laborales.mp_otros_describir == 0 ? laborales.mp_otros_describir_text : '____________________'), border: [true, false, true, false], fontSize: sizeText },
              ],
            ]
          }
        },
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  border: [true, true, true, true], text: 'APODERADO - REPRESENTANTE (DE SER EL CASO)', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11
                },
              ],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        ((apoderado.id_tipo_documento != undefined && apoderado.id_tipo_documento != null) ? (
          {
            table: {
              widths: [20, 200, 148.5, 110],
              body: [
                [{ border: [true, false, true, false], text: 'a)', fontSize: sizeText }, { colSpan: 3, border: [true, false, true, false], text: ('Nombres y Apellidos: ' + espacio + '' + this.onVS(apoderado.nombres) + ' ' + this.onVS(apoderado.apellidos)), fontSize: sizeText }, '', ''],
                [{ text: 'b)', fontSize: sizeText }, { colSpan: 2, text: ('Doc. Identidad: DNI ( ' + (apoderado.id_tipo_documento == '1' ? marca : '') + ' ), Carné de Extranjería ( ' + (apoderado.id_tipo_documento == '2' ? marca : '') + ' ), Pasaporte ( ' + (apoderado.id_tipo_documento == '3' ? marca : '') + ' ), PTP ( ' + (apoderado.id_tipo_documento == '5' ? marca : '') + ' ), Otros ( ' + (apoderado.id_tipo_documento == '4' ? marca : '') + ' )'), fontSize: sizeText }, '', { text: 'Nro.: ' + apoderado.num_documento, fontSize: sizeText }],
                [{ text: 'c)', fontSize: sizeText }, { colSpan: 3, text: ('Domicilio: ' + espacio + '' + this.onVS(apoderado.domicilio) + espacio + espacio + 'Distrito: ' + espacio + '' + this.onVS(apoderado.ubigeo)), fontSize: sizeText }, '', ''],
                [{ text: 'd)', fontSize: sizeText }, { text: ('Nacionalidad: ' + espacio + '' + this.onVS(apoderado.nacionalidad)), fontSize: sizeText }, { colSpan: 2, text: ('Fecha de Nacimiento: ' + espacio + '' + this.onVS(apoderado.fecha_nacimiento)), fontSize: sizeText }, ''],
                [{ text: 'e)', fontSize: sizeText }, { text: ('Estado Civil: ' + espacio + '' + (apoderado.id_estado_civil == undefined ? '' : apoderado.id_estado_civil)), fontSize: sizeText }, { colSpan: 2, text: ('Profesión u ocupación: ' + espacio + '' + apoderado.profesion), fontSize: sizeText }, ''],
                //[{ text: 'g)', fontSize: sizeText }, { colSpan: 3, text: ('Nombre del Cónyuge: ' + apoderado.conyugue_nombres), fontSize: sizeText }, '', ''],
                [{ text: 'g)', fontSize: sizeText }, { colSpan: 3, text: ('Registro del Poder: ' + espacio + '' + this.onVS(apoderado.registro_poder) + espacio + espacio + espacio + ' Sede Registral: ' + espacio + '' + this.onVS(apoderado.sede_registral)), fontSize: sizeText }, '', ''],
                [{ text: 'h)', fontSize: sizeText }, { colSpan: 3, text: ('Correo electrónico: ' + espacio + '' + this.onVS(apoderado.correo) + espacio + espacio + espacio + 'Celular: ' + espacio + '' + this.onVS(apoderado.celular)), fontSize: sizeText }, '', '']
              ]
            }
          }
        ) : (
          {
            table: {
              widths: [20, 200, 148.5, 110],
              body: [
                [{ border: [true, false, true, false], text: 'a)', fontSize: sizeText }, { colSpan: 3, border: [true, false, true, false], text: ('Nombres y Apellidos: '), fontSize: sizeText }, '', ''],
                [{ text: 'b)', fontSize: sizeText }, { colSpan: 2, text: ('Doc. Identidad: DNI (  ), Carné de Extranjería (  ), Pasaporte (  ), Otros (  )'), fontSize: sizeText }, '', { text: 'Nro.: ', fontSize: sizeText }],
                [{ text: 'c)', fontSize: sizeText }, { colSpan: 3, text: ('Domicilio: '), fontSize: sizeText }, '', ''],
                [{ text: 'd)', fontSize: sizeText }, { text: ('Nacionalidad: '), fontSize: sizeText }, { colSpan: 2, text: ('Fecha de Nacimiento: '), fontSize: sizeText }, ''],
                [{ text: 'e)', fontSize: sizeText }, { text: ('Estado Civil: '), fontSize: sizeText }, { colSpan: 2, text: ('Profesión u ocupación: '), fontSize: sizeText }, ''],
                //[{ text: 'g)', fontSize: sizeText }, { colSpan: 3, text: ('Nombre del Cónyuge: '), fontSize: sizeText }, '', ''],
                [{ text: 'g)', fontSize: sizeText }, { colSpan: 3, text: ('Registro del Poder: '), fontSize: sizeText }, '', ''],
                [{ text: 'h)', fontSize: sizeText }, { colSpan: 3, text: ('Correo electrónico: '), fontSize: sizeText }, '', '']
              ]
            }
          }
        )
        ),
        {
          table: {
            body: [
              [
                { text: 'Afirmo que conozco a mi representante, indicando que este es el beneficiario final de la operación realizada ratifico todo lo manifestado en la presente declaración jurada, en señal de lo cual la firmo, en la fecha que se indica.', border: [true, false, true, true], fontSize: sizeText },
              ],
            ]
          }
        },
        {
          table: {
            widths: [20, 250, 78.5, 130],
            heights: 50,
            body: [
              [{ colSpan: 2, border: [true, false, true, true], text: '' },
                '',
              { border: [true, false, true, true], text: '' },
              { border: [true, false, true, true], alignment: 'center', text: '\n\n' }]
            ]
          }
        },
        {
          table: {
            widths: [20, 250, 78.5, 130],
            body: [
              [
                { colSpan: 2, border: [true, false, true, true], alignment: 'center', text: 'FIRMA DEL CLIENTE / REPRESENTANTE', fontSize: sizeText },
                '',
                { alignment: 'center', border: [true, false, true, true], text: ('HUELLA DACTILAR'), fontSize: sizeText },
                { alignment: 'center', border: [true, false, true, true], text: 'FECHA (dd/mm/aaaa)', fontSize: sizeText }
              ],
            ]
          }
        },
      ],
      styles: {
        name: {
          fontSize: 16,
          bold: true
        }
      }
    };
  }

  getDocumentJuridica(data: any) {
    var espacio = "\t";
    var sizeText = 8;
    var entidad = data[0];
    var entidad_uif = data[1];
    var opciones = data[2];
    var bien = data[3];
    var contribuyentes = data[4];
    var marca = 'X';
    var cant_contribuyentes = contribuyentes.length;
    return {
      content: [
        {
          table: {
            widths: [150, 346.5],
            body: [
              [{
                border: [true, true, false, true],
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWkAAABrCAYAAAC1xHPxAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAhdEVYdENyZWF0aW9uIFRpbWUAMjAyMDowODoxMiAxOTo0NzowMbwFHbcAAFW9SURBVHhe7X0HgB1V2fZz+717t7f0QhJClabo94Eo+omKqD98gIggoiKIgHwUAeldKUqRJtJBIKQAgUDoHSkhhBISIAnpvW3fW8//Pmfm7M5O7r17N7ubxjy7750zZ06fOc+8886Zc3xKgC8RsvbWb297gt7E9eDBg4eNgcc3NninIgl3ypfq3uXBg4ctFF8aTdpowW747G1GhG4KG0S7pWkyIkG/dy/z4MHD5sGXgn3cdyHuG79MNousEHFLc4smZt0gsq9J2udDQMSDBw8eNhe+FCStCdcWJ7TGLCScVRlUlMbxzNRnMOPDDzQxq2zaCkS35fLgwYOHTY4vzXO8k6Q7yVrB78si5Pejac1KTLznTtx/881YsWgR/P5gh7pNU4lH1B48eNgc+BIbW2nSEPrNJMXtx7hbbsXsl1/BKxMexQsTn7CCZCyzBwla27SNw2NsDx48bCJ8qUi6K7eKFq3S8AXCWPT2a3jhnnswLOtDdXsGT933MGa/8i4Q9GmbtZK/rBJ25jtWLXYSHjx48NDP+FKQNDmVorVhG7ri9Gxrxr8uvRzRJcvx37WDsHv9UHz0/ju45YYbkGxshd/v1y8WLZ3aQPazHlN78OCh/7FtkLRhYbc4nIag6e6wT/vDeOfeB7B02gzsEKtA2epGVLSmMCRagXffeBUP3n2nHdbEcIsHDx489C+2bU3aJmonOCyc459FPUZyzWrcdvGVGN6qMCpUgtJkEjXZDIaFo1i+chHuuecOLJ2/AGEOwzNsb7O870tlKPLgwcPmwrZFNYZE84DcnE5nkG5LAIkU7jv7fNQ0JTDSX4JQSzvC2SwGx2IYG41jLGKY8/HHOPtPZ+q4PpqkbXVcm6VpArHFgwcPHvoLXyp9kApxNBREMJvGirfewYsPTcDY0nrUBiNAUshbNOl0axNi6QQGhsMIprN4/bXXcN+/7oJEg+x68ODBwybFtvFZeCHtWVsqrD9akf3ym13fiF/vtCeGtKawc6QMofXrEQn50J5OISnHk6VxfJJuwWuNK7FQ4gwaNRbvz/4UwuH6thYWTpeWkx8L/CDGgwcPHvoD24YmnY8jHf6aoFUGqVVL8cT1f4dauRhjyyq1iSMlmnVLWzv8Pj/CwQBKRKpFk66RWINCYaxZvgRHHXkkIjFoccIjaA8ePPQnth1zB7nSLfaG2rM/K65EEtklS3DLVVfjm0O3R6ihBaq5GaGAH8FQQLTurBC5SCKBSl8AQ4TEfdkMysNBvPHqS3j2qeeQSmSQSWW0Ip1JpqCE5DWoWDvFgwcPHvoA2wRJkyZziTbkaIeI34e2VWvw1/87DaPSaVSlM4ikkgiIFs1G0BqxhPNLeL+QcIls64MhVGQyQLIdzY3rcPbZZyAUCSAokk6l4A8E4eMMeZuYlOfNm4d//vOf+OEPf6jLbaS6ulr7XX311TpMMWC4P/zhDzquM60xY8bg5z//uXYzvUJ4/fXXdRp77713lzRMec4777yOtBi2OxSbr4Ezz0LibJ81a9bYsbsHw+dKrxgx+bjPVXfCtmSbPvXUUzp+LuSK5xZ3e+cKY6Q79OS8MF93+vmE1xrb5+GHH7Zjd6I/2i0f+rJf9Slok97akbEl7ZJsNisHeESp9oYm9czNN6tDpMr/HDxUPVg+SE2MDFATwvUideoRkXEiE2V/vPg/UD1cXVM/RP1Ywo8O+NWQshIVFfepfzhJpZIplUokVdZOW0k2G0g/YPXq1erEE0/kLUHLEUccoV577bWOY1OmTFE/+MEPOo4zLP3zYcaMGaqqqqpLWMpVV13VkQaF+7nA+M78mNZDDz2kjzEduk36Rkx582Hu3LkdYUePHm37do9ceZlys5zOdqMwLP2LBcvF9namwbo7Yer8ta99rSOMs748P85j7jSYB+M725TCOPnKmqvelELn/rbbbusIx7gsV3fYmPOS61qimDZxX68U1tVd7v5oNyeYX1/2q77GNkvSGc2U5ohSyz+dq44cMkKdFS1V91cNUONK6tSkcK2aEKpVE0N1QtS1arzIJLqDtWpc+RB1a91QdbQvoHaWE7NdaUiNqKtW5aUx9erLL6r21lYh46wQteRDMeRspI/Bi42dw1wovCjzwXnBMU6uC5UXmenczgvegBepSSMXSTNNJznk6lyEO1x3JO3u1IXq6ca5557bJa673O7jPbkJEKyfMz7rnAsMZ0jFXV92eGcaudqeYDhnuxUiU3eb5SuXE+YayZemG705L6YtjLjbxH2cZXOjP9qN6Ot+1R/YJkmaCrRFnBZbNi5drO454WT1M2ncO2uHq3GxGtGWa4SMq9TEQI0m5kmiRWsJ1auJwTo1Plav7qkYoM6Jl6pv+qCGh3xqx+G1KhqB+u9v7K3Wr1mj06ZGnUlKriyAIWgr2z6Dm+hINt3BeednXGobTvBiNMdzkTBhLkr3cabl7gju9J1wEn53JM2L39lp83XGXHB3ZHe53SRL6a48brgJJR9MWai1OuEuQ6H68bw7w7KdcxGDs30pxbSZId1iiaY358V9c3S3ufu8Udzoj3ajn/M67ot+1R/Ydl4c2qBlTY+Ooy2abdnejFnPPI3X77oT+1UORUXGhwiC8GV4g8ra7xhdfz4f/OksoskM6kIh1AaBcBpItTWjpCSM/7z9Lu6+8260NDYh6A9IjP7FoYceinXr1mm3XBg4/fTTtbsQbrnlFtsFHVce4ew9CwsXcnChhfnz59uurjjzTOtDHjeuvfbajvIQ55xzDkaNGmXvbYhvfvObHfkvXrxYb3OBdkTW74wzzrB9gGeeeQYffPCBvVcY5eXltis3ampqbNfGo9g0fvSjH0GIELvssovtY6EnZdh9990hJG/vWefx7LPPtvf6BsyjO/T2vFRUVNiu3OjuvBH90W790a/6A9sESTtJUvOzeCi+AfT5seCD9/HMrf9CVSqD0eXVCKaEmDl4WscKyCYHxcpxvyQUzApRZxXqo0FUyFNHNpHQCwKUl5bgmmuuwVtv/oe3fPgCkg4z7gfwRYbcre09QLTboi5YkqbzApo2bVrOFzPErbfemvMY02D9zjrrLNvHernC8E789re/tV35ccwxx+it8+bgxo033ojDDz8cBxxwgO1jgW3QF8j1snCnnXayXb2DebnoBNuNN6je4IQTToBosfaeRY4b81KsN+jv89LY2Gi7LIjGbrs2Ht2126boV32FbYakKXqUhkhWVGmf34dM02q8PflJfPzOO9htwHCollYhU61iC6gxSwx2rK59S5O4/pOwUdnWhOOokDBhYX9/BqivqcSyVSs0WS2iZqhb0cHSrvR6A94MnDjwwANtV/c4+OCDbZeFe+65x3YBhx12mO2ycOSRR+o32N0RwDvSlk7I419RFzc1SzfhO0HyZ0cy6Tk7Atu5J6Mx8uGCCy6wXRYeeuihHmlohZDvaaQv4NbWnnzySdvV/+jv88L4F110kb1nabR33HGHvdc7FGq3/upX/YFtgqQJ8qLmRiECjnWmveNdOSnvPjgee1UMQG04jPbGBj3uWWu/DLsBxFdxVLUPAa1J+xCR/Wp/WOIHtBvJFNqaW1FREsfEyY/hicceQ4pzgQTsFHMnvFHgBey82xM90fyGDh1quyywsxlQIyBJOcHjBx10kB4SlW+40auvvmq7LHz3u9+1Xb3DnXfeqTUf8/jt7gg8vrHgYzmHj5knABLOlClTtF9fgJqU++miL+EmkP7W3Jzoz/NChYCKAbVRgtrsSy+9VJQJphjka7f+7Ff9gW2GpDsgJOwXTXrlzA/x+iOT0Dx/EbavrEH7unXwk6Cz+mXpBo+mBvRmo/jlLyCkHMsGUR8qwYBwGZItaa1Jq2Qa0UgEMX8Qf/nLX/Ds889Zkft4julZs2bZrk70RPPr7lGbJDVjxgxNWk7wAqYNj53TPSa2v8aJkuScmo/70fr222+3XcWDdeB53mOPPTBu3Djtx7r++9//1pp9X4Dp8ymkP+EmEOf7gP5Gf5yX/fbbT7cbFQJD0Oeee6629/YVQRP52q2/+1VfYxsj6Sz8tA8LJt11L6ZPeQ57DB6JZEMjUsl24dC0ELSlSecCpzClicNHc4nWyIFQWiHankVdKIZaubBCoqSHAlz/0Ifa2losWbUCk8ZPwMLP5M7sF4aX8P1ln+4PsFNMnToVr7322gZkTZDo+HFAf4IaDjvQvvvua/tYnYaalQFvHD3VIPnijvXiI7QBtZ6jjjrK3us9Vq9e3aWc/YG+Msn0FP11XnhOnC/2iCuvvLKoj2R6gs3Vbn2NrYakyXuWEcPe2YAIFbKiKRPTJkzA51NfwohwKWrDMdF+RQMOBZEO+pGRP6bCO3nA79dbA52k3rUy8AsRB4V0w0kh6WgpKmNx0calBKJhZ9JZPe1pLBzGXfffiwmPPWrHlfQ7k+wVBg8ebLs2Dj3ReqkdGLJ2v7ihNlXMl4IbC2PTo2bF82HEbULYGNsf6/XAAw/YexZI1H31REAioAbovBH0Nfrr6aU79Od54Ys9as9ObIxWXgj52m1T9qu+wFZB0oagu/DyBiQtYTIJ+U3g1YmT0fL5AuxYPxDp5hZEg1FUlFcgGAzoF4q80HJCvDkyhDQu+rbWuPUwvYxCic8vhB9EuQTKJtqREf9V69agJB5HxB/AfXfehSfHT4RkIpGtm0VvQbux8w01UeywJ2L27Nm2y4L7RUouGLJ25/vmm2/qrdsG3dsXZrzgSZosm9XenUIt1a0Fb8zNgqYN91MChxH2JfrKvp0LS5cutV2bDpvivHDImzOdjdHKCyFfu22OftUbbPXmjtb2pMXXwuLBUCnuuOgifDz1WWxfXqXn38hk00KoKaSamxETzTjAkRsOrcApcghpkWRAIS0tQ8LOin8im0Lz+tUYXVKCAXKRhlVasssgWBZHqy+LsGw/+GwWJj3+GBqWLZdW7btmPf74422XBXaIYuEeBWBe+ph5FfINoaJ2ePnll9t7XbHrrrvaLgvPPvus7eoefEnkNp2YF08nn3yy3jrhfrQmHnzwQdvVPZxlPf/8822XBWqDfakRjRw50nZ1BTt/b/N5+umnbZeF/iYFoj/Pi7EVMx2OsXfCfZ56g0Lt1h/9qt8gd8YtHvyAr/Nzb9tDJCE//Kgw2Z6ir5r7xivqlL12U2eV1apxQ3dV4+u3Vw9WD1WTKgapp0rq1dRYnXpSZHLJAPVYZEN5NFKvxkUHqIdkOyFYoyb7q9Vj/ho1LlSr/hWvVn+vr1fHxqNqt3BE1cTLVKyiTEWrylVVbY0Kh0PaRnLu6WfqsnTM69FL8Esr0TZ02hS66dcdRCvpiEMRTdI+0vmFmmgTts+GMGGMOL+cYzznsUKf3RqwzO50TN2cZXPDXQ8K/XLBXWbuO8F8nMeFaOwjxcOdRiGYOru/fHTGL1R3wn3+Ke5Pl9317i5NwnxxmAt9fV5MXkacKKZ+Bs4wvW0393G66dcdCvWr/sJWq0lTyw1CtFxfGr6Q7Aju/es1SH+xCNuVlCPUmkAgkZQw0pai7Wb9ChmtGeugHdqzE2x16+UhXRJWthn9ojGrTRrBjMKAeLlo6AoxcQey1heLqXQKVaK5RwMhPP7EE3h8wmPW7Hh9AGobTpsqX+S4x/vmglNjlQtQj2hwQy64vI+X7g8MnG/1+XGDExzn2t142QkTJuitMx1qa6zPsccea/tsCD6aurU2k5Yb7jK79/tCm3bXs9Bjfq5yuuPPmTPHduUGz7UZlUDwMd1tWnGPYnCPZc+FF198Ma8dva/PS0NDg+2y4GyDYrXpvm63/uxXfQ6brLd4GG3a6KecQCklfw3pBtnLqoeu/Yv6WXmFurJuqJoweCf1WOlw9VjZEDWxaqCaVFmnHi+rUU+UihYdrxVNul49HhOJDrQ06HC9lkmiQY+nNh2uU+NFk340UK0m+KvUg/5K9e/ygeqm0ir118Ej1Hd8QTUmEFG18RJVWlmq4hWiTVfUqAHVA1R5pEwdccgRnXN59BGoBfB0GXFrZ05QQzThON+Ce94Cp+ZFDSKXBkQNwYTJNaeBez4G5plPEzFzJDjTYZ70Y9zuNHG3JsZ4ufJylylXud1zb/REE2KezriUfOfBOS+EM0yueSryaaB86nCGY3ruc2ngPF+UQteHSTdX+/THeXG3uTvdYtq1v9qtL/tVf2GrIWnCni9JQIpOqubEWpXKrFftK+aqo3fdQZ1cVqHuHTpWPV4/Rj1RNlRNLh8gJF2rJshJerSiSoi6Wj0erxGStk0e0a4EPZFmDhK0CGfHezRYqydgekiI+mEJ/69opbq+Zqj6ZaxS7ekLqeHxuCovj6uS8nJVVl6taioHqoqSGlVbOUD96U/nWCVNS1k7C94r8KJwdka6zSM9L3ReyM4OwU6Yq9MYkmZ8XsA0X5h0mMcRjik5GSZXGgQvcNOhKczb2QGZFi96huEFbsC8nOUsdMG76+SM48zLXRYj7LDO8rs7JaVQxzQgITjbxSlOE46zzua4aVt3vY0462/Oo5t0eY7ytRHBeO602eaGyLhl3U26zvNh0NfnhWViW7jDsG2c545wEqCRTdFuBI8749Ft8jbpOvPP16/6C1sVSXdqptSp21QyxZno2tS1xx+lfjWgWl03dKQaP2iMmlw9XD1ROVg9VlmvCXp8VbmaWFmhHiuv7ErSRovmzHckZodwZrxHOTtesE49IkT9iJD2v8M16taywersqmGiTYfV2JISVVVeokpEk45X1gpRD1DVZYNUECVqyOCR6sUXX9KlbW9v19u+Ai8gXtTuC5cXJC8wkkY+LcMNhuNFx7gmHXYiEhI7dXfgxcr8GN5Nkiwfy2kueCJXpzXiJkt3h8slxYShOMvgrKsRppMPhcpcjDDvYsvpFMZh+xVzHgwYlufCXUeeG6bHc52LtPr6vBQrBrwOcx3fGNmYdiP6sl/1JbaqhWhZUG1FVhzilqRhGR9OnYxLf/4r7FUzEEOEHmMtCYRUVs5+Rn+8AqQ6PkzxqwB8aRFu5Y9jnVl9LVbKOgO69Ex64mDr6AbiVvJrDgaxpqoUr69cgtn+NFbFgmjzB5FFGP5sEKGsH5lMChnVhn32+QaenPIkAoEAghya58GDBw89xNb14pBsqUV+MiLrG3DvxVdiTKQUw4IxRFIpIdIM0oEsUiJpv5CwEC0/BNSEq8WvpYONOXbPx1HYIiRz0jX3RRieNwJOuESCDwoBR7I+VAVDKJc0IsggEvBD/q34AhK5Xzwy2QymvfcubrrpJo+gPXjwsNHYqkjacKoeh5xM49Xb7sSaGZ9ih/I60aCTCCUzQqRCtFkuKKtAfZlfDVrcbm05Q548P+jRHiogx0P8jJwadVo0XglFlZv7khlHgmii1s0kookaiCWSGBgJoUzSjKiUaO4SVzR3vy4c08ogHAqJRp3FxRdfnHOuAA8ePHgoBlsVSXdAtOilH83C7Zdehd2rB6M6E0KgJYVAKqtJNJgBwhkfwqL5UgMmuRqitT5QEZIW8QtJh8NhuxWEZEXh9UlQoVkdjqBmnNXaN0ner80g/tZWDCuNoVR8gol2hNJygxCi9ov4hKCpWYfCQT3Er729XU+W3tLSgqzcPLYi65IHDx62AGxVJK3pTUrcvmoNxl97PQb6o6jxhxFoozYLPb2oZXu2RM8LrUisQpgi2phB8hXhcYbPpoRcA0FkI2H99WCCFM1Px61gEs/aEpZWLdtkEjHR2IeVhRDnTUE0+FBWyFniCqVLPgrpdFo0adGo5SbAL584hjQrmrVVCQ8ePHgoDlsNSZPbNEmK5rro9f/gsQkPY/uaAYilhfjSokVLTfTrQK2pMiDnheaEo37xt9yc5N9Pm7GkFiKBC7mmUhlkfEGkSkrQHA2jTQhb+UJ2XOszcjYStWKSd1a0b9qbGWJYRS0qEEFYa/A0sVizflgmD7klSPiysjLZ+nHKKadg+YrlmsA9ovbgwUOx2DpIWkhNj9AQ54JZn+Kyk0/FvrWjUOkPICLaaSCbFPIVLVarz1aUXNCmCiHMDlNGMIh4bR2CdXVYHfTj0+YGLEm1ozUURDIYEroNkJ0lSdvW7E/LvuTDkSPtKVQFoqgTUi8TItertkhI3kgYmqQelDQ4soNTmtLUwQll1q9fr8vomT08ePBQDLYOkuYUpELGLYuX4Z2Hx6F5xQJsX1mNYHu7aLpCnCJZpIT4SI9dQbKUfwSEoS0S9yGZFg06GECrqN+rhIo/bWrAf5YtQs0eewAjhmK+EHU6HkcL0+WKKxwe4hO3iKjtmoyDySwiTSmMilWgPhhFWIpoJc+wIiRsIWLaohOJhPYfP348pk+fLtp7ygrnwYMHD91giyVpEpl50aZtub4A5r7/Ie69+jp8a8hXEG1L6Hmitd7K4XKi3WpTQh4wHUvSCESDSMdCaIuF0VQSw7R1y1AyejR+euH5OPjPZ8M3oBbzWtahdMggJIXI037RnCUPEjUlKKQdlKwi7RnUIIwyBBFIyTEpj/VSksq/lZ9BJBLRQ/G4tuBHH31k+3rw4MFDYWxBJC0k6ODYUCgkJK30MDZ/OIRFH3yIyddcj5HBOIaXlaPEH9DEmfRnRbcVQiQxUvScUW4tldo0bdKWf0tKNNuqOBarNrwrWvmyTAa/uvQS7HTgQdjpmF9h1OE/xnvNq7G4vQm+8piettRSk6UsUk7auIMZIeq2LGoCMVSLJs0heOm0NW0qV4dxa8rJZFIvXc/JZji5+aJFi+wjHjx48JAfW54mTZazyVqJJu0TSa5YhTcnjscnb7yE/xo5BlkhOl9aiJbas8pq7TUjpKhf2Ylbka07iNpKjMPo0kLgjYkMyoYMw7RFCzG3vRmDv7EXfnnOmdjRrFuWbsWhv/k1Dv7l0Xhr6RdIRCNQIY4MYTo0p1DYcAGEOMwvkUZcVOeY+HBstmSuybyjEjZoC6fE43HcfffdeO+99+wjHrZ2cM7o6upqfWPmtrsV1z1sGeCMdjxnlPPOO6/bmRw3F7YMkiafOUWQFPKT1kNAtOh3XnwZz91+F75aUYcKe1wyUkn4Mwr+rFRBcfCb9SVhhwhRBwJBhMMxMiQSmRRUNI5Q7Qi8+cVSzGhqwu+vvhat9TX470N/grrhAyWNFFIphej2u2Dvo3+F+u13xYfLlqJ8gByTNIKRILJ8aai1ctGnhZB9qRTqhXiro1GEOkZ4yM3FPvkUg3Q6rU0e9OP0nh5Rb/1gxz7uuOP0VJdHHHEEPv/88z5b5NZD/4EEzalqR48erZeMu+KKK/T0pVsitjxNmhCiDgq3hUSDXfHJp3h73AQEVq/FdqXlCLa1IJgVDTqTRkAUVo51tqrBT6+5tUhR6FGSCQg5Z9HYnkBCjmVKyvDZuibMbmvEFQ8+iv8sWIC9f/JDDNxpLNqFWFuzQuQhftziw87f3A/fPeZXeL91LeavXYN0KIBMlt8tSvq2pq5/hZhL5WZQF4zopbWCXDpLh+uEIWpjo47FYvjwww/1CtbLly/Xfh62PpCgudrM3LlzMWXKFD0395ba0T10gueJBH3VVVfh7bff3uSrf/cUWwZJW5zXRfiBiSi2eOuRCfj85Vew28BhCKaFnLNpTdDarEAIYfKDFX7+TdHErcfY+ZFMZ9HUnkQqFEGgqgazVq7Ahw1LcdbNtwsxj8IXa1dhr332RWm8Sug8KIQv2" +
                  "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" +
                  "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",
                width: 150
              }, {
                border: [false, true, true, true],
                text: '\nDECLARACIÓN JURADA DE CONOCIMIENTO DEL CLIENTE\nPara uso exclusivo del Notario y la SBS s través de la UIF-Perú',
                bold: true,
                color: '#FFFFFF',
                fontSize: 11,
                alignment: 'center',
              }],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                { border: [true, false, true, false], text: 'Por el presente documento, declaro bajo juramento, lo siguiente:', fontSize: 11 },
              ],
            ]
          }
        },
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  border: [true, true, true, true], text: 'PERSONA JURIDICA', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11
                },
              ],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        {
          table: {
            widths: [20, 476.5],
            body: [
              [{ border: [true, false, true, false], text: 'a)', fontSize: sizeText }, { border: [true, false, true, false], text: ('Razón Social: ' + espacio + '' + entidad.razonsocial), fontSize: sizeText }],
              [{ text: 'b)', fontSize: sizeText }, { text: ('Registro Único de Contribuyente (RUC), Nro: ' + espacio + '' + entidad.ruc), fontSize: sizeText }],
              [{ text: 'c)', fontSize: sizeText }, { text: ('Dirección: ' + espacio + '' + entidad.direccion + espacio + espacio + ' Distrito: ' + this.onVS(entidad.ubigeo)), fontSize: sizeText }],
              [{ text: 'd)', fontSize: sizeText }, { text: ('Número de teléfono: \t\t\t ' + entidad.telefono + '\t\t\t Correo: ' + entidad.correo), fontSize: sizeText }],
              [{ text: 'e)', fontSize: sizeText }, { text: ('Partida Registral: ' + espacio + '' + entidad.partida_registral), fontSize: sizeText }],
              [{ text: 'f)', fontSize: sizeText }, { text: ('Sede Registral: ' + espacio + '' + entidad.sede_registral), fontSize: sizeText }],
              [{ text: 'g)', fontSize: sizeText }, { text: ('Objeto social y actividad económica principal: ' + espacio + 'Comercial ( ' + (entidad.comercial == 0 ? marca : '') + ' ), Industrial ( ' + (entidad.industrial == 0 ? marca : '') + ' ), Construcción ( ' + (entidad.construccion == 0 ? marca : '') + ' ), Transporte ( ' + (entidad.transporte == 0 ? marca : '') + ' ), Pesca ( ' + (entidad.pesca == 0 ? marca : '') + ' ), Intermediación Finaciera ( ' + (entidad.intermediacion_financiera == 0 ? marca : '') + ' ), Hoteles y Restaurantes ( ' + (entidad.hoteles_restaurantes == 0 ? marca : '') + ' ), Agricultura ( ' + (entidad.agricultura == 0 ? marca : '') + ' ), Enseñanza ( ' + (entidad.ensenanza == 0 ? marca : '') + ' ), Suministro de Electricidad, Gas y Agua ( ' + (entidad.suministro_electricidad_gas == 0 ? marca : '') + ' ), Otros ( ' + (entidad.otro_opcion == 0 ? marca : '') + ' ): ' + (entidad.otro_opcion == 0 ? entidad.otros_describir : '____________________________________')), fontSize: sizeText }],
            ]
          }
        },
        {
          table: {
            widths: [20, 400, 67.5],
            body: [
              [{ border: [true, false, true, true], rowSpan: 2, text: 'h)', fontSize: sizeText }, { border: [true, false, true, true], text: '¿Es sujeto obligado informar a la UIF-Perú?', fontSize: sizeText }, { border: [true, false, true, true], text: ' SI ( ' + (entidad_uif.obigado_informar == 0 ? marca : '') + ' )   NO ( ' + (entidad_uif.obigado_informar == 1 ? marca : '') + ' )', fontSize: sizeText }],
              ['', { text: 'En caso marcó SI, indique si designó a su Oficial de Cumplimiento:' + espacio + '', fontSize: sizeText }, { text: ' SI ( ' + (entidad_uif.designo_oficial_cumplimiento == 0 ? marca : '') + ' )   NO ( ' + (entidad_uif.designo_oficial_cumplimiento == 1 ? marca : '') + ' )', fontSize: sizeText }],
            ]
          }
        },
        {
          table: {
            widths: [20, 400, 67.5],
            body: [
              [
                { text: 'i)', border: [true, false, false, false], fontSize: sizeText },
                { border: [true, false, true, true], text: '¿Alguna Persona Políticamente Expuesta tiene el 25%  o más de prioridad de la empresa?', fontSize: sizeText },
                { border: [true, false, true, true], text: ' SI ( ' + (entidad_uif.expuesta25 == 0 ? marca : '') + ' )   NO ( ' + (entidad_uif.expuesta25 == 1 ? marca : '') + ' )', fontSize: sizeText },
              ],
            ]
          }
        },
        {
          table: {
            widths: [20, 110, 210, 138.5],
            body: [
              [
                { rowSpan: 2, text: '', border: [true, false, false, true], fontSize: sizeText },
                { rowSpan: 2, text: 'En caso marcó SI, señale el nombre de esa persona, así como su cargo.', border: [true, false, false, true], fontSize: sizeText },
                { colSpan: 2, text: 'Nombre y Apellidos: ' + espacio + '' + entidad_uif.nombres, border: [true, false, true, true], fontSize: sizeText },
                ''
              ],
              [
                '',
                '',
                { text: 'Cargo: ' + espacio + '' + entidad_uif.cargo, border: [true, true, false, true], fontSize: sizeText },
                { text: 'País: ' + espacio + '' + (entidad_uif.id_pais == undefined ? '' : entidad_uif.id_pais), border: [true, true, true, true], fontSize: sizeText },
              ]
            ]
          }
        },
        {
          table: {
            widths: [20, 476.5],
            body: [
              [
                { text: 'j)', border: [true, false, false, true], fontSize: sizeText },
                { text: 'El origen de los fondos, bienes u otros activos involucrados en dicha transacción (especifique)\n\t - Giro del Negocio ( ' + (entidad_uif.of_giro_negocio == 0 ? marca : '') + ' ), Préstamo bancario ( ' + (entidad_uif.of_prestamo_bancario == 0 ? marca : '') + ' ), Préstamo Socios ( ' + (entidad_uif.of_prestamos_socios == 0 ? marca : '') + ' ), Préstamo terceros ( ' + (entidad_uif.of_prestamo_terceros == 0 ? marca : '') + ' ), \n - Venta de Inmuebles ( ' + (entidad_uif.of_venta_bien_inmueble == 0 ? marca : '') + ' ), Venta otros Activos ( ' + (entidad_uif.of_venta_activos == 0 ? marca : '') + ' ), Intermediación Financiera ( ' + (entidad_uif.of_intermediacion_financiera == 0 ? marca : '') + ' ), \n - Otros ( ' + (entidad_uif.of_otros_escribir_of == 0 ? marca : '') + ' ): ' + (entidad_uif.of_otros_escribir_of == 0 ? entidad_uif.of_otros_escribir_of_text : '____________________'), border: [true, false, true, true], fontSize: sizeText },
              ],
              [
                { text: 'k)', border: [true, false, false, false], fontSize: sizeText },
                { text: 'Medio de pago utilizado:' + espacio + ' Efectivo ( ' + (entidad_uif.mp_efectivo == 0 ? marca : '') + ' ), Cheque ( ' + (entidad_uif.mp_cheque == 0 ? marca : '') + ' ), Deposito en Cuenta ( ' + (entidad_uif.mp_deposito_cuenta == 0 ? marca : '') + ' ), Transferencia Bancaria ( ' + (entidad_uif.mp_transferencia_bancaria == 0 ? marca : '') + ' ), Bien Inmueble ( ' + (entidad_uif.mp_bien_inmueble == 0 ? marca : '') + ' ), Bien Mueble ( ' + (entidad_uif.mp_bien_mueble == 0 ? marca : '') + ' ), Otro ( ' + (entidad_uif.mp_otros_describir == 0 ? marca : '') + ' ): ' + (entidad_uif.mp_otros_describir == 0 ? entidad.mp_otros_describir_text : '__________________________'), border: [true, false, true, false], fontSize: sizeText },
              ],
            ]
          }
        },
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  border: [true, true, true, true], text: '1ER. REPRESENTANTE DE PERSONA JURIDICA / ENTIDAD FINANCIERA', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11
                },
              ],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        (cant_contribuyentes > 0 ?
          (
            {
              table: {
                widths: [20, 110, 287.5, 60.5],
                body: [
                  [
                    { border: [true, false, true, true], text: '1)', fontSize: sizeText },
                    { border: [true, false, true, true], text: 'Datos de la Persona natural que representa a la Persona Jurídica', fontSize: sizeText },
                    {
                      colSpan: 2, border: [true, false, true, true], text: 'Nombres y Apellidos: ' + espacio + '' + contribuyentes[0].nombres + '\n'
                        + 'Tipo y Número de Documento de  Identidad: ' + espacio + '' + contribuyentes[0].id_tipo_documento + ' N° ' + contribuyentes[0].numero_documento + '\n'
                        + 'Nacionalidad: ' + espacio + '' + (contribuyentes[0].id_pais_nacionalidad != null ? contribuyentes[0].id_pais_nacionalidad : '____________________') + ', \t\t\t\t\tProfesión u ocupación: ' + espacio + '' + (contribuyentes[0].profecion_ocupacion != '' ? contribuyentes[0].profecion_ocupacion : '____________________') + '\n'
                        + 'Estado Civil: ' + espacio + '' + (contribuyentes[0].id_estado_civil != null ? contribuyentes[0].id_estado_civil : '____________________') + ', \t\t\t\t\tFecha nacimiento: ' + espacio + '' + (contribuyentes[0].fecha_nacimiento != null ? contribuyentes[0].fecha_nacimiento : '____________________') + '\n'
                        + 'Domicilio: ' + espacio + '' + (contribuyentes[0].domicilio != '' ? contribuyentes[0].domicilio : '____________________') + '\n'
                        + 'Teléfono: ' + espacio + '' + (contribuyentes[0].telefono != '' ? contribuyentes[0].telefono : '____________________') + '\n Inscripción Poder: ' + espacio + '' + (contribuyentes[0].inscripcion_registral != '' ? contribuyentes[0].inscripcion_registral : '____________________') + '', fontSize: sizeText
                    },
                    { border: [true, false, true, true], text: '', fontSize: sizeText },
                  ],
                  [
                    { colSpan: 3, text: 'Afirmo y ratifico todo lo manifestado en la presente declaración jurada, en señal de lo cual la firmo, en la fecha que se indica:', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [false, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, alignment: 'left', text: 'Fecha: \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t Firma:_____________________', border: [true, false, true, true], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], fontSize: sizeText, text: 'Huella Dactilar:' }
                  ]
                ]
              }
            }
          ) :
          (
            {
              table: {
                widths: [20, 110, 287.5, 60.5],
                body: [
                  [
                    { border: [true, false, true, true], text: '1)', fontSize: sizeText },
                    { border: [true, false, true, true], text: 'Datos de la Persona natural que representa a la Persona Jurídica', fontSize: sizeText },
                    {
                      colSpan: 2, border: [true, false, true, true], text: 'Nombres y Apellidos: _________________________________________\n'
                        + 'Tipo y Número de Documento de  Identidad: _________________________________________\n'
                        + 'Nacionalidad: ____________________, Profesión u ocupación: _____________________\n'
                        + 'Estado Civil: ____________________, Fecha nacimiento: _____________________\n'
                        + 'Domicilio: _________________________________________\n'
                        + 'Teléfono: ____________________\n Inscripción Poder: ____________________', fontSize: sizeText
                    },
                    { border: [true, false, true, true], text: '', fontSize: sizeText },
                  ],
                  [
                    { colSpan: 3, text: 'Afirmo y ratifico todo lo manifestado en la presente declaración jurada, en señal de lo cual la firmo, en la fecha que se indica:', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [false, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, alignment: 'left', text: 'Fecha: \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t Firma:_____________________', border: [true, false, true, true], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], fontSize: sizeText, text: 'Huella Dactilar:' }
                  ]
                ]
              }
            }
          )),
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  border: [true, true, true, true], text: '2DO. REPRESENTANTE DE PERSONA JURIDICA', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11
                },
              ],
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
            }
          }
        },
        (cant_contribuyentes > 1 ?
          (
            {
              table: {
                widths: [20, 110, 287.5, 60.5],
                body: [
                  [
                    { border: [true, false, true, true], text: '2)', fontSize: sizeText },
                    { border: [true, false, true, true], text: 'Datos de la Persona natural que representa a la Persona Jurídica', fontSize: sizeText },
                    {
                      colSpan: 2, border: [true, false, true, true], text: 'Nombres y Apellidos: ' + espacio + '' + contribuyentes[1].nombres + '\n'
                        + 'Tipo y Número de Documento de  Identidad: ' + espacio + '' + contribuyentes[1].id_tipo_documento + ' N° ' + contribuyentes[1].numero_documento + '\n'
                        + 'Nacionalidad: ' + espacio + '' + (contribuyentes[1].id_pais_nacionalidad != null ? contribuyentes[1].id_pais_nacionalidad : '____________________') + ', \t\t\t\t\tProfesión u ocupación: ' + espacio + '' + (contribuyentes[1].profecion_ocupacion != '' ? contribuyentes[1].profecion_ocupacion : '____________________') + '\n'
                        + 'Estado Civil: ' + espacio + '' + (contribuyentes[1].id_estado_civil != null ? contribuyentes[1].id_estado_civil : '____________________') + ', \t\t\t\t\tFecha nacimiento: ' + espacio + '' + (contribuyentes[1].fecha_nacimiento != null ? contribuyentes[1].fecha_nacimiento : '____________________') + '\n'
                        + 'Domicilio: ' + espacio + '' + (contribuyentes[1].domicilio != '' ? contribuyentes[1].domicilio : '____________________') + '\n'
                        + 'Teléfono: ' + espacio + '' + (contribuyentes[1].telefono != '' ? contribuyentes[1].telefono : '____________________') + '\n Inscripción Poder: ' + espacio + '' + (contribuyentes[1].inscripcion_registral != '' ? contribuyentes[1].inscripcion_registral : '____________________') + '', fontSize: sizeText
                    },
                    { border: [true, false, true, true], text: '', fontSize: sizeText },
                  ],
                  [
                    { colSpan: 3, text: 'Afirmo y ratifico todo lo manifestado en la presente declaración jurada, en señal de lo cual la firmo, en la fecha que se indica:', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [false, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, alignment: 'left', text: 'Fecha: \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t Firma:_____________________', border: [true, false, true, true], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], fontSize: sizeText, text: 'Huella Dactilar:' }
                  ]
                ]
              }
            }
          ) :
          (
            {
              table: {
                widths: [20, 110, 287.5, 60.5],
                body: [
                  [
                    { border: [true, false, true, true], text: '2)', fontSize: sizeText },
                    { border: [true, false, true, true], text: 'Datos de la Persona natural que representa a la Persona Jurídica', fontSize: sizeText },
                    {
                      colSpan: 2, border: [true, false, true, true], text: 'Nombres y Apellidos: _________________________________________\n'
                        + 'Tipo y Número de Documento de  Identidad: _________________________________________\n'
                        + 'Nacionalidad: ____________________ Profesión u ocupación: _____________________\n'
                        + 'Estado Civil: ____________________ Fecha nacimiento: _____________________\n'
                        + 'Domicilio: _________________________________________\n'
                        + 'Teléfono: ____________________\n Inscripción Poder: ____________________', fontSize: sizeText
                    },
                    { border: [true, false, true, true], text: '', fontSize: sizeText },
                  ],
                  [
                    { colSpan: 3, text: 'Afirmo y ratifico todo lo manifestado en la presente declaración jurada, en señal de lo cual la firmo, en la fecha que se indica:', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [false, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, alignment: 'left', text: 'Fecha: \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t Firma:_____________________', border: [true, false, true, true], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], fontSize: sizeText, text: 'Huella Dactilar:' }
                  ]
                ]
              }
            }
          )),
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [{ border: [false, false, false, false], text: '', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11 }],
              [{ border: [false, false, false, false], text: '', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11 }],
              [{ border: [false, false, false, false], text: '', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11 }],
              [{ border: [false, false, false, false], text: '', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11 }],
            ]
          }
        },
        (cant_contribuyentes > 2 ?
          ({
            table: {
              headerRows: 1,
              widths: ['*'],
              body: [
                [
                  {
                    border: [true, true, true, true], text: '3RO. REPRESENTANTE DE PERSONA JURIDICA', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11
                  },
                ],
              ]
            },
            layout: {
              fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
              }
            }
          }) : ({ table: { body: [[{ border: [false, false, false, false], text: '', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11 }],] } })),
        (cant_contribuyentes > 2 ?
          (
            {
              table: {
                widths: [20, 110, 287.5, 60.5],
                body: [
                  [
                    { border: [true, false, true, true], text: '3)', fontSize: sizeText },
                    { border: [true, false, true, true], text: 'Datos de la Persona natural que representa a la Persona Jurídica', fontSize: sizeText },
                    {
                      colSpan: 2, border: [true, false, true, true], text: 'Nombres y Apellidos: ' + espacio + '' + contribuyentes[2].nombres + '\n'
                        + 'Tipo y Número de Documento de  Identidad: ' + espacio + '' + contribuyentes[2].id_tipo_documento + ' N° ' + contribuyentes[2].numero_documento + '\n'
                        + 'Nacionalidad: ' + espacio + '' + (contribuyentes[2].id_pais_nacionalidad != null ? contribuyentes[2].id_pais_nacionalidad : '____________________') + ', \t\t\t\t\tProfesión u ocupación: ' + espacio + '' + espacio + '' + (contribuyentes[2].profecion_ocupacion != '' ? contribuyentes[2].profecion_ocupacion : '____________________') + '\n'
                        + 'Estado Civil: ' + espacio + '' + (contribuyentes[2].id_estado_civil != null ? contribuyentes[2].id_estado_civil : '____________________') + ', \t\t\t\t\tFecha nacimiento: ' + espacio + '' + (contribuyentes[2].fecha_nacimiento != null ? contribuyentes[2].fecha_nacimiento : '____________________') + '\n'
                        + 'Domicilio: ' + espacio + '' + (contribuyentes[2].domicilio != '' ? contribuyentes[2].domicilio : '____________________') + '\n'
                        + 'Teléfono: ' + espacio + '' + (contribuyentes[2].telefono != '' ? contribuyentes[2].telefono : '____________________') + '\n Inscripción Poder: ' + espacio + '' + (contribuyentes[2].inscripcion_registral != '' ? contribuyentes[2].inscripcion_registral : '____________________') + '', fontSize: sizeText
                    },
                    { border: [true, false, true, true], text: '', fontSize: sizeText },
                  ],
                  [
                    { colSpan: 3, text: 'Afirmo y ratifico todo lo manifestado en la presente declaración jurada, en señal de lo cual la firmo, en la fecha que se indica:', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [false, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, alignment: 'left', text: 'Fecha: \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t Firma:_____________________', border: [true, false, true, true], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], fontSize: sizeText, text: 'Huella Dactilar:' }
                  ]
                ]
              }
            }
          ) : ({ table: { body: [[{ border: [false, false, false, false], text: '', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11 }],] } })),
        (cant_contribuyentes > 3 ?
          ({
            table: {
              headerRows: 1,
              widths: ['*'],
              body: [
                [
                  {
                    border: [true, true, true, true], text: '4TO. REPRESENTANTE DE PERSONA JURIDICA', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11
                  },
                ],
              ]
            },
            layout: {
              fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex % 2 === 0) ? '#6e6d6d' : null;
              }
            }
          }) : ({ table: { body: [[{ border: [false, false, false, false], text: '', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11 }],] } })),
        (cant_contribuyentes > 3 ?
          (
            {
              table: {
                widths: [20, 110, 287.5, 60.5],
                body: [
                  [
                    { border: [true, false, true, true], text: '3)', fontSize: sizeText },
                    { border: [true, false, true, true], text: 'Datos de la Persona natural que representa a la Persona Jurídica', fontSize: sizeText },
                    {
                      colSpan: 2, border: [true, false, true, true], text: 'Nombres y Apellidos: ' + espacio + '' + contribuyentes[3].nombres + '\n'
                        + 'Tipo y Número de Documento de  Identidad: ' + espacio + '' + contribuyentes[3].id_tipo_documento + ' N° ' + contribuyentes[3].numero_documento + '\n'
                        + 'Nacionalidad: ' + espacio + '' + (contribuyentes[3].id_pais_nacionalidad != null ? contribuyentes[3].id_pais_nacionalidad : '____________________') + '' + espacio + ', Profesión u ocupación: ' + espacio + '' + (contribuyentes[3].profecion_ocupacion != '' ? contribuyentes[3].profecion_ocupacion : '____________________') + '\n'
                        + 'Estado Civil: ' + espacio + '' + (contribuyentes[3].id_estado_civil != null ? contribuyentes[3].id_estado_civil : '____________________') + '' + espacio + ', Fecha nacimiento: ' + espacio + '' + (contribuyentes[3].fecha_nacimiento != null ? contribuyentes[3].fecha_nacimiento : '____________________') + '\n'
                        + 'Domicilio: ' + espacio + '' + (contribuyentes[3].domicilio != '' ? contribuyentes[3].domicilio : '____________________') + '\n'
                        + 'Teléfono: ' + espacio + '' + (contribuyentes[3].telefono != '' ? contribuyentes[3].telefono : '____________________') + '\n Inscripción Poder: ' + espacio + '' + (contribuyentes[3].inscripcion_registral != '' ? contribuyentes[3].inscripcion_registral : '____________________') + '', fontSize: sizeText
                    },
                    { border: [true, false, true, true], text: '', fontSize: sizeText },
                  ],
                  [
                    { colSpan: 3, text: 'Afirmo y ratifico todo lo manifestado en la presente declaración jurada, en señal de lo cual la firmo, en la fecha que se indica:', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, text: '', border: [true, false, true, false], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [false, false, true, false], text: '' }
                  ],
                  [
                    { colSpan: 3, alignment: 'left', text: 'Fecha: \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t Firma:_____________________', border: [true, false, true, true], fontSize: sizeText }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], text: '' }, { border: [true, false, true, true], fontSize: sizeText, text: 'Huella Dactilar:' }
                  ]
                ]
              }
            }) : ({ table: { body: [[{ border: [false, false, false, false], text: '', alignment: 'center', color: '#FFFFFF', bold: true, fontSize: 11 }],] } })),
      ],
      styles: {
        name: {
          fontSize: 16,
          bold: true
        }
      }
    };
  }
}