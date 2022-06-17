import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { LogInComponent } from '../log-in/log-in.component';
import { FormularioService } from '../../services/formulario.service';
import { Funciones } from '../../funciones/funciones';

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";
import { environment } from '../../../environments/environment';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Item } from 'pdfmake-wrapper';
import Swal from 'sweetalert2';

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

export interface kardex {
  kardex_numero: string,
  numero_placa: string,
  adquiriente: string,
  transferente: string,
  archivo_byte: Array<[]>,
  archivo_type: string,
  archivo_name: string,
  archivo_size: number,
  detalle_numero_servicio: string
  //detalle_numero_servicio: kardex_detalle_numero_servicio []
}

export interface kardex_detalle_numero_servicio {
  id: number,
  id_kardex: number,
  numero_servicio: string,	
  estado: number,
  fecha_registro: Date  
}

@Component({
  selector: 'app-generarplantillas',
  templateUrl: './generarplantillas.component.html',
  styleUrls: ['./generarplantillas.component.css']
})
export class GenerarplantillasComponent implements OnInit {
  
  kardex_reg: kardex = {
    kardex_numero: '',
    numero_placa: '',
    adquiriente: '',
    transferente: '',
    archivo_byte: [],
    archivo_type: '',
    archivo_name: 'Cargar Archivo',
    archivo_size: 0,
    detalle_numero_servicio: ''
  };
  detalle_numero_servicio = [];
  public archivoSubir: File;
  archivoTemp: any;
  biTipo: boolean = true;
  vcPlaca: string = "";
  vcPlaca2: string = "";
  numero_placa: string = "";
  kardex_numero: string = "";
  inTipo: number = 1;
  standalone: true;
  displayedColumns:  string[] = [
    'fecha',
    'placa',
    'numero',
    'participante1',
    'participante2',
    'descargar'
  ];
  dataSourceRows: any;
  dataSourceKardex: any;
  seasons: any;
  movil: boolean = false;
  
  @ViewChild('paginatorRegistros', { static: true }) paginator: MatPaginator;

  constructor(
    private _router: Router,
    private mantenimientoService: MantenimientoService,
    public logInComponent: LogInComponent,
    private formularioService: FormularioService,
    public funciones: Funciones
  ) { 
    var token = localStorage.getItem('token');
    if (token == undefined || token == null || token == '')
      this._router.navigate(['/login']);
  }

