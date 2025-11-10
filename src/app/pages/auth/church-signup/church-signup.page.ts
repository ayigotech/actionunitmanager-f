
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';
import { ApiService, ChurchRegistration } from 'src/app/services/api';
import { RouterModule } from '@angular/router';
import { Notification } from 'src/app/services/notification';
import { IonIcon, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonRefresher, IonRefresherContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-church-signup',
  templateUrl: './church-signup.page.html',
  styleUrls: ['./church-signup.page.scss'],
  standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons,
    IonIcon, IonContent,
    IonBackButton,
    IonRefresher,
    IonRefresherContent
]
})
export class ChurchSignupPage {
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private apiService = inject(ApiService);
  private notification = inject(Notification);
  private fb = inject(FormBuilder);

  // Reactive Form
  signupForm: FormGroup;

  isLoading = false;
  errorMessage = '';

  constructor() {
    this.signupForm = this.fb.group({
      church: this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        address: [''],
        district: [''],
        country: ['Ghana'],
        denomination: ['Seventh-day Adventist']
      }),
      superintendent: this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      })
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password matching
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('superintendent.password')?.value;
    const confirmPassword = form.get('superintendent.confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Calculate trial end date (2 months from now)
  private getTrialEndDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date.toISOString().split('T')[0];
  }

  async onSubmit() {
    if (this.signupForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.signupForm.hasError('passwordMismatch')) {
      this.errorMessage = 'Passwords do not match';
      this.notification.warning('Passwords do not match');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const formValue = this.signupForm.value;
      const registrationData: ChurchRegistration = {
        church: {
          name: formValue.church.name,
          email: formValue.church.email,
          phone: formValue.church.phone,
          address: formValue.church.address,
          district: formValue.church.district,
          country: formValue.church.country,
          denomination: formValue.church.denomination
        },
        superintendent: {
          name: formValue.superintendent.name,
          email: formValue.superintendent.email,
          phone: formValue.superintendent.phone,
          password: formValue.superintendent.password
        },
        subscription: {
          plan: 'free_trial',
          trial_end_date: this.getTrialEndDate()
        }
      };

      console.log('registrationData; :', registrationData)

      const response = await this.apiService.registerChurch(registrationData).toPromise();
      
      if (!response) {
        throw new Error('No response from server');
      }

      // Auto-login after successful registration
      this.authService.handleAuthentication(response);
      
      // Navigate to superintendent dashboard
      this.navCtrl.navigateRoot('/superintendent');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      this.notification.warning(this.errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  // Mark all fields as touched to show validation errors
  private markFormGroupTouched() {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(subKey => {
          control.get(subKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Helper methods for template
  get churchForm() {
    return this.signupForm.get('church') as FormGroup;
  }

  get superintendentForm() {
    return this.signupForm.get('superintendent') as FormGroup;
  }

  onLoginClick() {
    this.navCtrl.navigateBack('/auth');
  }







   async handleRefresh(event: any) {
    try {
      // Call your refresh methods
      //await this.loadData();
      
      // Complete the refresh
      event.target.complete();
      
      // Optional: Show success message
      this.notification.success('Data refreshed');
    } catch (error) {
      // Complete the refresh even if there's an error
      event.target.complete();
      
      // Show error message
      this.notification.error('Failed to refresh data');
    }
  }







}