

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Notification } from 'src/app/services/notification';
import { IonIcon, IonItem, IonButton, IonSpinner } from "@ionic/angular/standalone";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-teacher-login',
  templateUrl: './teacher-login.component.html',
  styleUrls: ['./teacher-login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonItem,ReactiveFormsModule]
})
export class TeacherLoginComponent {
  phoneNumber: string = '';
  isLoading: boolean = false;

  loginForm: FormGroup;

 constructor(
    private notification: Notification,
    private authService: AuthService,
    private router : Router,
    private fb: FormBuilder
  ) {
     this.loginForm = this.fb.group({
      phoneNumber: ['', Validators.required],
    });
  }


 onLogin(): void {
  if (!this.phoneNumber) {
    return;
  }
  this.isLoading = true;
  
  this.authService.loginTeacher(this.phoneNumber).subscribe({
    next: (response) => {
      this.isLoading = false;
      // console.log('✅ Teacher login successful:', response);
      
      this.authService.handleAuthentication(response);
      
      // Verify the user role and navigate accordingly
      const user = this.authService.getCurrentUser();
      // console.log('User after login:', user);
      
      if (user?.role === 'teacher') {
        // console.log('🔄 Navigating to teacher dashboard...');
        this.router.navigate(['/teacher']).then(success => {
          // console.log('Navigation success:', success);
        });
      } else {
        console.log('❌ Unexpected user role:', user?.role);
        this.notification.error('Unexpected user role');
      }
    },
    error: (error) => {
      this.isLoading = false;
      const errorMessage = this.extractErrorMessage(error);
      this.notification.error(errorMessage);
      console.error('Login failed:', error);
    }
  });
}





private extractErrorMessage(error: any): string {
  if (error.error && error.error.details) {
    // Django REST framework error format
    const details = error.error.details;
    
    if (details.non_field_errors && details.non_field_errors.length > 0) {
      return details.non_field_errors[0];
    }
    
    // Check all field errors
    for (const field in details) {
      if (details[field].length > 0) {
        return `${field}: ${details[field][0]}`;
      }
    }
  }
  
  if (error.error && error.error.error) {
    return error.error.error;
  }
  
  if (error.status === 0) {
    return 'Cannot connect to server. Please check your internet connection.';
  }
  
  if (error.status === 401) {
    return 'Invalid email or password. Please try again.';
  }
  
  if (error.status === 400) {
    return 'Invalid request. Please check your input.';
  }
  
  if (error.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}





}
