import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/service/authentication.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    error?: string;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authService: AuthenticationService
    ) {
        // 如果已經登入，直接跳轉到首頁
        if (this.authService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    get f() { return this.loginForm.controls; }

    get showUsernameError() {
        const control = this.f['username'];
        return control.invalid && (control.dirty || control.touched);
    }

    get showPasswordError() {
        const control = this.f['password'];
        return control.invalid && (control.dirty || control.touched);
    }

    onSubmit() {
        // 如果表單無效，則停止
        if (this.loginForm.invalid) {
            return;
        }

        this.error = undefined;
        const { username, password } = this.loginForm.value;

        this.authService.login(username, password)
            .pipe()
            .subscribe(user => {
                if (user) {
                    // 登入成功，導航到首頁
                    this.router.navigate(['/']);
                    alert('登入成功');
                } else {
                    // 登入失敗，顯示錯誤訊息
                    this.error = '帳號或密碼錯誤';
                }
            });
    }
}
