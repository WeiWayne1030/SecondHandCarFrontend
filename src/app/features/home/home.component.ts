import { Component, OnInit } from '@angular/core';
import { Car } from './car.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    cars: Car[] = [
        {
            id: 1,
            name: 'Tesla Model 3 2022',
            price: 1200000,
            mileage: 5000,
            year: 2022,
            location: '台北市',
            status: '極新',
            imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000'
        },
        {
            id: 2,
            name: 'BMW 3 Series 2020',
            price: 980000,
            mileage: 35000,
            year: 2020,
            location: '台中市',
            status: '良好',
            imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000'
        },
        {
            id: 3,
            name: 'Toyota RAV4 2021',
            price: 850000,
            mileage: 20000,
            year: 2021,
            location: '高雄市',
            status: '極新',
            imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=1000'
        },
        {
            id: 4,
            name: 'Mercedes-Benz C-Class 2019',
            price: 1100000,
            mileage: 42000,
            year: 2019,
            location: '桃園市',
            status: '良好',
            imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000'
        },
        {
            id: 5,
            name: 'Honda CR-V 2023',
            price: 1050000,
            mileage: 1000,
            year: 2023,
            location: '新竹市',
            status: '全新',
            imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'
        },
        {
            id: 6,
            name: 'Audi A4 2021',
            price: 1350000,
            mileage: 12000,
            year: 2021,
            location: '台北市',
            status: '極新',
            imageUrl: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&q=80&w=1000'
        }
    ];

    constructor() { }

    ngOnInit(): void {
    }
}
