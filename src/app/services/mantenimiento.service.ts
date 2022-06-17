import { Injectable } from '@angular/core';
import { Methods } from '../config/methods';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class MantenimientoService {

    constructor(private methods: Methods) { }

    getListTipoDocumento() {
        return this.methods.getQuery('/mantenimiento/listtipodocumento')
            .pipe(map(data => data));
    }

    getListPaises() {
        return this.methods.getQuery('/mantenimiento/listpaises')
            .pipe(map(data => data));
    }

    getListEstadoCivil() {
        return this.methods.getQuery('/mantenimiento/listestadocivil')
            .pipe(map(data => data));
    }

    postUbigeo(data: any) {
        return this.methods.postQuery('/mantenimiento/ubigeo', data)
            .pipe(map(data => data));
    }

    postListRegistros(data: any) {
        return this.methods.postQuery('/mantenimiento/listregistros', data)
            .pipe(map(data => data));
    }

    postRegistroNaturalPDF(data: any) {
        return this.methods.postQuery('/mantenimiento/registrospdfnatural', data)
            .pipe(map(data => data));
    }
    postRegistroJuridicaPDF(data: any) {
        return this.methods.postQuery('/mantenimiento/registrospdfjuridica', data)
            .pipe(map(data => data));
    }

    postFillDocumento(data: any) {
        return this.methods.postQuery('/mantenimiento/fildocumento', data)
            .pipe(map(data => data));
    }

    getAllBooks() {
        return of(this.getListPaises());
    }
    saveBook(books) {
        console.log(JSON.stringify(books));
    }
}