  ngOnInit() {
    this.dataSourceRows = [];
    this.vcPlaca = '';
    this.vcPlaca2 = '';
    this.inTipo = 1;
    //this.onBuscar();
    this.seasons = [
      { 'inTipo': 1, 'nombre': 'Compra Venta'}, 
      { 'inTipo': 2, 'nombre': 'Donación'}, 
      { 'inTipo': 3, 'nombre': 'Permuta'},
    ]
  
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
  
  /*applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }*/
  
  onBuscar() {
    this.dataSourceRows = []; 
    var data = {
      'f_num_placa': this.vcPlaca,
      'f_tipo': this.inTipo
    } 
    if (this.inTipo == 3) {
      if (!this.funciones.onValidaVacio(this.vcPlaca)) {
        this.funciones.mensajeAlerta('Alerta', 'Ingresar numero de placa 1');
        return;
      }
      if (!this.funciones.onValidaVacio(this.vcPlaca2)) {
        this.funciones.mensajeAlerta('Alerta', 'Ingresar numero de placa 2');
        return;
      }
      if (this.vcPlaca === this.vcPlaca2) {
        this.funciones.mensajeAlerta('Alerta', 'El Numero de Placa 1 debe ser diferente al Numero Placa 2');
        return;
      }
      this.funciones.showLoading();
      this.formularioService.postConsultaPlacaVehicular(data).subscribe( 
        (data: any) => {
          if (data['statuscode'] == 200) {
            var dataArr = data['data'];
            if (dataArr != null && dataArr.length > 0) {
              data = {
                'f_num_placa': this.vcPlaca2,
                'f_tipo': this.inTipo
              } 
              this.formularioService.postConsultaPlacaVehicular(data).subscribe( 
                (data: any) => {
                  if (data['statuscode'] == 200) {
                    var dataArr2 = data['data'];
                    this.dataSourceRows = data['data'];
                    if (dataArr2 != null && dataArr2.length > 0) {
                      var dataTemp = [];
                      var adquiriente = "";
                      var transferente = "";
                      var adquirienteArr = [];
                      var transferenteArr = [];
                      var row = dataArr[0];
                      adquiriente += dataArr[0].vcpersona;
                      adquirienteArr.push({
                        'biActivo': false, 
                        'numero_servicio': dataArr[0].vcnumeroservicio,
                        'vcNombre': dataArr[0].vcpersona, 
                        'fecha': dataArr[0].fecha,
                        'vcDocumento': dataArr[0].vcnumero_documento,
                        'vcNacionalidad': dataArr[0].vcnacionalidad,
                        'vcProfesionOcupacion': dataArr[0].vcprofesionocupacion,
                        'vcEstadoCivil': dataArr[0].vcestadocivil,
                        'vcDomicilio': dataArr[0].vcdomicilio,
                        'vcDistrito': dataArr[0].vcdistrito,
                        'vcProvincia': dataArr[0].vcprovincia,
                        'vcDepartamento': dataArr[0].vcdepartamento,
                        'vcRepresentante': dataArr[0].vcrepresentante,
                        'vcMonedaLetras': this.funciones.NumeroALetras(dataArr[0].valor),
                        'vcMoneda': this.funciones.formatNumberMoney(dataArr[0].valor),
                        'vcSMoneda': dataArr[0].moneda === "SOLES" ? "S/ " : "US$ ",
                        'vcTMoneda': dataArr2[0].moneda === "SOLES" ? dataArr2[0].moneda : 'DÓLARES AMERICANOS',
                        'vcMarca': dataArr[0].vcmarca,
                        'vcModelo': dataArr[0].vcmodelo,
                        'vcPlaca': dataArr[0].vcplaca,
                        'deMonto': dataArr[0].valor,
                        'vcMonto': dataArr[0].valor
                      });

                      transferente += dataArr2[0].vcpersona;
                      transferenteArr.push({
                        'biActivo': false, 
                        'numero_servicio': dataArr[0].vcnumeroservicio,
                        'fecha': dataArr[0].fecha,
                        'vcNombre': dataArr2[0].vcpersona, 
                        'vcDocumento': dataArr2[0].vcnumero_documento,
                        'vcNacionalidad': dataArr2[0].vcnacionalidad,
                        'vcProfesionOcupacion': dataArr2[0].vcprofesionocupacion,
                        'vcEstadoCivil': dataArr2[0].vcestadocivil,
                        'vcDomicilio': dataArr2[0].vcdomicilio,
                        'vcDistrito': dataArr2[0].vcdistrito,
                        'vcProvincia': dataArr2[0].vcprovincia,
                        'vcDepartamento': dataArr2[0].vcdepartamento,
                        'vcRepresentante': dataArr2[0].vcrepresentante,
                        'vcMonedaLetras': this.funciones.NumeroALetras(dataArr2[0].valor),
                        'vcMoneda': this.funciones.formatNumberMoney(dataArr2[0].valor),
                        'vcSMoneda': dataArr2[0].moneda === "SOLES" ? "S/ " : "US$ ",
                        'vcTMoneda': dataArr2[0].moneda === "SOLES" ? dataArr2[0].moneda : 'DÓLARES AMERICANOS',
                        'vcMarca': dataArr2[0].vcmarca,
                        'vcModelo': dataArr2[0].vcmodelo,
                        'vcPlaca': dataArr2[0].vcplaca,
                        'deMonto': dataArr2[0].valor,
                        'vcMonto': dataArr2[0].valor
                      });

                      row.isDepositoCuenta = row.mp_deposito_cuenta == 0 ? true: false;
                      row.isTransferenciaBancaria = row.mp_transferencia_bancaria == 0 ? true: false;
                      row.isCheque = row.mp_cheque == 0 ? true: false;
                      row.isEfectivo = row.mp_efectivo == 0 ? true: false;

                      row.vcPlacas = (row.vcplaca + "/" + dataArr2[0].vcplaca);
                      row.adquiriente = adquiriente;
                      row.transferente = transferente;
                      row.adquirienteJson = adquirienteArr;
                      row.transferenteJson = transferenteArr;
                      row.kardex_numero = '';
                      dataTemp.push(row);
                      //this.dataSource = new MatTableDataSource<PeriodicElement>(dataTemp);
                      //this.dataSource.paginator = this.paginator;
                      this.dataSourceRows = dataTemp;
                    } else {
                      //this.funciones.mensajeAlerta("Alerta", "No se encontro resultados");
                    }
                    //console.log(this.dataSource);
                  } else {
                    this.funciones.mensajeError("", data['mensaje']);
                  }
                  this.funciones.hideLoading();
                },
              error => {
                this.funciones.hideLoading();
              })
            } else {
              //this.funciones.mensajeAlerta("Alerta", "No se encontro resultados");
            }
            //console.log(this.dataSource);
          } else {
            //this.funciones.mensajeError("", data['mensaje']);
          }
          this.funciones.hideLoading();
        },
      error => {
        this.funciones.hideLoading();
      })
    } else {
      if (!this.funciones.onValidaVacio(this.vcPlaca)) {
        //this.funciones.mensajeAlerta('Alerta', 'Ingresar numero de placa');
        return;
      }
      this.funciones.showLoading();
      this.formularioService.postConsultaPlacaVehicular(data).subscribe( 
        (data: any) => {
          if (data['statuscode'] == 200) {
            var dataArr = data['data'];
            //this.dataSourceRows = data['data'];
            if (dataArr != null && dataArr.length > 0) {
              var dataTemp = [];
              var adquiriente = "";
              var transferente = "";
              var adquirienteArr = [];//{ 'adquiriente': [] };
              var transferenteArr = [];//{ 'transferente': [] };
                var row = dataArr[0];
                for (let j = 0; j < dataArr.length; j++) {
                  if (dataArr[j].intipo_condicion == 2) {
                    adquiriente += dataArr[j].vcpersona + ', ';
                    adquirienteArr.push({
                      'biActivo': false, 
                      'numero_servicio': dataArr[j].vcnumeroservicio,
                      'fecha': dataArr[j].fecha,
                      'vcNombre': dataArr[j].vcpersona, 
                      'vcTipoDocumento': dataArr[j].vctipodocumento,
                      'vcDocumento': dataArr[j].vcnumero_documento,
                      'vcNacionalidad': dataArr[j].vcnacionalidad,
                      'vcProfesionOcupacion': dataArr[j].vcprofesionocupacion,
                      'vcEstadoCivil': dataArr[j].vcestadocivil,
                      'vcDomicilio': dataArr[j].vcdomicilio,
                      'vcDistrito': dataArr[j].vcdistrito,
                      'vcProvincia': dataArr[j].vcprovincia,
                      'vcDepartamento': dataArr[j].vcdepartamento,
                      'vcRepresentante': dataArr[j].vcrepresentante
                    });
                  }
                  else if (dataArr[j].intipo_condicion == 1) {
                    transferente += dataArr[j].vcpersona + ', ';
                    transferenteArr.push({
                      'biActivo': false, 
                      'numero_servicio': dataArr[j].vcnumeroservicio,
                      'fecha': dataArr[j].fecha,
                      'vcNombre': dataArr[j].vcpersona, 
                      'vcTipoDocumento': dataArr[j].vctipodocumento,
                      'vcDocumento': dataArr[j].vcnumero_documento,
                      'vcNacionalidad': dataArr[j].vcnacionalidad,
                      'vcProfesionOcupacion': dataArr[j].vcprofesionocupacion,
                      'vcEstadoCivil': dataArr[j].vcestadocivil,
                      'vcDomicilio': dataArr[j].vcdomicilio,
                      'vcDistrito': dataArr[j].vcdistrito,
                      'vcProvincia': dataArr[j].vcprovincia,
                      'vcDepartamento': dataArr[j].vcdepartamento,
                      'vcRepresentante': dataArr[j].vcrepresentante
                    });
                  }
                }
                row.isDepositoCuenta = row.mp_deposito_cuenta == 0 ? true: false;
                row.isTransferenciaBancaria = row.mp_transferencia_bancaria == 0 ? true: false;
                row.isCheque = row.mp_cheque == 0 ? true: false;
                row.isEfectivo = row.mp_efectivo == 0 ? true: false;
                row.adquiriente = adquiriente;
                row.transferente = transferente;
                row.valorLet = this.funciones.NumeroALetras(row.valor);
                row.valorNum = this.funciones.formatNumberMoney(row.valor);
                row.sinbolo = row.moneda === "SOLES" ? "S/ " : "US$ ";
                row.moneda = row.moneda === "SOLES" ? row.moneda : 'DÓLARES AMERICANOS',
                row.adquirienteJson = adquirienteArr;
                row.transferenteJson = transferenteArr;
                row.kardex_numero = '';
                dataTemp.push(row);
              //this.dataSource = new MatTableDataSource<PeriodicElement>(dataTemp);
              //this.dataSource.paginator = this.paginator;
              this.dataSourceRows = dataTemp;
              console.log(dataTemp);
            } else {
              //this.funciones.mensajeAlerta("Alerta", "No se encontro resultados");
            }
            //console.log(this.dataSource);
          } else {
            //this.funciones.mensajeError("", data['mensaje']);
          }
          this.funciones.hideLoading();
        },
      error => {
        this.funciones.hideLoading();
      })
    }
  }

  async seleccionFile (archivo: File) {
    if (!archivo) {
      this.archivoSubir = null;
      return;
    }
    if (archivo.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      this.funciones.mensajeAlerta('Alerta', 'Archivo no valido, formato permitido (WORD)');
      return;
    }
    this.archivoSubir = archivo;
    const reader = new FileReader();
    const urlArchivoTemp = reader.readAsDataURL(archivo);
    reader.onloadend = () => {
      this.archivoTemp = reader.result;
      this.kardex_reg.archivo_byte = this.archivoTemp.split(',')[1];
    };
    this.kardex_reg.archivo_name = archivo.name.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '').trim();
    this.kardex_reg.archivo_type = archivo.type;
    this.kardex_reg.archivo_size = archivo.size;
  }

