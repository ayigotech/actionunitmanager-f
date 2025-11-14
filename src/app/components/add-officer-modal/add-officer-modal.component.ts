



import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from 'src/app/services/notification';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api';


// Import specific Ionic components
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonNote, IonSpinner } from "@ionic/angular/standalone";

@Component({
  selector: 'app-add-officer-modal',
  templateUrl: './add-officer-modal.component.html',
  styleUrls: ['./add-officer-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons,
    IonButton, IonIcon, IonContent, IonItem, 
    IonSpinner
]
})
export class AddOfficerModalComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private apiService = inject (ApiService);
  private notification = inject (Notification)
  
  officerForm!: FormGroup;
  returnUrl: string = '/manage-officers';
   isLoading = false;

  ngOnInit(): void {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state) {
      this.returnUrl = state['returnUrl'] || '/manage-officers';
    }

    this.initializeForm();
  }

  initializeForm() {
    this.officerForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-() ]+$/)]],
      name: [''],
      email: ['']
    });
  }

  saveOfficer() {

     this.isLoading = true;

    if (this.officerForm.invalid) {
      return;
    }

    const formValues = this.officerForm.value;
    console.log("Officers; ", formValues)

    this.apiService.createOfficer(formValues).subscribe({
      next: (response) => {
        this.notification.success('officer created successfully');
        this.router.navigate(['/manage-officers']);
        this.isLoading = false
      },
      error: (error) => {
        const errorMessage = this.notification.extractErrorMessage(error);
        this.notification.error(errorMessage);
        console.error('Failed to create officer:', error);
        this.isLoading = false;
      }
      
    });
    
    // Navigate back with success data
    this.router.navigate([this.returnUrl], {
      state: {
        success: true,
        mode: 'add',
        officerData: formValues
      }
    });
  }

  cancel() {
    this.router.navigate([this.returnUrl], {
      state: { success: false }
    });
  }
}