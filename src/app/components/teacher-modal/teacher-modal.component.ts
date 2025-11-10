
// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule, ModalController } from '@ionic/angular';
// import { Notification } from 'src/app/services/notification';

// export interface TeacherFormData {
//   id?: string;
//   name: string;
//   phone: string;
//   email?: string;
// }

// @Component({
//   selector: 'app-teacher-modal',
//   templateUrl: './teacher-modal.component.html',
//   styleUrls: ['./teacher-modal.component.scss'],
//   standalone: true,
//   imports: [CommonModule, IonicModule, FormsModule]
// })
// export class TeacherModalComponent {
//   private modalCtrl = inject(ModalController);
  
//   mode: 'add' | 'edit' = 'add';
//   teacherData: TeacherFormData = {
//     name: '',
//     phone: '',
//     email: 'email@gamil.com'
//   };
  
//   // For edit mode - original teacher data
//   originalTeacher?: any;

//   constructor(
//     private notification: Notification,
//   ) {}

//   // Called when modal is created
//   setData(mode: 'add' | 'edit', teacherData?: any) {
//     this.mode = mode;
    
//     if (mode === 'edit' && teacherData) {
//       this.originalTeacher = teacherData;
//       this.teacherData = {
//         id: teacherData.id,
//         name: teacherData.name,
//         phone: teacherData.phone,
//         email: teacherData.email || 'nomail@gmail.com'
//       };
//     }
//   }

//   async saveTeacher() {
//     // Basic validation
//     if (!this.teacherData.name.trim()) {
//       this.notification.error('Teacher name is required');
//       return;
//     }

//     if (!this.teacherData.phone.trim()) {
//       this.notification.error('Phone number is required');
//       return;
//     }

//     // Return data to parent component
//     await this.modalCtrl.dismiss({
//       success: true,
//       mode: this.mode,
//       teacherData: this.teacherData,
//       originalTeacher: this.originalTeacher
//     });
//   }

//   cancel() {
//     this.modalCtrl.dismiss({
//       success: false,
//       mode: this.mode
//     });
//   }
// }




import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Notification } from 'src/app/services/notification';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonIcon, IonContent, IonItem 
} from "@ionic/angular/standalone";
import { ApiService } from 'src/app/services/api';

export interface TeacherFormData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
}

@Component({
  selector: 'app-teacher-modal',
  templateUrl: './teacher-modal.component.html',
  styleUrls: ['./teacher-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonIcon, IonContent, IonItem
  ]
})
export class TeacherModalComponent {
  // private notification = inject(Notification);
  // private router = inject(Router);
  // private fb = inject(FormBuilder);
  
  mode: 'add' | 'edit' = 'add';
  teacherForm!: FormGroup;
  returnUrl: string = '/superintendent';
  originalTeacher?: any;


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
      
      if (this.mode === 'edit' && state['teacherData']) {
        this.originalTeacher = state['teacherData'];
      }
    }

    this.initializeForm();
  }

  initializeForm() {
    this.teacherForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['']
    });

    // Patch values for edit mode
    if (this.mode === 'edit' && this.originalTeacher) {
      this.teacherForm.patchValue({
        name: this.originalTeacher.name,
        phone: this.originalTeacher.phone,
        email: this.originalTeacher.email || ''
      });
    }
  }

  

saveTeacher() {
  if (this.teacherForm.invalid) {
    this.notification.error('Please fill all required fields');
    return;
  }

  const formValues = this.teacherForm.value;
  const mode = this.mode; // This should come from your route state

  if (mode === 'edit') {
    // Update existing teacher
    const teacherId = this.originalTeacher.id; // This should come from your route state
    this.apiService.updateTeacher(teacherId, formValues).subscribe({
      next: (response) => {
        this.notification.success('Teacher updated successfully');
        this.router.navigate(['/superintendent']);
      },
      error: (error) => {
        const errorMessage = this.notification.extractErrorMessage(error);
        this.notification.error(errorMessage);
        console.error('Failed to update teacher:', error);
      }
    });
  } else {
    // Create new teacher
    this.apiService.createTeacher(formValues).subscribe({
      next: (response) => {
        this.notification.success('Teacher created successfully');
        this.router.navigate(['/superintendent']);
      },
      error: (error) => {
        const errorMessage = this.notification.extractErrorMessage(error);
        this.notification.error(errorMessage);
        console.error('Failed to create teacher:', error);
      }
    });
  }
}


  cancel() {
    this.router.navigate([this.returnUrl], {
      state: { success: false }
    });
  }
}