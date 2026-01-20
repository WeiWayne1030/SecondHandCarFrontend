import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/service/authentication.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/core/models/user.model';
import { MenuItem } from 'primeng/api'; // Import MenuItem

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    isLoggedIn$: Observable<boolean> | undefined;
    user$: Observable<User | null> | undefined;
    userMenuItems: MenuItem[] = []; // Declare userMenuItems

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.isLoggedIn$ = this.authService.currentUser$.pipe(
            map(user => !!user)
        );
        this.user$ = this.authService.currentUser$;

        // Build user menu items dynamically
        this.user$.subscribe(user => {
            if (user) {
                this.userMenuItems = [
                    {
                        label: '我的刊登',
                        icon: 'pi pi-list',
                        routerLink: '/my-listings'
                    },
                    {
                        label: '我的收藏',
                        icon: 'pi pi-heart',
                        routerLink: '/my-favorites'
                    },
                    {
                        separator: true
                    },
                    {
                        label: '登出',
                        icon: 'pi pi-sign-out',
                        command: () => {
                            this.logout();
                        }
                    }
                ];
            } else {
                this.userMenuItems = []; // Clear menu if not logged in
            }
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
        alert('登出成功');
    }
}
