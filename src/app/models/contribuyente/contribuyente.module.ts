import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ContribuyenteModule {
  id: number = 0
  id_tipo_documento: number = 1;
  otro_documento: string = "";
  numero_documento: string = "";
  nombres: string = "";
  fecha_nacimiento: string = "";
  id_pais_nacionalidad: number = 173;
  id_estado_civil: number = 0;
  domicilio: string = "";
  profecion_ocupacion: string = "";
  telefono: string = "";
  telefono_dos: string = "";
  inscripcion_registral: string = "";
  id_distrito: number = 0;
  ////////////////
  separa_patrimonio: number = 0;
  partida: string = "";
  sede: string = "";
  nombre_conyugue: string = "";
  nombre_conyugue_documento: string = "";
  conyugue_fecha_nacimiento: string = "";
  ////////////////
  numero_servicio: number = 0;
  biEdit: boolean = false;
}
