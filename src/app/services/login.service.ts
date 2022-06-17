import { Injectable } from '@angular/core';
import { Methods } from '../config/methods';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    constructor(private methods: Methods) { }

    postLogin(login: any) {
        return this.methods.postQuery('/usuario/login', login)
            .pipe(map(data => data));
    }
}
