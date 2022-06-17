import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioService } from '../../services/formulario.service';
import { LogInComponent } from '../log-in/log-in.component';
import { Funciones } from '../../funciones/funciones';

@Component({
  selector: 'app-listrepresentantescontribuyente',
  templateUrl: './listrepresentantescontribuyente.component.html',
  styleUrls: ['./listrepresentantescontribuyente.component.css']
})
export class ListrepresentantescontribuyenteComponent implements OnInit {
  carga: boolean = false;
  msm: string = "Cargando datos...";
  dataSource: any = [];
  dataSourceTemp: any = [];
  dataSourceTemp1: any = [];
  displayedColumns = ['nombre', 'eliminar'];
  constructor(private _router: Router, private funciones: Funciones, private formularioService: FormularioService, public logInComponent: LogInComponent) {
    window.scrollTo(0, 0);
    this.formularioService.verifyItemStatus();
    if (this.logInComponent.contribuyenteModuleArr != null && this.logInComponent.contribuyenteModuleArr.length > 0) {
      this.dataSourceTemp = this.logInComponent.contribuyenteModuleArr;
      for (let index = 0; index < this.dataSourceTemp.length; index++) {
        this.dataSource.push({ 'id': this.dataSourceTemp[index].id, 'nombre': this.dataSourceTemp[index].nombres, 'eliminar': index });
      }
    }
  }

  ngOnInit() {
  }

  onAgregar() {
    //this._router.navigate(['/ncontribuyente']);
    this.logInComponent.registroPosi = 14;
  }

  onReset() {
    this.logInComponent.onReset();
  }

  return() {
    this.logInComponent.registroPosi = 12;
  }

  onEliminar(element: any, item: number) {
    this.formularioService.verifyItemStatus();
      this.funciones.mensajeConfirmar('¿Está seguro?', 'Que desea eliminar', () => {
        this.formularioService.postDeleteContribuyente(element).subscribe(
          (data: any) => {
            this.funciones.hideLoading();
            if (data['statuscode'] == 200) {
              this.funciones.mensajeOk("", data['mensaje']);
              this.dataSource = [];
              this.dataSourceTemp1 = [];
              for (let index = 0; index < this.dataSourceTemp.length; index++) {
                if (index != item) {
                  this.dataSource.push({ 'nombre': this.dataSourceTemp[index].nombres, 'eliminar': index });
                  this.dataSourceTemp1.push(this.dataSourceTemp[index]);
                }
              }
              this.dataSourceTemp = this.dataSourceTemp1;
              this.logInComponent.contribuyenteModuleArr = this.dataSourceTemp1;
            } else {
              this.funciones.mensajeOk("", data['mensaje']);
            }
          }
        ), error => {
          this.funciones.hideLoading();
        }
      });
  }

  onLoadData() {
    this.formularioService.verifyItemStatus();
    //if (localStorage.getItem('tamite_opciones_tipo_tramite') == "2") {
    if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite == 2) {
      //this._router.navigate(['/bien']);
      this.logInComponent.registroPosi = 7;
    } else {
      //this._router.navigate(['/jurado']);
      this.logInComponent.registroPosi = 8;
    }
  }
}
