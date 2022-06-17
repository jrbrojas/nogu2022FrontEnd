import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginModule } from '../../models/login/login.module';
import { LoginService } from '../../services/login.service';
import { FormularioService } from '../../services/formulario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  loginModule: LoginModule = new LoginModule();
  hide = true;
  constructor(private _router: Router, private loginService: LoginService, private formularioService: FormularioService) {
    window.scrollTo(0, 0);
    //localStorage.setItem('windows', '-1');
    var token = localStorage.getItem('token');
    if (token != undefined && token != null && token != '')
      this._router.navigate(['/lregistros']);
  }

  ngOnInit() {
  }

  onLogin() {
    this.loginService.postLogin(this.loginModule).subscribe(
      (data: any) => {
        if (data['statuscode'] == 200) {
          localStorage.setItem('tipo', data['tipo']);
          localStorage.setItem('token', data['token']);
          window.location.reload();
          this._router.navigate(['/lregistros']);
        } else {
          alert(data['mensaje']);
        }
      },
      error => {
        alert("Error de comunicación");
      }
    )
  }

}
