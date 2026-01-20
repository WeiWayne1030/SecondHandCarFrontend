import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CarService } from '../../core/service/car.service';
import { BehaviorSubject } from 'rxjs';
import { Car } from './car.model';

const mockCars: Car[] = [
    { id: 1, name: 'Tesla Model 3', brand: 'Tesla', model: 'Model 3', price: 1, mileage: 1, year: 2022, location: 'A', status: 'A', imageUrl: '' },
    { id: 2, name: 'BMW 3 Series', brand: 'BMW', model: '3 Series', price: 1, mileage: 1, year: 2022, location: 'A', status: 'A', imageUrl: '' },
];

class MockCarService {
    private carsSubject = new BehaviorSubject<Car[]>(mockCars);
    getCars() {
        return this.carsSubject.asObservable();
    }
}

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomeComponent],
            imports: [FormsModule, RouterTestingModule],
            providers: [{ provide: CarService, useClass: MockCarService }]
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

    it('should initialize with full car list from service', () => {
        expect(component.filteredCars.length).toBe(2);
        expect(component.filteredCars.length).toEqual(mockCars.length);
    });

    it('should filter cars by search keyword', () => {
        component.searchKeyword = 'Tesla';
        component.searchCars();
        fixture.detectChanges();
        expect(component.filteredCars.length).toBe(1);
        expect(component.filteredCars[0].name).toContain('Tesla');

        component.searchKeyword = ''; // Reset
        component.searchCars();
        fixture.detectChanges();
        expect(component.filteredCars.length).toBe(2);
    });
});
