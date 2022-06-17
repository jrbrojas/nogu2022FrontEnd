import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class DatosApoderadoModule {
  id: number = 0;
  num_documento: string = "";
  id_tipo_documento: number = 1;
  otro_documento: string = "";
  nombres: string = "";
  apellidos: string = "";
  id_ubigeo: number = 0;
  domicilio: string = "";
  nacionalidad: string = "";
  fecha_nacimiento: string = "";
  id_estado_civil: number = 0;
  profesion: string = "";
  registro_poder: string = "";
  sede_registral: string = "";
  celular: string = "";
  correo: string = "";
  conyugue_nombres: string = "";
  numero_servicio: string = "";
}
