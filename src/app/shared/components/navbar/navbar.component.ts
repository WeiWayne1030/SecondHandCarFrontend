import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/service/authentication.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    isLoggedIn$: Observable<boolean> | undefined;

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.isLoggedIn$ = this.authService.currentUser$.pipe(
            map(user => !!user)
        );
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
        alert('登出成功');
    }
}
