import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LogInComponent } from '../log-in/log-in.component';
import { FormularioService } from '../../services/formulario.service';
import { Funciones } from '../../funciones/funciones';

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";
import { environment } from '../../../environments/environment';
import { MatPaginator, MatTableDataSource } from '@angular/material';

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

  kardexPlaca: any = null;

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
      }, 1000000);
    }
  }

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
                  debugger;
                  if (data['statuscode'] == 200) {
                    var dataArr2 = data['data'];
                    console.log (dataArr2);
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
        return;
      }
      this.funciones.showLoading();
      this.formularioService.postConsultaPlacaVehicular(data).subscribe(respuesta => {
          if (respuesta['statuscode'] == 200) {
            this.onProcesarDatos(respuesta['data']);
          } 
          this.funciones.hideLoading();
        },
      error => {
        this.funciones.hideLoading();
      })
    }
  }

  onProcesarDatos(data: any) {
    var adquirienteArr = [];
    var transferenteArr = [];
    if (data != null) {
      if (data.natural != null && data.natural.length > 0) {
        for (let a = 0; a < data.natural.length; a++) {
          data.natural[a].opciones_tipo_persona_natural = true;
          data.natural[a].opciones_tipo_persona_juridica = false;
          data.natural[a].isnoapoderado = (data.natural[a].isnoapoderado == 1) ? true : false;
          data.natural[a].isapoderado = (data.natural[a].isapoderado == 1) ? true : false;
          data.natural[a].basico_iscasado = (data.natural[a].basico_iscasado == 1) ? true : false;
          data.natural[a].basico_isnocasado = (data.natural[a].basico_isnocasado == 1) ? true : false;
          data.natural[a].isseparacionpatrimonio = (data.natural[a].isseparacionpatrimonio == 0) ? true : false;
          data.natural[a].isnoseparacionpatrimonio = (data.natural[a].isnoseparacionpatrimonio == 0) ? true : false;
          if (data.natural[a].opciones_tipo_condicion == 1) {
            transferenteArr.push(data.natural[a]);
          } else {
            adquirienteArr.push(data.natural[a]);
          }
        }
      }
      if (data.juridica != null && data.juridica.length > 0) {
        for (let a = 0; a < data.juridica.length; a++) {
          data.juridica[a].opciones_tipo_persona_natural = false;
          data.juridica[a].opciones_tipo_persona_juridica = true;
          if (data.juridica[a].opciones_tipo_condicion == 1) {
            transferenteArr.push(data.juridica[a]);
          } else {
            adquirienteArr.push(data.juridica[a]);
          }
        }
      }
      if ((adquirienteArr != null && adquirienteArr.length > 0) || transferenteArr != null && transferenteArr.length > 0) {
        let arrTemp = ((adquirienteArr != null && adquirienteArr.length > 0) ? adquirienteArr : transferenteArr)
        this.kardexPlaca = {
          bien_marca: arrTemp[0].bien_marca,
          bien_modelo: arrTemp[0].bien_modelo,
          bien_num_placa: arrTemp[0].bien_num_placa,
          bien_valor: arrTemp[0].bien_valor,
          opciones_created_at: arrTemp[0].opciones_created_at,
          
          isDepositoCuenta: (arrTemp[0].type == "JURIDICA" ? (arrTemp[0].entidad_uif_mp_deposito_cuenta == 0 ? true: false) : (arrTemp[0].mp_deposito_cuenta == 0 ? true: false)),
          isTransferenciaBancaria: (arrTemp[0].type == "JURIDICA" ? (arrTemp[0].entidad_uif_mp_transferencia_bancaria == 0 ? true: false) : (arrTemp[0].laborales_mp_transferencia_bancaria == 0 ? true: false)),
          isCheque: (arrTemp[0].type == "JURIDICA" ? (arrTemp[0].entidad_uif_mp_cheque == 0 ? true: false) : (arrTemp[0].laborales_mp_cheque == 0 ? true: false)),
          isEfectivo: (arrTemp[0].type == "JURIDICA" ? (arrTemp[0].entidad_uif_mp_efectivo == 0 ? true: false) : (arrTemp[0].laborales_mp_efectivo == 0 ? true: false)),
          
          valorLet: this.funciones.NumeroALetras(arrTemp[0].bien_valor),
          valorNum: this.funciones.formatNumberMoney(arrTemp[0].bien_valor),
          sinbolo: arrTemp[0].bien_moneda === "SOLES" ? "S/ " : "US$ ",
          moneda: arrTemp[0].bien_moneda === "SOLES" ? arrTemp[0].bien_moneda : 'DÓLARES AMERICANOS',
          adquirienteJson: adquirienteArr,
          transferenteJson: transferenteArr
        }
      }
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
                    linebreaks: true
                });
                
                console.log(element);
                var adquiriente = [];
                var transferente = [];
                for (let a = 0; a < element.adquirienteJson.length; a++) {
                  if (element.adquirienteJson[a].biActivo) adquiriente.push(element.adquirienteJson[a]);
                }
                for (let a = 0; a < element.transferenteJson.length; a++) {
                  if (element.transferenteJson[a].biActivo) transferente.push(element.transferenteJson[a]);
                }
                var datos = {
                  vcMarca: element.bien_marca,
                  vcModelo: element.bien_modelo,
                  vcPlaca: element.bien_num_placa,
                  deMonto: element.bien_valor,
                  vcMonto: element.bien_valor,
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
                };
                console.log(datos);
                doc.render(datos);
                const out = doc.getZip().generate({
                    type: "blob",
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                });
                saveAs(out, "plantilla.docx");
            }
        );
    this.funciones.hideLoading();
  }
}
