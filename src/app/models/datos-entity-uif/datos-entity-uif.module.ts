import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class DatosEntityUifModule {
  id: number = 0;
  obigado_informar: number = 0;
  designo_oficial_cumplimiento: number = 0;
  expuesta25: number = 0;
  nombres: string = "";
  cargo: string = "";
  id_pais: number = 173;
  of_giro_negocio: boolean = false;
  of_prestamos_socios: boolean = false;
  of_venta_bien_inmueble: boolean = false;
  of_intermediacion_financiera: boolean = false;
  of_prestamo_bancario: boolean = false;
  of_prestamo_terceros: boolean = false;
  of_venta_activos: boolean = false;
  of_otros_escribir_of: boolean = false;
  of_otros_escribir_of_text: string = "";
  mp_efectivo: boolean = false;
  mp_deposito_cuenta: boolean = false;
  mp_bien_inmueble: boolean = false;
  mp_cheque: boolean = false;
  mp_transferencia_bancaria: boolean = false;
  mp_bien_mueble: boolean = false;
  mp_otros_describir: boolean = false;
  mp_otros_describir_text: string = "";
}
