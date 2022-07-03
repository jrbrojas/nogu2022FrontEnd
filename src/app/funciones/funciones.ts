import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
@Injectable({
    providedIn: 'root'
})
export class Funciones {

    constructor(
        private spinner: NgxSpinnerService
    ) { }

    isAdministrador() {
        try {
            if (parseInt(localStorage.getItem('tipo')) === 1)
                return true;
            return false;
        } catch {
            return false;
        }
    }

    isFuncionario() {
        try {
            if (parseInt(localStorage.getItem('tipo')) === 2)
                return true;
            return false;
        } catch {
            return false;
        }
    }

    showLoading() {
        this.spinner.show();
    }

    hideLoading() {
        this.spinner.hide();
        return this;
    }

    mensajeOk(title: string, text: string, callBackOk?: any) {
        Swal.fire({
            title,
            icon: 'info',
            text
        }).then(resultado => {
            if (callBackOk) {
                callBackOk();
            }
        });
    }
    mensajeError(title: string, text: string, callBackOk?: any) {
        Swal.fire({
            title,
            icon: 'error',
            text
        }).then(resultado => {
            if (callBackOk) {
                callBackOk();
            }
        });
    }
    mensajeAlerta(title: string, text: string, callBackOk?: any) {
        Swal.fire({
            title,
            icon: 'warning',
            text
        }).then(resultado => {
            if (callBackOk) {
                callBackOk();
            }
        });
    }
    mensajeConfirmar(title: string, text: string, callBackOk?: any, callBackError?: any) {
        Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }).then((resultado) => {
            if (resultado.value) {
                if (callBackOk) {
                    callBackOk();
                }
            } else
                if (callBackError) {
                    callBackError();
                }
        });
    }

    onValidaVacio(cadena: any): boolean {
        try {
            if (cadena != undefined && cadena != null && cadena != '' && cadena.length > 0)
                return true;
        } catch { }
        return false;
    }

    Unidades(num) {
        switch (num) {
            case 1:
                return 'UN';
            case 2:
                return 'DOS';
            case 3:
                return 'TRES';
            case 4:
                return 'CUATRO';
            case 5:
                return 'CINCO';
            case 6:
                return 'SEIS';
            case 7:
                return 'SIETE';
            case 8:
                return 'OCHO';
            case 9:
                return 'NUEVE';
        }

        return '';
} //Unidades()

  Decenas(num) {

        let decena = Math.floor(num / 10);
        let unidad = num - (decena * 10);

        switch (decena) {
            case 1:
                switch (unidad) {
                    case 0:
                        return 'DIEZ';
                    case 1:
                        return 'ONCE';
                    case 2:
                        return 'DOCE';
                    case 3:
                        return 'TRECE';
                    case 4:
                        return 'CATORCE';
                    case 5:
                        return 'QUINCE';
                    default:
                        return 'DIECI' + this.Unidades(unidad);
                }
            case 2:
                switch (unidad) {
                    case 0:
                        return 'VEINTE';
                    default:
                        return 'VEINTI' + this.Unidades(unidad);
                }
            case 3:
                return this.DecenasY('TREINTA', unidad);
            case 4:
                return this.DecenasY('CUARENTA', unidad);
            case 5:
                return this.DecenasY('CINCUENTA', unidad);
            case 6:
                return this.DecenasY('SESENTA', unidad);
            case 7:
                return this.DecenasY('SETENTA', unidad);
            case 8:
                return this.DecenasY('OCHENTA', unidad);
            case 9:
                return this.DecenasY('NOVENTA', unidad);
            case 0:
                return this.Unidades(unidad);
        }
  } //Unidades()

  DecenasY(strSin, numUnidades) {
        if (numUnidades > 0)
            return strSin + ' Y ' + this.Unidades(numUnidades)

        return strSin;
  } //DecenasY()

  Centenas(num) {
        let centenas = Math.floor(num / 100);
        let decenas = num - (centenas * 100);

        switch (centenas) {
            case 1:
                if (decenas > 0)
                    return 'CIENTO ' + this.Decenas(decenas);
                return 'CIEN';
            case 2:
                return 'DOSCIENTOS ' + this.Decenas(decenas);
            case 3:
                return 'TRESCIENTOS ' + this.Decenas(decenas);
            case 4:
                return 'CUATROCIENTOS ' + this.Decenas(decenas);
            case 5:
                return 'QUINIENTOS ' + this.Decenas(decenas);
            case 6:
                return 'SEISCIENTOS ' + this.Decenas(decenas);
            case 7:
                return 'SETECIENTOS ' + this.Decenas(decenas);
            case 8:
                return 'OCHOCIENTOS ' + this.Decenas(decenas);
            case 9:
                return 'NOVECIENTOS ' + this.Decenas(decenas);
        }

        return this.Decenas(decenas);
  } //Centenas()

  Seccion(num, divisor, strSingular, strPlural) {
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let letras = '';

        if (cientos > 0)
            if (cientos > 1)
                letras = this.Centenas(cientos) + ' ' + strPlural;
            else
                letras = strSingular;

        if (resto > 0)
            letras += '';

        return letras;
  } //Seccion()

  Miles(num) {
        let divisor = 1000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMiles = this.Seccion(num, divisor, 'UN MIL', 'MIL');
        let strCentenas = this.Centenas(resto);

        if (strMiles == '')
            return strCentenas;

        return strMiles + ' ' + strCentenas;
  } //Miles()

  Millones(num) {
        let divisor = 1000000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMillones = this.Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
        let strMiles = this.Miles(resto);

        if (strMillones == '')
            return strMiles;

        return strMillones + ' ' + strMiles;
  } //Millones()

  NumeroALetras(num) {
        let data = {
            numero: num,
            enteros: Math.floor(num),
            centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
            letrasCentavos: '',
            letrasMonedaPlural: 'Y ' + (((Math.round(num * 100)) - (Math.floor(num) * 100))).toString().padStart(2, '0') + '/100',
            letrasMonedaSingular: 'Y ' + (((Math.round(num * 100)) - (Math.floor(num) * 100))).toString().padStart(2, '0') + '/100',
            /*letrasMonedaPlural: 'Y 00/100',
            letrasMonedaSingular: 'Y 00/100',*/
            letrasMonedaCentavoPlural: '', //'centimos',
            letrasMonedaCentavoSingular: '' //'centimo'
        };

        if (data.centavos > 0) {
            data.letrasCentavos = ''; //'CON ' + ((data.centavos == 1) ? (this.Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular) : (this.Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural));
        };

        if (data.enteros == 0)
            return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
        if (data.enteros == 1)
            return this.Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
        else
            return this.Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
  };
  
  formatNumberMoney(number: any) {
    number += '';
    let x = number.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2 + (x.length > 1 ? '' : '.00');
    //let mont = new Intl.NumberFormat('pe-pe', { style: 'currency', currency: 'PER' }).format(number)
    //return mont.substr(4, (mont.length-1));
  }
}