import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { Notification } from 'src/app/services/notification';
import { ReactiveFormsModule } from '@angular/forms';
import { IonItem, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-member-login',
  templateUrl: './member-login.component.html',
  styleUrls: ['./member-login.component.scss'],
 standalone: true,
   imports: [CommonModule, FormsModule, IonIcon, IonItem,ReactiveFormsModule]
})
export class MemberLoginComponent {
  isLoading: boolean = false;
   phoneNumber: string = '';
  loginForm: FormGroup;

 constructor(
    private notification: Notification,
    private authService: AuthService,
    private router : Router,
    private fb: FormBuilder,
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
  
// Temporary workaround - check if user should be officer based on role/phone
this.authService.loginMember(this.phoneNumber).subscribe({
next: (response) => {
    this.authService.handleAuthentication(response);
    
    const user = this.authService.getCurrentUser();
    console.log('User after login:', user);
    
    if (user?.is_officer && user?.role==="member") {
      console.log('🔄 Navigating to officer dashboard...');
      this.router.navigate(['/officers-insight']); // Make sure this is correct
    // } else if (user?.role === 'member') {
    //   console.log('🔄 Navigating to member dashboard...');
    //   this.router.navigate(['/officers-insight']); // This route might not exist!
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
