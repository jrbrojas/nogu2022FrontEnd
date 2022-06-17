import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class DatosBasicosModule {
  id: number = 0;
  num_documento: string = "";
  id_tipo_documento: number = 1;
  id_ubigeo: number = 0;
  extranjero: boolean = false;
  otro_documento: string = "";
  distrito: string = "";
  nombres: string = "";
  apellidos: string = "";
  pais_origen: string = "";
  ciudad: string = "";
  fecha_nacimiento: string = "";
  id_pais_nacionalidad: number = 173;
  id_estado_civil: number = 0;
  separa_patrimonio: number = 0;
  partida: string = "";
  sede: string = "";
  cuidad_origen: string = "";
  domicilio: string = "";
  telefono_uno: string = "";
  telefono_dos: string = "";
  correo_electronico: string = "";
  nombre_conyugue: string = "";
  nombre_conyugue_documento: string = "";
  conyugue_fecha_nacimiento: string = "";
  numero_servicio: string = "";
}

export class ModulePais {
  id: number = 0;
  nombre: string = "";
}
