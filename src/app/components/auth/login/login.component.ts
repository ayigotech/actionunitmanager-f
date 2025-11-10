

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SuperintendentLoginComponent } from '../../../components/auth/superintendent-login/superintendent-login.component';
import { TeacherLoginComponent } from '../../../components/auth/teacher-login/teacher-login.component';
import { MemberLoginComponent } from '../member-login/member-login.component';

type LoginType = 'superintendent' | 'teacher' | 'member';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    SuperintendentLoginComponent,
    TeacherLoginComponent,
    MemberLoginComponent,
    IonIcon, ReactiveFormsModule,FormsModule,
]
})
export class LoginComponent {
  selectedLoginType: LoginType = 'superintendent';

  selectLoginType(type: LoginType): void {
    this.selectedLoginType = type;
  }
}


