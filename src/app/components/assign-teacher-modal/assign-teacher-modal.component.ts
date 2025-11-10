


import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Notification } from 'src/app/services/notification';

// Import specific Ionic components
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonSpinner } from "@ionic/angular/standalone";
import { ApiService } from 'src/app/services/api';

export interface TeacherAssignmentData {
  teacherId: string;
  classId: string;
}

@Component({
  selector: 'app-assign-teacher-modal',
  templateUrl: './assign-teacher-modal.component.html',
  styleUrls: ['./assign-teacher-modal.component.scss'],
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
export class AssignTeacherModalComponent {
  private notification = inject(Notification);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService)
  
  assignmentForm!: FormGroup;
  returnUrl: string = '/superintendent';
  availableTeachers: any[] = [];
  availableClasses: any[] = [];
  isLoading = true;
  isClassesLoading = true; 

  ngOnInit(): void {
    // Get data from navigation state

    //  await Promise.all([
      this.loadTeachers()
      this.loadClasses()
    // ]);
      this.isLoading = false;

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state) {
      this.returnUrl = state['returnUrl'] || '/superintendent';
      this.availableTeachers = state['teachers'] || [];
      this.availableClasses = state['classes'] || [];
    }

    this.initializeForm();
  }

  initializeForm() {
    this.assignmentForm = this.fb.group({
  teacherId: [null, Validators.required],  // Change from teacherId to teacher_id
  classId: [null, Validators.required]     // Change from classId to class_id
});
  }

  
   async loadTeachers() {
    try {
      const response = await this.apiService.getTeachers().toPromise();
      this.availableTeachers = response || [];
    } catch (error) {
      console.error('Error loading teachers:', error);
      this.availableTeachers = [];
    }
  }

  async loadClasses() {
    try {
      const response = await this.apiService.getClasses().toPromise();
      this.availableClasses = response || [];
    } catch (error) {
      console.error('Error loading classes:', error);
      this.availableClasses = [];
    }
  }



  assignTeacher() {

    this.isLoading = true

    if (this.assignmentForm.invalid) {
      this.notification.error('Please select both teacher and class');
      return;
    }

    const formValues = this.assignmentForm.value;
    console.log('assigning teacher; ',formValues)

    const payload = {
  teacher_id: Number(formValues.teacherId),  // Transform to backend format
  class_id: Number(formValues.classId)       // Transform to backend format
};

    this.apiService.assignTeacher(payload).subscribe({
    next: (response) => {
      this.notification.success('Teacher assigned successfully')
      this.router.navigate(['/superintendent']);
      this.isLoading = false
    },
    error: (error) => {
      const errorMessage = this.notification.extractErrorMessage(error);
      this.notification.error(errorMessage);
      console.error('assignment failed:', error);
      this.isLoading = false
    }
      });
    
    
    // Navigate back with success data
    this.router.navigate([this.returnUrl], {
      state: {
        success: true,
        assignmentData: formValues
      }
    });
  }

  cancel() {
    this.router.navigate([this.returnUrl], {
      state: { success: false }
    });
  }
}
