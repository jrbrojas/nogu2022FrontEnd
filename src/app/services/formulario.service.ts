import { Injectable } from '@angular/core';
import { Methods } from '../config/methods';
import { map } from 'rxjs/operators';
import { FormularioModels } from '../models/formulario/formulario.module';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FormularioService {

  public dataFormulario: FormularioModels = new FormularioModels();

  constructor(private methods: Methods, private _router: Router) { }

  getListProductos() {
    return this.methods.getQuery('/formulario/list')
      .pipe(map(data => data));
  }

  postInsertFormulaioA(data: any) {
    return this.methods.postQuery('/formulario/inserta', data)
      .pipe(map(data => data));
  }

  postInsertFormulaioB(data: any) {
    return this.methods.postQuery('/formulario/insertb', data)
      .pipe(map(data => data));
  }

  postUpdateFormulaioA(data: any) {
    return this.methods.postQuery('/formulario/updatea', data)
      .pipe(map(data => data));
  }

  postUpdateFormulaioB(data: any) {
    return this.methods.postQuery('/formulario/updateb', data)
      .pipe(map(data => data));
  }

  postDeleteContribuyente(data: any) {
    return this.methods.postQuery('/formulario/deleteContribuyente', data)
      .pipe(map(data => data));
  }

  postConsultaPlacaVehicular(data: any) {
    return this.methods.postQuery('/formulario/consultaPlacaVahicular', data)
      .pipe(map(data => data));
  }
  
  postInsertKardex(data: any) {
    return this.methods.postQuery('/formulario/insertKardex', data)
      .pipe(map(data => data));
  }
  
  postListarKardex(data: any) {
    return this.methods.postQuery('/formulario/listarKardex', data)
      .pipe(map(data => data));
  }

  postDescargarKardex(data: any) {
    return this.methods.postQueryDownload('/formulario/descargarKardex', data);
  }

  postDelete(data: any) {
    return this.methods.postQuery('/formulario/delete', data)
      .pipe(map(data => data));
  }

  verifyItemStatus() {
    var v = localStorage.getItem('windows');
    if (v != undefined && v != null && parseInt(v) == -1) {
      this._router.navigate(['/home']);
    }
  }
}
