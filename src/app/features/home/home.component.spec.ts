import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomeComponent],
            imports: [FormsModule, RouterTestingModule]
        })
            .compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render hero section title', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.hero-section h1')?.textContent).toContain('尋找您的理想座駕');
    });

    it('should initialize with full car list', () => {
        expect(component.filteredCars.length).toBe(6);
        expect(component.filteredCars.length).toEqual(component.cars.length);
    });

    it('should filter cars by search keyword', () => {
        component.searchCars('Tesla');
        fixture.detectChanges();
        expect(component.filteredCars.length).toBe(1);
        expect(component.filteredCars[0].name).toContain('Tesla');

        component.searchCars(''); // Reset
        fixture.detectChanges();
        expect(component.filteredCars.length).toBe(6);
    });
});
