import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LoginComponent],
            imports: [FormsModule]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a login card', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.login-card')).toBeTruthy();
    });

    it('should bind email input to loginData', async () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const emailInput = compiled.querySelector('input[name="email"]') as HTMLInputElement;

        emailInput.value = 'test@example.com';
        emailInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(component.loginData.email).toBe('test@example.com');
    });
});