  async onSave(item: any) {
    if (this.kardex_reg.archivo_size === null || this.kardex_reg.archivo_size === 0) {
      this.funciones.mensajeAlerta('Alerta', 'Seleccione un Archivo');
      return;
    }
    if (!this.funciones.onValidaVacio(item.kardex_numero)) {
      this.funciones.mensajeAlerta('Alerta', 'Ingrese numero de Kardex');
      return;
    }
    var now = (new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate());
    var srt = "(ARRAY[";
    var adquiriente = '';
    var transferente = '';
    for (let a = 0; a < item.adquirienteJson.length; a++) {
      if (item.adquirienteJson[a].biActivo) {
        if (a > 0) { srt += ', ';}
        srt += "'(0, 0, " + item.adquirienteJson[a].numero_servicio + ", 1, " + this.onFormatFecha2() + ")'";
        adquiriente += (this.onFormatFecha(item.adquirienteJson[a].fecha)  + " | " +  item.adquirienteJson[a].vcDocumento + " | " + item.adquirienteJson[a].vcNombre + "<br>")
      }
    }

    if (adquiriente.length === 0) {
      this.funciones.mensajeAlerta('Alerta', ('Seleccionar minimo un ' + this.srtTipo2()));
      return;
    }
    srt += ', ';
    for (let a = 0; a < item.transferenteJson.length; a++) {
      if (item.transferenteJson[a].biActivo) {
        if (a > 0) { srt += ', ';}
        srt += "'(0, 0, " + item.transferenteJson[a].numero_servicio + ", 1, " + this.onFormatFecha2() + ")'";
        transferente += (this.onFormatFecha(item.transferenteJson[a].fecha)  + " | " +  item.transferenteJson[a].vcDocumento + " | " + item.transferenteJson[a].vcNombre + "<br>")
      }
    }

    if (transferente.length === 0) {
      this.funciones.mensajeAlerta('Alerta', ('Seleccionar minimo un ' + this.srtTipo1()));
      return;
    }

    srt += "])::kardex_detalle_numero_servicio[]"
    
    this.kardex_reg.numero_placa = item.vcplaca;
    this.kardex_reg.adquiriente = adquiriente;
    this.kardex_reg.transferente = transferente;
    this.kardex_reg.detalle_numero_servicio = srt;
    //this.kardex_reg.detalle_numero_servicio = this.detalle_numero_servicio;
    this.kardex_reg.kardex_numero = item.kardex_numero;
    
    this.funciones.showLoading();
    await this.formularioService.postInsertKardex(this.kardex_reg).subscribe(
      (data: any) => {
        this.funciones.hideLoading();
        if (data['statuscode'] == 200) {
          this.funciones.mensajeOk("", data['mensaje']);
          this.onBuscar();
        } else {
          this.funciones.mensajeError("", data['mensaje']);
        }
      },
      (error: any) => {
        this.funciones.hideLoading();
        this.funciones.mensajeError("", "No se pudo conectar con el servidor");
      }
    )
  }

