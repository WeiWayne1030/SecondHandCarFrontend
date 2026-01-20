import { Component, OnInit, OnDestroy } from '@angular/core';
import { Car } from './car.model';
import { CarService } from '../../core/service/car.service'; // Import CarService
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
    cars: Car[] = []; // Will be populated from CarService
    filteredCars: Car[] = [];
    searchKeyword: string = '';
    private carsSubscription: Subscription = new Subscription();

    constructor(private carService: CarService) { } // Inject CarService

    ngOnInit(): void {
        this.carsSubscription = this.carService.getCars().subscribe(cars => {
            this.cars = cars;
            this.applyFilter(); // Apply filter when cars are loaded or updated
        });
    }

    ngOnDestroy(): void {
      this.carsSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
    }

    applyFilter(): void {
        const kw = this.searchKeyword?.trim().toLowerCase();
        if (!kw) {
            this.filteredCars = this.cars;
            return;
        }
        this.filteredCars = this.cars.filter(car =>
            car.name.toLowerCase().includes(kw) ||
            car.status.toLowerCase().includes(kw) ||
            car.location.toLowerCase().includes(kw) ||
            car.brand.toLowerCase().includes(kw) || // Added brand to search
            car.model.toLowerCase().includes(kw) // Added model to search
        );
    }

    // Filter cars based on search keyword (now calls applyFilter)
    searchCars(): void {
        this.applyFilter();
    }

    // Placeholder for reservation action
    reserveCar(car: Car): void {
        // TODO: integrate reservation flow
        console.log('Reserve car', car.id);
    }

    // Placeholder for adding to favorites
    addToFavorites(car: Car): void {
        // TODO: integrate favorite logic
        console.log('Add to favorites', car.id);
    }
}
