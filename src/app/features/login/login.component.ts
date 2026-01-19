import { Component } from '@angular/core';
import { RouteStateService } from '../../core/service/route-state.service';
import { ActivatedRoute, Params } from '@angular/router';

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

    constructor(private route: ActivatedRoute, private routeStateService: RouteStateService) {
    }

    onSubmit() {
        console.log('Login submitted:', this.loginData);
        alert('登入成功 (Dummy Login)');
        const url = this.getRedirectUrl();
        const routeData = this.getRouteData(url);
        this.routeStateService.navigateTo(url, routeData);
    }

    private getQueryParams(): Params {
        const paramsObj = this.route.snapshot.queryParams;
        return paramsObj;
    }

    private getRedirectUrl(): string {
        const redirectUrl = this.getQueryParams()['redirectPath'] ?? '/';
        return redirectUrl;
    }

    private getRouteData(url: string): any {
        const stateData = this.routeStateService.state?.data;
        const storageData = this.routeStateService.getRouteData(url)?.data;
        const routeData = stateData ?? storageData ?? {};
        return routeData;
    }
}
