import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomeComponent],
            imports: [RouterTestingModule]
        })
            .compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render car cards based on dummy data', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const carCards = compiled.querySelectorAll('.car-card');
        expect(carCards.length).toBeGreaterThan(0);
        expect(carCards.length).toBe(component.cars.length);
    });

    it('should show the correct price for the first car', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const firstCarPrice = compiled.querySelector('.car-price')?.textContent;
        // The dummy price for the first car is 1,200,000, which becomes $1,200,000 with pipes
        expect(firstCarPrice).toContain('1,200,000');
    });
});
