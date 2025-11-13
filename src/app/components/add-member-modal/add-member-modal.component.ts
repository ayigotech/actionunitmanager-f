



import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Notification } from 'src/app/services/notification';
import { ApiService } from 'src/app/services/api';

// Import specific Ionic components
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonSelectOption, IonSpinner } from "@ionic/angular/standalone";

export interface MemberFormData {
  id?: string;
  name: string;
  phone: string;
  location: string;
  email?: string;
  classId: string;
}

@Component({
  selector: 'app-add-member-modal',
  templateUrl: './add-member-modal.component.html',
  styleUrls: ['./add-member-modal.component.scss'],
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

export class AddMemberModalComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notification = inject(Notification);
  private fb = inject(FormBuilder);
  
  mode: 'add' | 'edit' = 'add';
  memberForm!: FormGroup;
  availableClasses: any[] = [];
  returnUrl: string = '/superintendent';
  originalMember?: any;
  isLoading = false;
  classesLoading = false;
  classesError = false;

  async ngOnInit() {
    // Get data from navigation state FIRST
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state) {
      this.mode = state['mode'] || 'add';
      this.returnUrl = state['returnUrl'] || '/superintendent';
      
      if (this.mode === 'edit' && state['memberData']) {
        this.originalMember = state['memberData'];
        console.log('Editing member:', this.originalMember);
      }
    }

    await this.loadClasses();
    this.initializeForm(); // Initialize form AFTER setting originalMember and loading classes
  }

  initializeForm() {
    this.memberForm = this.fb.group({
      name: [this.originalMember?.name || '', Validators.required],
      phone: [this.originalMember?.phone || '', Validators.required],
      location: [this.originalMember?.location || ''],
      email: [this.originalMember?.email || ''],
      classId: [this.originalMember?.classId || '', Validators.required]
    });

    // Log form values for debugging
    console.log('Form initialized with values:', this.memberForm.value);
    console.log('Edit mode:', this.mode === 'edit');
    console.log('Original member:', this.originalMember);
  }

  async loadClasses() {
    this.classesLoading = true;
    this.classesError = false;
    
    try {
      const classes = await this.apiService.getClasses().toPromise();
      this.availableClasses = classes || [];
      console.log('Loaded classes:', this.availableClasses.length);
    } catch (error) {
      console.error('Error loading classes:', error);
      this.availableClasses = [];
      this.classesError = true;
      this.notification.error('Failed to load classes');
    } finally {
      this.classesLoading = false;
    }
  }

  async saveMember() {
    // Mark all fields as touched to trigger validation messages
    this.markFormGroupTouched();
    
    if (this.memberForm.invalid) {
      this.notification.error('Please fill all required fields correctly');
      return;
    }

    this.isLoading = true;

    const formValues = this.memberForm.value;
    console.log("Form values:", formValues);

    const payload = {
      name: formValues.name,
      phone: formValues.phone,
      email: formValues.email,
      location: formValues.location,
      class_id: Number(formValues.classId)
    };

    try {
      let response;
      
      if (this.mode === 'add') {
        response = await this.apiService.createMember(payload).toPromise();
        this.notification.success('Member created successfully');
      } else {
        // For edit mode, use the updateMember method
        const memberId = this.originalMember.id;
        response = await this.apiService.updateMember(memberId, payload).toPromise();
        this.notification.success('Member updated successfully');
      }
      
      console.log('Save successful:', response);
      this.router.navigate([this.returnUrl]);
      
    } catch (error) {
      const errorMessage = this.notification.extractErrorMessage(error);
      this.notification.error(errorMessage);
      console.error(`Failed to ${this.mode} member:`, error);
    } finally {
      this.isLoading = false;
    }
  }

  // Helper method to mark all form fields as touched
  private markFormGroupTouched() {
    Object.keys(this.memberForm.controls).forEach(key => {
      const control = this.memberForm.get(key);
      control?.markAsTouched();
    });
  }

  cancel() {
    this.router.navigate([this.returnUrl], {
      state: { success: false }
    });
  }
}