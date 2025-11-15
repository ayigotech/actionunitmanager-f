

import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SuperintendentLoginComponent } from '../../../components/auth/superintendent-login/superintendent-login.component';
import { TeacherLoginComponent } from '../../../components/auth/teacher-login/teacher-login.component';
import { MemberLoginComponent } from '../member-login/member-login.component';
import { Router } from '@angular/router';

type LoginType = 'superintendent' | 'teacher' | 'member';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    // SuperintendentLoginComponent,
    // TeacherLoginComponent,
    // MemberLoginComponent,
    IonIcon, ReactiveFormsModule,FormsModule,
]
})
export class LoginComponent {
  selectedLoginType: LoginType = 'superintendent';


  private router = inject(Router)

  selectLoginType(type: LoginType): void {
    this.selectedLoginType = type;
  }



  // navigateToSuperintendentLogin() {
  //   this.router.navigate(['/auth/superintendent-login']);
  // }

  // navigateToTeacherLogin() {
  //   this.router.navigate(['/auth/teacher-login']);
  // }

  // navigateToOfficerLogin() {
  //   this.router.navigate(['/auth/officer-login']);
  // }


  navigateToSuperintendentLogin() {
  // Remove focus from the current button before navigation
  this.clearActiveFocus();
  setTimeout(() => {
    this.router.navigate(['/superintendent-login']);
  }, 10);
}

navigateToTeacherLogin() {
  this.clearActiveFocus();
  setTimeout(() => {
    this.router.navigate(['/teacher-login']);
  }, 10);
}

navigateToOfficerLogin() {
  this.clearActiveFocus();
  setTimeout(() => {
    this.router.navigate(['/officer-login']);
  }, 10);
}

// Helper method to clear active focus
private clearActiveFocus(): void {
  // Check if there's an active element and blur it
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  
  // Optional: Also focus on body to ensure no element retains focus
  document.body.focus();
}
}


