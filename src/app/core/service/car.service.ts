import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Car } from '../../features/home/car.model'; // Import the Car interface

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private _cars: Car[] = [
    { id: 1, name: 'Toyota Corolla', brand: 'Toyota', model: 'Corolla', price: 250000, mileage: 80000, year: 2018, location: 'Taipei', status: 'Available', imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Toyota' },
    { id: 2, name: 'Honda Civic', brand: 'Honda', model: 'Civic', price: 300000, mileage: 60000, year: 2019, location: 'Taichung', status: 'Available', imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Honda' },
    { id: 3, name: 'Nissan Sentra', brand: 'Nissan', model: 'Sentra', price: 200000, mileage: 100000, year: 2017, location: 'Kaohsiung', status: 'Available', imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Nissan' }
  ];
  private carsSubject: BehaviorSubject<Car[]> = new BehaviorSubject(this._cars);
  public cars$: Observable<Car[]> = this.carsSubject.asObservable();

  constructor() { }

  getCars(): Observable<Car[]> {
    return this.cars$;
  }

  addCar(car: Omit<Car, 'id' | 'status' | 'imageUrl'>): void {
    const newCar: Car = {
      ...car,
      id: this._cars.length > 0 ? Math.max(...this._cars.map(c => c.id)) + 1 : 1,
      status: 'Available', // Default status for new cars
      imageUrl: 'https://via.placeholder.com/150/CCCCCC/000000?text=NewCar' // Default image for new cars
    };
    this._cars.push(newCar);
    this.carsSubject.next([...this._cars]); // Emit the updated list
  }
}
