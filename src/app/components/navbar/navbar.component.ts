import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IsLocalStoregeServiceService } from '../../services/is-local-storege-service.service';

var isMobile = {
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
};
  
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  year: number = 0;
  tipo: boolean = false;
  tipoIOS: boolean = false;
  constructor(private _router: Router, private isLocalStoregeService: IsLocalStoregeServiceService) {
    window.scrollTo(0, 0);
    var f = new Date();
    this.year = f.getFullYear();
    if (isMobile.iOS()) {
      this.tipoIOS = true;
    }
    this.isLocalStoregeService.IsLocalStorege();
    if (this.getBrowserName() == 'safari') {
      this.tipoIOS = true;
    }
    var token = localStorage.getItem('token');
    if (token != undefined && token != null && token != '') {
      this.estado(true);
    } else {
      this.estado(false);
    }
  }

  public getBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }

  estado(value) {
    this.tipo = value;
  }

  validar() {
    window.location.reload();
    if (this.tipo) {
      localStorage.setItem('token', '');
    }
    this._router.navigate(['/login']);
  }

  lista() {
    this._router.navigate(['/lregistros']);
  }

  plantillas() {
    this._router.navigate(['/plantillas']);
  }

  registro() {
    this._router.navigate(['/home']);
  }

  ngOnInit() {
  }

}
