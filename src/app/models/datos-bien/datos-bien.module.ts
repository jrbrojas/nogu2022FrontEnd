import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class DatosBienModule {
  id: number = 0;
  tipo_bien: number = 0;
  tipo_transferencia: string = "";
  num_placa: string = "";
  marca: string = "";
  modelo: string = "";
  moneda: string = "";
  valor: number = 0;
  targeta_propiedad: number = 0;
  numero_servicio: number = 0;

  mp_compra_venta: boolean = false;
  mp_donacion: boolean = false;
  mp_anticipo_legitima: boolean = false;
  mp_permuta: boolean = false;
  mp_dacion_pago: boolean = false;

  mp_otro: boolean = false;
  mp_otros_describir: string = "";
  numero_tarjeta_propiedad: string = "";
  id_ubigeo = 0;
}
