

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';
import { LoadingController } from '@ionic/angular/standalone';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonIcon, IonContent, IonItem, IonLabel
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-book-modal',
  templateUrl: './book-modal.component.html',
  styleUrls: ['./book-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonIcon, IonContent, IonItem, IonLabel
  ]
})
export class BookModalComponent {
  private router = inject(Router);
  private notification = inject(Notification);
  private apiService = inject(ApiService);
  private loadingController = inject(LoadingController);
  private fb = inject(FormBuilder);
  
  bookForm!: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  returnUrl: string = '/manage-books';
  originalBook: any;

  currencies = [
    { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi' },
    { code: 'USD', symbol: '$', name: 'US Dollar' }
  ];

  ngOnInit(): void {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state) {
      this.isEditMode = state['mode'] === 'edit';
      this.returnUrl = state['returnUrl'] || '/manage-books';
      
      if (this.isEditMode && state['bookData']) {
        this.originalBook = state['bookData'];
      }
    }

    this.initializeForm();
  }

  initializeForm() {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['GHS', Validators.required],
      isActive: [true]
    });

    // Patch values for edit mode
    if (this.isEditMode && this.originalBook) {
      this.bookForm.patchValue({
        title: this.originalBook.title,
        price: this.originalBook.price,
        currency: this.originalBook.currency,
        isActive: this.originalBook.isActive
      });
    }
  }

  async saveBook() {
    if (this.bookForm.invalid) {
      this.notification.error('Please fill in all required fields with valid values');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Updating book...' : 'Creating book...'
    });
    await loading.present();

    try {
      const formValues = this.bookForm.value;
      const bookPayload = {
        title: formValues.title,
        price: formValues.price,
        currency: formValues.currency,
        is_active: formValues.isActive
      };

      let response;
      if (this.isEditMode && this.originalBook) {
        response = await this.apiService.updateQuarterlyBook(this.originalBook.id, bookPayload).toPromise();
      } else {
        response = await this.apiService.createQuarterlyBook(bookPayload).toPromise();
      }

      await loading.dismiss();
      
      // Transform API response
      const bookData = {
        id: response.id.toString(),
        title: response.title,
        price: parseFloat(response.price),
        currency: response.currency,
        isActive: response.is_active,
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at)
      };

      // Navigate back with success data
      this.router.navigate([this.returnUrl], {
        state: {
          success: true,
          mode: this.isEditMode ? 'edit' : 'add',
          bookData: bookData,
          originalBook: this.originalBook
        }
      });
      this.notification.success("Book created successfully")
      
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error saving book:', error);
      this.notification.error(error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} book`);
      this.isSubmitting = false;
    }
  }

  cancel() {
    this.router.navigate([this.returnUrl], {
      state: { success: false }
    });
  }
}