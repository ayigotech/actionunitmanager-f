import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Notification } from 'src/app/services/notification';
import { ApiService } from 'src/app/services/api';

// Import specific Ionic components
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonLabel, IonSpinner } from "@ionic/angular/standalone";

export interface TeacherReassignmentData {
  teacherId: string;
  newClassId: string;
}

@Component({
  selector: 'app-reassign-teacher-modal',
  templateUrl: './reassign-teacher-modal.component.html',
  styleUrls: ['./reassign-teacher-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons,
    IonButton, IonIcon, IonContent, IonItem, IonLabel,
    IonSpinner
]
})
export class ReassignTeacherModalComponent {
  private notification = inject(Notification);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService)
  
  reassignmentForm!: FormGroup;
  returnUrl: string = '/superintendent';
  
  currentTeacher: any;
  currentClass: any;
  availableClasses: any[] = [];
  isLoading = false;

  ngOnInit(): void {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state) {
      this.returnUrl = state['returnUrl'] || '/superintendent';
      this.currentTeacher = state['teacher'] || {};
      this.currentClass = state['currentClass'] || {};
      this.availableClasses = state['classes'] || [];
    }

    this.initializeForm();
  }

  initializeForm() {
    this.reassignmentForm = this.fb.group({
      newClassId: ['', Validators.required]
    });

    // Set teacher ID in form
    if (this.currentTeacher) {
      this.reassignmentForm.addControl('teacherId', this.fb.control(this.currentTeacher.id));
    }
  }

  reassignTeacher() {

    this.isLoading = true

    if (this.reassignmentForm.invalid) {
      this.notification.error('Please select a new class');
      return;
    }

    const formValue = this.reassignmentForm.value;

    const payload = {
      teacher_id:formValue.teacherId,
      class_id:formValue.newClassId
    }


    console.log('payload; ', payload)

     this.apiService.reassignTeacher(payload).subscribe({
    next: (response) => {
      this.notification.success('Teacher reassigned successfully')
      this.router.navigate(['/superintendent']);
      this.isLoading = false
    },
    error: (error) => {
      const errorMessage = this.notification.extractErrorMessage(error);
      this.notification.error(errorMessage);
      console.error('reassignment failed:', error);
      this.isLoading = false
    }
      });
    
    // Navigate back with success data
    this.router.navigate([this.returnUrl], {
      state: {
        success: true,
        reassignmentData: payload
      }
    });
  }

  cancel() {
    this.router.navigate([this.returnUrl], {
      state: { success: false }
    });
  }
}