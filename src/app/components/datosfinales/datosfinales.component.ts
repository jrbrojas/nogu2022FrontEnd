import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-datosfinales',
  templateUrl: './datosfinales.component.html',
  styleUrls: ['./datosfinales.component.css']
})
export class DatosfinalesComponent implements OnInit {
  serie: string;
  tipo: string;
  constructor(private activatedRote: ActivatedRoute) {
    window.scrollTo(0, 0);
    this.tipo = localStorage.getItem('numero_servicio_update');
    this.activatedRote.params.subscribe((parans) => {
      this.serie = parans['serie'];
    });
  }

  ngOnInit() {
  }

}
