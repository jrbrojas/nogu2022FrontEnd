import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatosApoderadoModule } from '../../models/datos-apoderado/datos-apoderado.module';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { FormularioService } from '../../services/formulario.service';
import { LogInComponent } from '../log-in/log-in.component';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-datosapoderado',
  templateUrl: './datosapoderado.component.html',
  styleUrls: ['./datosapoderado.component.css']
})
export class DatosapoderadoComponent implements AfterViewInit, OnInit {

  public ubigeoCtrl: FormControl = new FormControl();
  public ubigeoFilterCtrl: FormControl = new FormControl();
  @ViewChild('singleSelect', { static: true }) singleSelectUbigeo: MatSelect;
  private _onDestroyUbigeo = new Subject<void>();
  UbigeoList: any;
  public filteredUbigeo: ReplaySubject<any> = new ReplaySubject<any>(1);
  standalone: true;
  data_documento: any;
  data_paises: any;
  data_estadocivil: any;
  datosApoderadoModule: DatosApoderadoModule = new DatosApoderadoModule();

  constructor(
    private _router: Router,
    private mantenimientoService: MantenimientoService,
    public logInComponent: LogInComponent,
    private formularioService: FormularioService) {
    this.formularioService.verifyItemStatus();
    window.scrollTo(0, 0);
    var dat = { 'id': 0 };
    this.mantenimientoService.postUbigeo(dat).subscribe(
      (data: any) => {
        this.UbigeoList = data["data"];
        localStorage.setItem('ubigeo', JSON.stringify(data["data"]));
        this.filteredUbigeo.next(this.UbigeoList.slice());
        for (let a = 0; a < this.UbigeoList.length; a++) {
          if (this.UbigeoList[a].id === this.logInComponent.datosApoderadoModuleSend.id_ubigeo) {
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

    this.mantenimientoService.getListTipoDocumento().subscribe(
      (data: any) => {
        this.data_documento = data['data'];
        this.mantenimientoService.getListPaises().subscribe(
          (data: any) => {
            this.data_paises = data['data'];
            this.mantenimientoService.getListEstadoCivil().subscribe(
              (data: any) => {
                this.data_estadocivil = data['data'];
              }
            );
          }
        );
      }
    );
  }

  private filterUbigeo() {
    if (!this.UbigeoList) {
      return;
    }
    let search = this.ubigeoFilterCtrl.value;
    if (!search) {
      this.filteredUbigeo.next(this.UbigeoList.slice());
      this.logInComponent.datosApoderadoModuleSend.id_ubigeo = this.ubigeoCtrl.value == null ? 0 : this.ubigeoCtrl.value.id;
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredUbigeo.next(
      this.UbigeoList.filter(bank => bank.nombre.toLowerCase().indexOf(search) > -1)
    );
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

  ngOnInit() {
  }

  datosbien() {
    if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite == 2) {
      this.logInComponent.registroPosi = 7;
      //this._router.navigate(['/bien']);
    }
    else {
      this.logInComponent.registroPosi = 8;
      //this._router.navigate(['/jurado']);
    }
  }

  onReset() {
    this.logInComponent.onReset();
  }

  return() {
    this.logInComponent.registroPosi = 2;
  }

  next() {
    this.logInComponent.datosApoderadoModuleSend.id_ubigeo = this.ubigeoCtrl.value == null ? 0 : this.ubigeoCtrl.value.id;
    if (this.logInComponent.datosTamiteOpcionesModuleSend.tipo_tramite == 2) {
      this.logInComponent.registroPosi = 7;
      //this._router.navigate(['/bien']);
    }
    else {
      this.logInComponent.registroPosi = 4;
      //this._router.navigate(['/jurado']);
    }
  }
}
