import { Component } from '@angular/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loginData = {
        email: '',
        password: ''
    };

    onSubmit() {
        console.log('Login submitted:', this.loginData);
        alert('登入成功 (Dummy Login)');
    }
}
