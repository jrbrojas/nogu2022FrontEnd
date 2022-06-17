import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

export const keyRecaptchaClient = "6LcSYscZAAAAAD3AnCSlBK7CR6pa7oFC7x-_p7Bs";
export const keyRecaptchaServer = "6LcSYscZAAAAAJ13MZM1qZS3EHvc_4x7gGSobShr";

@Injectable({
    providedIn: 'root'
})
export class Methods {

    //url: string = `http://localhost:3000/api/v1`;
    //url: string = `http://3.220.160.116:3000/api/v1`;
    //url: string = `https://nogudatos.notaria.pe:3000/api/v1`;
    url: string = `https://nogudatos.notaria.pe:3001/api/v1`;
    httpHeaders: HttpHeaders = new HttpHeaders();

    constructor(private http: HttpClient) { }

    headersConfig() {
        return new HttpHeaders({
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            "Authorization": "Bearer " + localStorage.getItem('token')
        });
    }

    getQuery(api: string) {
        const headers = this.headersConfig();
        //return this.http.get(api, { headers });
        return this.http.get(this.url + api);
    }

    postQuery(api: string, models: any) {
        /*const headers = new HttpHeaders({
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        });*/

        const httpOptions = {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            })
        };

        let body = { models };
        return this.http.post(this.url + api, body);
        //return this.http.post(this.url + api, body);
    }
    
    postQueryDownload(api: string, models: any) {
        /*const headers = new HttpHeaders({
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        });*/

        const httpOptions = {
            headers: new HttpHeaders({
                'responseType': 'blob',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            })
        };

        let body = { models };
        return this.http.post(this.url + api, body, { responseType: "arraybuffer" });
        //return this.http.post(this.url + api, body);
    }
}
