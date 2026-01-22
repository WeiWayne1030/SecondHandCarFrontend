import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { CarDetailComponent } from './features/car-detail/car-detail.component';
import { SellCarComponent } from './features/sell-car/sell-car.component';
import { CarAnimationComponent } from './features/animation/car-animation.component';

const routes: Routes = [
  { path: '', component: CarAnimationComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'car/:id', component: CarDetailComponent },
  { path: 'sell-car', component: SellCarComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