  srtTipo1(): string {
    if (this.inTipo === 2)
      return 'DONANTE';
    if (this.inTipo === 3)
      return 'INTERVINIENTE 1';
    return 'TRANSFERENTE';
  }

  srtTipo2(): string {
    if (this.inTipo === 2)
      return 'DONATARIO';
    if (this.inTipo === 3)
      return 'INTERVINIENTE 2';
    return 'ADQUIRENTE';
  }

  async onBuscarKardex() {
    this.dataSourceKardex = null;
    var data = {
      numero_placa: this.numero_placa,
      kardex_numero: this.kardex_numero
    }
    this.funciones.showLoading();
    await this.formularioService.postListarKardex(data).subscribe(
      (data: any) => {
        this.funciones.hideLoading();
        if (data['statuscode'] == 200) {
          //this.dataSourceKardex = data['data'];
          this.dataSourceKardex = new MatTableDataSource<any>(data['data']);
          this.dataSourceKardex.paginator = this.paginator;
        } else {
          this.funciones.mensajeError("", data['mensaje']);
        }
      },
      (error: any) => {
        this.funciones.hideLoading();
        this.funciones.mensajeError("", "No se pudo conectar con el servidor");
      }
    )
  }

  async onDescargarKadex(item: any) {
    var dataSent = {
      idArchivo: item.idarchivo
    }
    this.funciones.showLoading();
    await this.formularioService.postDescargarKardex(dataSent).subscribe(
      (data: any) => {
        this.funciones.hideLoading();
        const blob = new Blob([data], { type: item.archivo_type });
        saveAs(blob, item.archivo_name);
      },
      (error: any) => {
        console.log(error);
        this.funciones.hideLoading();
        this.funciones.mensajeError(error.message.toString(), "Error");
      }
    )
  }

