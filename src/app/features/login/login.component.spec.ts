import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthenticationService } from '../../core/service/authentication.service';
import { User, UserRole } from '../../core/models/user.model';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let mockAuthService: Partial<AuthenticationService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let currentUserValueSpy: jasmine.Spy;

    const mockUser: User = { id: 1, username: 'buyer', role: UserRole.Buyer, name: '我是買家' };

    beforeEach(async () => {
        mockAuthService = {
            login: jasmine.createSpy('login'),
            get currentUserValue() { return null; }
        };
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [LoginComponent],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: AuthenticationService, useValue: mockAuthService },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        // Spy on the property of the mock object BEFORE component creation
        currentUserValueSpy = spyOnProperty(mockAuthService, 'currentUserValue', 'get');
    });

    // Helper function to create component to avoid repetition
    const createComponent = () => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    it('should create', () => {
        currentUserValueSpy.and.returnValue(null);
        createComponent();
        expect(component).toBeTruthy();
    });

    it('should have an invalid form when empty', () => {
        currentUserValueSpy.and.returnValue(null);
        createComponent();
        expect(component.loginForm.valid).toBeFalsy();
    });

    it('should call authService.login on submit with form values', () => {
        currentUserValueSpy.and.returnValue(null);
        createComponent();
        (mockAuthService.login as jasmine.Spy).and.returnValue(of(null));

        component.loginForm.controls['username'].setValue('testuser');
        component.loginForm.controls['password'].setValue('password');
        component.onSubmit();

        expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'password');
    });

    it('should navigate to home on successful login', () => {
        currentUserValueSpy.and.returnValue(null);
        createComponent();
        (mockAuthService.login as jasmine.Spy).and.returnValue(of(mockUser));

        component.loginForm.controls['username'].setValue('buyer');
        component.loginForm.controls['password'].setValue('password');
        component.onSubmit();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        expect(component.error).toBeUndefined();
    });

    it('should display an error message on failed login', () => {
        currentUserValueSpy.and.returnValue(null);
        createComponent();
        (mockAuthService.login as jasmine.Spy).and.returnValue(of(null));

        component.loginForm.controls['username'].setValue('wrong');
        component.loginForm.controls['password'].setValue('user');
        component.onSubmit();

        expect(routerSpy.navigate).not.toHaveBeenCalled();
        expect(component.error).toBe('帳號或密碼錯誤');
    });

    it('should redirect to home if already logged in', () => {
        // --- THIS IS THE KEY CHANGE ---
        // 1. Configure the spy FIRST
        currentUserValueSpy.and.returnValue(mockUser);
        // 2. THEN create the component, which calls the constructor
        createComponent();
        
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    describe('Error Handling Getters', () => {
        beforeEach(() => {
            currentUserValueSpy.and.returnValue(null);
            createComponent();
        });

        it('should have showUsernameError return false initially', () => {
            expect(component.showUsernameError).toBeFalse();
        });

        it('should have showUsernameError return true if username is touched and invalid', () => {
            const usernameControl = component.loginForm.controls['username'];
            usernameControl.markAsTouched();
            fixture.detectChanges();
            expect(component.showUsernameError).toBeTrue();
        });

        it('should have showPasswordError return false initially', () => {
            expect(component.showPasswordError).toBeFalse();
        });

        it('should have showPasswordError return true if password is touched and invalid', () => {
            const passwordControl = component.loginForm.controls['password'];
            passwordControl.markAsTouched();
            fixture.detectChanges();
            expect(component.showPasswordError).toBeTrue();
        });

        it('should not show username error message initially', () => {
            const errorEl = fixture.nativeElement.querySelector('.alert.alert-danger div');
            expect(errorEl).toBeNull();
        });

        it('should show username error message when username is touched and invalid', () => {
            const usernameControl = component.loginForm.controls['username'];
            usernameControl.markAsTouched();
            fixture.detectChanges();

            const errorEl = fixture.nativeElement.querySelector('.alert.alert-danger div');
            expect(errorEl.textContent).toContain('帳號為必填欄位');
        });

        it('should show password error message when password is touched and invalid', () => {
            const passwordControl = component.loginForm.controls['password'];
            passwordControl.markAsTouched();
            fixture.detectChanges();

            // Find all error messages and check the second one
            const errorElements = fixture.nativeElement.querySelectorAll('.alert.alert-danger div');
            // In this specific case, only one error message will appear at a time because we only touch one control.
            // If both were touched, we'd need to be more specific.
            expect(errorElements[0].textContent).toContain('密碼為必填欄位');
        });
    });
});
