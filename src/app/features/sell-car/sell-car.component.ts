import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CarService } from '../../core/service/car.service'; // Import CarService

@Component({
  selector: 'app-sell-car',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './sell-car.component.html',
  styleUrl: './sell-car.component.css'
})
export class SellCarComponent implements OnInit {
  sellCarForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private carService: CarService // Inject CarService
  ) { }

  ngOnInit(): void {
    this.sellCarForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      price: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      image: [''] // Placeholder for file upload
    });
  }

  onSubmit(): void {
    if (this.sellCarForm.valid) {
      this.carService.addCar(this.sellCarForm.value); // Add car using the service
      console.log('Car added successfully!', this.sellCarForm.value);
      this.sellCarForm.reset(); // Reset the form after successful submission
      alert('車輛已成功刊登！'); // Simple success message
    } else {
      console.log('Form is invalid');
      alert('請檢查表單，確保所有必填欄位都已填寫正確。'); // Alert for invalid form
    }
  }
}
