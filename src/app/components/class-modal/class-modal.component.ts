
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { Notification } from 'src/app/services/notification';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api';

import { IonItem, IonIcon, IonHeader, IonTitle, IonButtons, IonButton, IonToolbar, IonContent, IonSpinner } from "@ionic/angular/standalone";

import { ReactiveFormsModule,FormsModule } from '@angular/forms';




// import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ClassFormData {
  id?: string;
  name: string;
  location: string;
  teacherId?: string; // Now we store teacher ID instead of name/phone
}

@Component({
  selector: 'app-class-modal',
  templateUrl: './class-modal.component.html',
  standalone:true,
  styleUrls: ['./class-modal.component.scss'],

  imports: [CommonModule,
    // IonicModule,
    FormsModule, ReactiveFormsModule,
    IonHeader, IonTitle, IonButtons, IonButton, IonToolbar, IonContent, IonItem, IonIcon, IonSpinner]
})


export class ClassModalComponent {
  mode: 'add' | 'edit' = 'add';
  classForm!: FormGroup;
  availableTeachers: any[] = [];
  originalClass?: any;
  returnUrl: string = '/superintendent';
  isFormDisabled = true;
  isLoading = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private notification: Notification,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state) {
      this.mode = state['mode'] || 'add';
      this.returnUrl = state['returnUrl'] || '/superintendent';
      
      if (this.mode === 'edit' && state['classData']) {
        this.originalClass = state['classData'];
      }
    }

    this.loadTeachers();
    this.initializeForm();
  }

  initializeForm() {
    this.classForm = this.fb.group({
      name: ['', Validators.required],
      location: [''],
      // teacherId: ['']
    });

    // Patch values for edit mode
    if (this.mode === 'edit' && this.originalClass) {
      this.classForm.patchValue({
        name: this.originalClass.name,
        location: this.originalClass.location,
        // teacherId: this.originalClass.teacherId || ''
      });
    }
  }

  async loadTeachers() {
    try {
      const teachers = await this.apiService.getTeachers().toPromise();
      this.availableTeachers = teachers || [];
    } catch (error) {
      console.error('Error loading teachers:', error);
      this.availableTeachers = [];
    }
  }

  async saveClass() {
     this.isLoading = true;
    if (this.classForm.invalid) {
      this.notification.error('All Fields are required');
      return;
    }

    const formValues = this.classForm.value;

    console.log("formvalue; ", formValues)


    this.apiService.createClass(formValues).subscribe({
    next: (response) => {
      this.notification.success('Class created successfully')
      this.router.navigate(['/superintendent']);
    },
    error: (error) => {
      const errorMessage = this.notification.extractErrorMessage(error);
      this.notification.error(errorMessage);
      console.error('failed to create class:', error);
      this.isLoading = false;
    }
      });
    
  }


  cancel() {
    this.router.navigate([this.returnUrl], {
      state: { success: false }
    });
  }

  
}