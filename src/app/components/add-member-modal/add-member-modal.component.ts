



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


export class AddMemberModalComponent {
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
        console.log('Editing member loaded', {
          memberId: this.originalMember.id,
          memberName: this.originalMember.name,
          classId: this.originalMember.classId,
          mode: this.mode
        });
        
        console.log('Editing member:', this.originalMember);
        console.log('Member classId:', this.originalMember.classId);
        console.log('Member classId type:', typeof this.originalMember.classId);
      }
    }

    await this.loadClasses();
    this.initializeForm(); // Initialize form AFTER setting originalMember and loading classes
  }

  initializeForm() {
    // Get the classId, but handle 'unknown' case
    let classId = this.originalMember?.classId;
    
    // If classId is 'unknown' or invalid, set to empty string so it shows "Select Class"
    if (classId === 'unknown' || !this.isValidClassId(classId)) {
      classId = '';
    }

    this.memberForm = this.fb.group({
      name: [this.originalMember?.name || '', Validators.required],
      phone: [this.originalMember?.phone || '', Validators.required],
      location: [this.originalMember?.location || ''],
      email: [this.originalMember?.email || ''],
      classId: [classId, Validators.required]
    });

    console.log('Form initialized with values:', this.memberForm.value);
    console.log('Edit mode:', this.mode === 'edit');
    console.log('Original member:', this.originalMember);
    console.log('Available classes:', this.availableClasses);
  }

  private isValidClassId(classId: any): boolean {
    if (!classId || classId === 'unknown') return false;
    
    // Check if this classId exists in availableClasses
    return this.availableClasses.some(cls => cls.id == classId);
  }

  async loadClasses() {
    this.classesLoading = true;
    this.classesError = false;
    
    try {
      const classes = await this.apiService.getClasses().toPromise();
      this.availableClasses = classes || [];
      console.log('Loaded classes:', this.availableClasses);
      
      // If we have the original member, log which class they belong to
      if (this.originalMember) {
        const memberClass = this.availableClasses.find(cls => cls.id == this.originalMember.classId);
        console.log('Member class found:', memberClass);
        console.log('Member classId:', this.originalMember.classId);
        console.log('Available class IDs:', this.availableClasses.map(c => c.id));
        
        // TEMPORARY: Force select first class if classId is unknown and classes exist
        if (this.originalMember.classId === 'unknown' && this.availableClasses.length > 0) {
          setTimeout(() => {
            this.memberForm?.patchValue({ classId: this.availableClasses[0].id });
            console.log('Auto-selected class:', this.availableClasses[0]);
          });
        }
      }
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
      member_name: formValues.name,
      phone: formValues.phone,
      email: formValues.email,
      location: formValues.location,
      action_unit_class: Number(formValues.classId)
    };

    try {
      let response;
      
      if (this.mode === 'add') {
        response = await this.apiService.createMember(payload).toPromise();
        this.notification.success('Member created successfully');
       
      } else {
        // For edit mode, use the updateMember method
        const memberId = this.originalMember.id;
        
        // Log what we're sending for update
        console.log('Updating member:', memberId, payload);
        
        
        response = await this.apiService.updateMember(memberId, payload).toPromise();
        this.notification.success('Member updated successfully');
      }
      
      console.log('Save successful:', response);
      this.router.navigate([this.returnUrl]);
      
    } catch (error) {
      const errorMessage = this.notification.extractErrorMessage(error);
      this.notification.error(errorMessage);
      console.error(`Failed to ${this.mode} member:`, error);
      // this.logging.error(`Failed to ${this.mode} member`, error);
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