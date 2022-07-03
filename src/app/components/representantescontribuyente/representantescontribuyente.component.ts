import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { ContribuyenteModule } from '../../models/contribuyente/contribuyente.module';
import { FormularioService } from '../../services/formulario.service';
import { LogInComponent } from '../log-in/log-in.component';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'app-representantescontribuyente',
  templateUrl: './representantescontribuyente.component.html',
  styleUrls: ['./representantescontribuyente.component.css']
})
export class RepresentantescontribuyenteComponent implements  AfterViewInit, OnDestroy {
  standalone: true;

  separacions: any = [{ 'id': 0, 'nombre': 'SI' }, { 'id': 1, 'nombre': 'NO' }];
  public ubigeoCtrl: FormControl = new FormControl();
  public ubigeoFilterCtrl: FormControl = new FormControl();
  @ViewChild('singleSelect', { static: true }) singleSelectUbigeo: MatSelect;
  private _onDestroyUbigeo = new Subject<void>();
  UbigeoList: any;
  public filteredUbigeo: ReplaySubject<any> = new ReplaySubject<any>(1);

  data_documento: any;
  data_paises: any;
  data_estadocivil: any;

  Roles: any = ['Soltero (a)', 'Casado (a)', 'Viudo (a)', 'Divorciado (a)'];
  tipo_documento: string;
  tipo_estado: string;
  separacion_patrimonio: string;
  seasons: string[] = ['DNI', 'Pasaporte', 'Carnet Extranjeria', 'Otro'];

  constructor(private _router: Router, private mantenimientoService: MantenimientoService, private formularioService: FormularioService, public logInComponent: LogInComponent) {
    window.scrollTo(0, 0);
    this.formularioService.verifyItemStatus();
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
    var dat = { 'id': 0 };
    this.mantenimientoService.postUbigeo(dat).subscribe(
      (data: any) => {
        this.UbigeoList = data["data"];
        localStorage.setItem('ubigeo', JSON.stringify(data["data"]));
        this.filteredUbigeo.next(this.UbigeoList.slice());
        for (let a = 0; a < this.UbigeoList.length; a++) {
          if (this.UbigeoList[a].id === this.logInComponent.contribuyenteModule.id_distrito) {
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

  private filterUbigeo() {

    if (!this.UbigeoList) {
      return;
    }
    // get the search keyword
    let search = this.ubigeoFilterCtrl.value;
    if (!search) {
      this.filteredUbigeo.next(this.UbigeoList.slice());
      this.logInComponent.contribuyenteModule.id_distrito = this.ubigeoCtrl.value == null ? 0 : this.ubigeoCtrl.value.id;
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
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

  ngOnDestroy() {
    this._onDestroyUbigeo.next();
    this._onDestroyUbigeo.complete();
  }

  onReset() {
    this.logInComponent.onReset();
  }

  return() {
    this.logInComponent.registroPosi = 13;
  }

  guardar() {
    this.formularioService.verifyItemStatus();
    this.logInComponent.contribuyenteModule.otro_documento = this.logInComponent.contribuyenteModule.otro_documento.toUpperCase();
    this.logInComponent.contribuyenteModule.numero_documento = this.logInComponent.contribuyenteModule.numero_documento.toUpperCase();
    this.logInComponent.contribuyenteModule.nombres = this.logInComponent.contribuyenteModule.nombres.toUpperCase();
    this.logInComponent.contribuyenteModule.domicilio = this.logInComponent.contribuyenteModule.domicilio.toUpperCase();
    this.logInComponent.contribuyenteModule.profecion_ocupacion = this.logInComponent.contribuyenteModule.profecion_ocupacion.toUpperCase();
    this.logInComponent.contribuyenteModule.inscripcion_registral = this.logInComponent.contribuyenteModule.inscripcion_registral.toUpperCase();
    this.logInComponent.contribuyenteModule.telefono = this.logInComponent.contribuyenteModule.telefono.toUpperCase();
    this.logInComponent.contribuyenteModule.telefono_dos = (this.logInComponent.contribuyenteModule.telefono_dos == undefined ? '' : this.logInComponent.contribuyenteModule.telefono_dos.toUpperCase());
    this.logInComponent.contribuyenteModule.id_distrito = this.logInComponent.contribuyenteModule.id_distrito;
    if (!this.logInComponent.contribuyenteModule.biEdit) {
      this.logInComponent.contribuyenteModuleArr.push(this.logInComponent.contribuyenteModule);
      this.logInComponent.contribuyenteModule = new ContribuyenteModule();
    }
    //this._router.navigate(['/lcontribuyente']);
    this.logInComponent.registroPosi = 13;
  }

  onValida(): boolean {
    if (this.logInComponent.contribuyenteModule.numero_documento.length === 0) return false;
    if (this.logInComponent.contribuyenteModule.nombres.length === 0) return false;
    if (this.logInComponent.contribuyenteModule.id_estado_civil === 0) return false;
    if (this.logInComponent.contribuyenteModule.id_distrito === 0) return false;
    /*if (this.logInComponent.contribuyenteModule.id_estado_civil === 2 || this.logInComponent.contribuyenteModule.id_estado_civil === 5) {
      if (this.logInComponent.contribuyenteModule.partida.length === 0) return false;
      if (this.logInComponent.contribuyenteModule.sede.length === 0) return false;
      if (this.logInComponent.contribuyenteModule.nombre_conyugue.length === 0) return false;
      if (this.logInComponent.contribuyenteModule.nombre_conyugue_documento.length === 0) return false;
      if (this.logInComponent.contribuyenteModule.conyugue_fecha_nacimiento.length === 0) return false;
    }*/
    return true;
  }
}
