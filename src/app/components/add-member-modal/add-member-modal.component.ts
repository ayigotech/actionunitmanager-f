



import { Component, inject } from '@angular/core';
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

  async ngOnInit() {

    this.initializeForm();

    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state) {
      this.mode = state['mode'] || 'add';
      this.returnUrl = state['returnUrl'] || '/superintendent';
      
      if (this.mode === 'edit' && state['memberData']) {
        this.originalMember = state['memberData'];
      }
    }

     
    await this.loadClasses();
   
  }

  initializeForm() {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      location: [''],
      email: [''],
      classId: ['', Validators.required]
    });

    // Patch values for edit mode
    if (this.mode === 'edit' && this.originalMember) {
      this.memberForm.patchValue({
        name: this.originalMember.name,
        phone: this.originalMember.phone,
        location: this.originalMember.location,
        email: this.originalMember.email || '',
        classId: this.originalMember.classId
      });
    }
  }

  async loadClasses() {
    try {
      const classes = await this.apiService.getClasses().toPromise();
      this.availableClasses = classes || [];
    } catch (error) {
      console.error('Error loading classes:', error);
      this.availableClasses = [];
    }
  }

  async saveMember() {
     this.isLoading = true;
    if (this.memberForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formValues = this.memberForm.value;
    console.log("new member; ", formValues)

    const payload = {
      name : formValues.name,
      phone : formValues.phone,
      email : formValues.email,
      location:formValues.location,
      class_id : Number(formValues.classId)

    }

    this.apiService.createMember(payload).subscribe({
      next: (response) => {
        this.notification.success('Member created successfully');
        this.router.navigate(['/superintendent']);
        this.isLoading = false
      },
      error: (error) => {
        const errorMessage = this.notification.extractErrorMessage(error);
        this.notification.error(errorMessage);
        console.error('Failed to create member:', error);
        this.isLoading = false
      }
    });
     this.isLoading = false;
      }

  cancel() {
    this.router.navigate([this.returnUrl], {
      state: { success: false }
    });
  }
  
}