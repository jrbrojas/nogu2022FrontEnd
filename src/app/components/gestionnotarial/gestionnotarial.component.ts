import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { LogInComponent } from '../log-in/log-in.component';
import { FormularioService } from '../../services/formulario.service';
import { Funciones } from '../../funciones/funciones';

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
  selector: 'app-gestionnotarial',
  templateUrl: './gestionnotarial.component.html',
  styleUrls: ['./gestionnotarial.component.css']
})
export class GestionnotarialComponent implements OnInit {

  movil: boolean = false;
  tipo: boolean = false;
  tipoMenu: number = 1;

  constructor(
    private _router: Router,
    private mantenimientoService: MantenimientoService,
    public logInComponent: LogInComponent,
    private formularioService: FormularioService,
    public funciones: Funciones

  ) {
    if (isMobile.any())
      this.movil = true;
    else
      this.movil = false;
    window.scrollTo(0, 0);
    //localStorage.setItem('windows', '-1');
    var token = localStorage.getItem('token');
    if (token == undefined || token == null || token == '') {
      this._router.navigate(['/login']);
    } 
   }

  ngOnInit() {
  }

  opcionMenu(tipo: number) {
    this.tipoMenu = tipo;
  }

  validar() {
    window.location.reload();
    if (this.tipo) {
      localStorage.setItem('token', '');
    }
    this._router.navigate(['/login']);
  }

  lista() {
    this._router.navigate(['/gestionnotarial']);
  }

  registro() {
    this._router.navigate(['/home']);
  }

}
