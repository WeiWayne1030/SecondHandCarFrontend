import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar'; // Added
import { MenuModule } from 'primeng/menu';     // Added

@NgModule({
  declarations: [
    NavbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    ToolbarModule, // Added
    MenuModule     // Added
  ],
  exports: [
    NavbarComponent,
    ButtonModule,
    ToolbarModule, // Added
    MenuModule     // Added
  ]
})
export class SharedModule { }
