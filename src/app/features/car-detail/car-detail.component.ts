import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-car-detail',
    templateUrl: './car-detail.component.html',
    styleUrls: ['./car-detail.component.css']
})
export class CarDetailComponent implements OnInit {
    car: any;

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        // Dummy data for detail
        this.car = {
            id: id,
            name: 'Tesla Model 3 2022',
            price: 1200000,
            mileage: 5000,
            year: 2022,
            location: '台北市',
            status: '極新',
            description: '這是一輛非常新的 Tesla Model 3，車況極佳，純電續航里程長，配備自動輔助駕駛功能。內裝極簡現代，搭載大型觸控螢幕，提供流暢的科技體驗。',
            imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000',
            images: [
                { itemImageSrc: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000', thumbnailImageSrc: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=200', alt: 'Tesla Front' },
                { itemImageSrc: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=1000', thumbnailImageSrc: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=200', alt: 'Tesla Side' },
                { itemImageSrc: 'https://images.unsplash.com/photo-1561580119-6497e163c200?auto=format&fit=crop&q=80&w=1000', thumbnailImageSrc: 'https://images.unsplash.com/photo-1561580119-6497e163c200?auto=format&fit=crop&q=80&w=200', alt: 'Tesla Interior' }
            ],
            specs: {
                engine: '純電動',
                transmission: '單速變速箱',
                color: '珍珠白',
                driveType: '後輪驅動',
                battery: '60 kWh',
                range: '491 km (WLTP)'
            }
        };
    }

    responsiveOptions: any[] = [
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];
}
