import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class DatosEntityModule {
  id: number = 0;
  ruc: string = "";
  razonsocial: string = "";
  correo: string = "";
  direccion: string = "";
  telefono: string = "";
  principal_contribuyente: boolean = false;
  declaracion_jurada: boolean = false;
  comercial: boolean = false;
  industrial: boolean = false;
  construccion: boolean = false;
  transporte: boolean = false;
  pesca: boolean = false;
  intermediacion_financiera: boolean = false;
  hoteles_restaurantes: boolean = false;
  agricultura: boolean = false;
  ensenanza: boolean = false;
  suministro_electricidad_gas: boolean = false;
  otros_describir: string = "";
  otro_opcion: boolean = false;
  numero_servicio: boolean = false;
  partida_registral: string = "";
  sede_registral: string = "";
  id_distrito: number = 0;
}
