import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IsLocalStoregeServiceService {

  constructor() { }

  IsLocalStorege() {
    if (typeof localStorage === 'object') {
      try {
        localStorage.setItem('localStorage', "localStorag");
        localStorage.removeItem('localStorage');
      } catch (e) {
        Storage.prototype._setItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function () { };
        alert('Su navegador web no admite el almacenamiento de configuraciones localmente. En Safari, la causa más común de esto es usar el "Modo de navegación privada". Es posible que algunas configuraciones no se guarden o que algunas funciones no funcionen correctamente.');
      }
    }
  }
}
