import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class DatosLaboralesModule {
  id: number = 0;
  profesion: string = "";
  centro_trabajo: string = "";
  funcion_publica: number = 0;
  cargo_publico: string = "";
  familiar_cargo: number = 0;
  familiar_nombres: string = "";
  familiar_car: string = "";
  id_familiar_pais: number = 173;
  informar_uif: number = 0;
  oficial_cumplimiento: number = 0;
  numero_servicio: number = 0;
  of_haberes: number = 0;
  of_prestamos_familiares: boolean = false;
  of_venta_bien_inmieble: boolean = false;
  of_rentas: boolean = false;
  of_donacion: boolean = false;
  of_donacion_pago: boolean = false;
  of_prestamos_bancario: boolean = false;
  of_herencia: boolean = false;
  of_venta_vehiculo: boolean = false;
  of_comercio: boolean = false;
  of_otros_describir: boolean = false;
  of_otros_describir_text: string = "";
  mp_efectivo: boolean = false;
  mp_deposito_cuenta: boolean = false;
  mp_bien_inmueble: boolean = false;
  mp_cheque: boolean = false;
  mp_transferencia_bancaria: boolean = false;
  mp_bien_mueble: boolean = false;
  mp_otros_describir: boolean = false;
  mp_otros_describir_text: string = "";
}