  onFormatFecha(fecha: any): string {
    let fec = new Date(fecha);
    return ((fec.getDate()).toString().padStart(2, '0') + "/" + (fec.getMonth() + 1).toString().padStart(2, '0') + "/" + fec.getFullYear());
  }

  onFormatFecha2(): string {
    let fec = new Date();
    return ((fec.getFullYear()) + "-" + (fec.getMonth() + 1).toString().padStart(2, '0') + "-" + fec.getDate().toString().padStart(2, '0'));
  }

  async onGenerar(element: any) {
    let url = environment.plantilla1;
    if (this.inTipo === 2)
      url = environment.plantilla2;
    else if (this.inTipo === 3)
      url = environment.plantilla3;
    this.funciones.showLoading();
    await loadFile((url),
            function (error, content) {
                if (error) {
                    throw error;
                }
                const zip = new PizZip(content);
                const doc = new Docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true,
                });
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                console.log(element);
                var adquiriente = [];
                var transferente = [];
                for (let a = 0; a < element.adquirienteJson.length; a++) {
                  if (element.adquirienteJson[a].biActivo) adquiriente.push(element.adquirienteJson[a]);
                }
                for (let a = 0; a < element.transferenteJson.length; a++) {
                  if (element.transferenteJson[a].biActivo) transferente.push(element.transferenteJson[a]);
                }
                doc.render({
                  vcMarca: element.vcmarca,
                  vcModelo: element.vcmodelo,
                  vcPlaca: element.vcplaca,
                  deMonto: element.valor,
                  vcMonto: element.valor,
                  vcTMoneda: element.moneda,
                  vcSMoneda: element.sinbolo,
                  vcMoneda: element.valorNum,
                  vcMonedaLetras: element.valorLet,
                  isDepositoCuenta: (element.isDepositoCuenta && element.isCheque ? false : element.isDepositoCuenta),
                  isTransferenciaBancaria:  (element.isTransferenciaBancaria && element.isCheque ? false : element.isTransferenciaBancaria),
                  isCheque: ((element.isDepositoCuenta || element.isTransferenciaBancaria) && element.isCheque ? false : element.isCheque),
                  isEfectivo: element.isEfectivo,
                  isChequeDeposito: (element.isDepositoCuenta && element.isCheque ? true : false),
                  isChequeTransferencia: (element.isTransferenciaBancaria && element.isCheque ? true : false),
                  adquiriente: adquiriente,
                  transferente: transferente,
                });
                const out = doc.getZip().generate({
                    type: "blob",
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                });
                // Output the document using Data-URI
                saveAs(out, "plantilla.docx");
            }
        );
    this.funciones.hideLoading();
  }

}
