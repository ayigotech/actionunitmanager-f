
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth';
import { Router } from '@angular/router';
import { Notification } from 'src/app/services/notification';
import { IonItem, IonIcon} from "@ionic/angular/standalone"
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-superintendent-login',
  templateUrl: './superintendent-login.component.html',
  styleUrls: ['./superintendent-login.component.scss'],
  standalone: true,
  imports: [CommonModule, 
    IonItem, IonIcon,
    FormsModule, ReactiveFormsModule, 
    // IonicModule
  ]
})
export class SuperintendentLoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  loginForm: FormGroup;



  constructor(
    private notification: Notification,
    private authService: AuthService,
    private router : Router,
    private fb: FormBuilder
  ) {
     this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

 onLogin(): void {
  if (!this.email || !this.password) {
    return;
  }

  this.isLoading = true;
  
  this.authService.loginSuperintendent(this.email, this.password).subscribe({
    next: (response) => {
      this.isLoading = false;
      // Handle successful login
      this.authService.handleAuthentication(response);
      this.router.navigate(['/superintendent']);
    },
    error: (error) => {
      this.isLoading = false;
      const errorMessage = this.extractErrorMessage(error);
      this.notification.error(errorMessage);
      console.error('Login failed:', error);
    }
      });
}





onSignup(): void {
  this.router.navigate(['/auth/signup']);

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

// Then use it in your error handling:




}
