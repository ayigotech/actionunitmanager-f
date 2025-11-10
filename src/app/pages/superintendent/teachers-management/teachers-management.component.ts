
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { Notification } from 'src/app/services/notification';
import { ApiService } from 'src/app/services/api';
import { TeacherModalComponent } from 'src/app/components/teacher-modal/teacher-modal.component';
import { AssignTeacherModalComponent } from 'src/app/components/assign-teacher-modal/assign-teacher-modal.component';
import { ReassignTeacherModalComponent } from 'src/app/components/reassign-teacher-modal/reassign-teacher-modal.component';

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  email?: string;
  assignedClass: string;
  classId: string;
  isActive: boolean;
  joinDate: Date;
}

@Component({
  selector: 'app-teachers-management',
  templateUrl: './teachers-management.component.html',
  styleUrls: ['./teachers-management.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})

export class TeachersManagementComponent implements OnInit {
  teachers: Teacher[] = [];
  isLoading: boolean = false;
  availableClasses: any[] = [];

  private notification = inject(Notification);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private modalController = inject(ModalController);

  async ngOnInit() {
    await this.loadTeachers();
    await this.loadClasses();
    this.handleReturnData();
  }

  async loadTeachers() {
    this.isLoading = true;
    
    try {
      const response = await this.apiService.getTeachers().toPromise();
      
      if (response) {
        this.teachers = response.map(teacher => ({
          id: teacher.id.toString(),
          name: teacher.name,
          phone: teacher.phone,
          email: teacher.email,
          assignedClass: teacher.assigned_class || 'Not Assigned',
          classId: teacher.class_id || '',
          isActive: teacher.is_active,
          joinDate: new Date(teacher.date_joined)
        }));
      } else {
        this.teachers = [];
      }
    } catch (error: any) {
      console.error('Error loading teachers:', error);
      this.notification.error('Failed to load teachers');
      this.teachers = [];
    } finally {
      this.isLoading = false;
    }
  }

  async loadClasses() {
    try {
      const response = await this.apiService.getClasses().toPromise();
      this.availableClasses = response || [];
    } catch (error: any) {
      console.error('Error loading classes:', error);
      this.availableClasses = [];
    }
  }

  addTeacher() {
    this.router.navigate(['/add-teacher'], {
      state: { 
        mode: 'add',
        returnUrl: '/superintendent' 
      }
    });
  }

  editTeacher(teacher: any) {
    this.router.navigate(['/edit-teacher'], {
      state: {
        mode: 'edit',
        teacherData: teacher,
        returnUrl: '/superintendent'
      }
    });
  }

  assignTeacher() {
    // Filter for unassigned teachers and classes
    const unassignedTeachers = this.teachers.filter(t => !t.classId);
    const unassignedClasses = this.availableClasses.filter(c => 
      !this.teachers.some(t => t.classId === c.id)
    );

    this.router.navigate(['/assign-teacher'], {
      state: { 
        teachers: unassignedTeachers, // Fixed: use filtered teachers
        classes: unassignedClasses,   // Fixed: use filtered classes
        returnUrl: '/superintendent' 
      }
    });
  }

  reassignTeacher(teacher: Teacher) {
    const currentClass = this.availableClasses.find(c => c.id === teacher.classId);
    
    this.router.navigate(['/reassign-teacher'], {
      state: {
        teacher: teacher,
        currentClass: currentClass,
        classes: this.availableClasses.filter(c => c.id !== teacher.classId),
        returnUrl: '/superintendent'
      }
    });
  }

  async deactivateTeacher(teacher: Teacher) {
    if (confirm(`Are you sure you want to deactivate ${teacher.name}?`)) {
      try {
        await this.apiService.deleteTeacher(teacher.id).toPromise();
        this.notification.success('Teacher deactivated successfully');
        await this.loadTeachers(); // Refresh the list
      } catch (error: any) {
        console.error('Error deactivating teacher:', error);
        this.notification.error('Failed to deactivate teacher');
      }
    }
  }

  goBack() {
    this.router.navigate(['/superintendent']);
  }

  // Consolidated handleReturnData method
  handleReturnData() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state?.['success']) {
      if (state['assignmentData']) {
        this.processAssignmentResult(state);
      } else if (state['teacherData']) {
        this.processTeacherModalResult(state);
      } else if (state['reassignmentData']) {
        this.processReassignmentResult(state);
      }
    }
  }

  private async processAssignmentResult(state: any) {
    const assignmentData = state['assignmentData'];
    
    try {
      await this.apiService.assignTeacher({
        teacher_id: parseInt(assignmentData.teacherId),
        class_id: parseInt(assignmentData.classId)
      }).toPromise();
      
      this.notification.success('Teacher assigned successfully');
      await this.loadTeachers(); // Refresh the list
    } catch (error: any) {
      console.error('Error assigning teacher:', error);
      this.notification.error('Failed to assign teacher');
    }
  }

  private async processReassignmentResult(state: any) {
    const reassignmentData = state['reassignmentData'];
    
    try {
      await this.apiService.reassignTeacher({
        teacher_id: parseInt(reassignmentData.teacherId),
        class_id: parseInt(reassignmentData.newClassId)
      }).toPromise();
      
      this.notification.success('Teacher reassigned successfully');
      await this.loadTeachers(); // Refresh the list
    } catch (error: any) {
      console.error('Error reassigning teacher:', error);
      this.notification.error('Failed to reassign teacher');
    }
  }

  private async processTeacherModalResult(state: any) {
    const teacherData = state['teacherData'];
    const mode = state['mode'];
    const originalTeacher = state['originalTeacher'];

    if (mode === 'add') {
      await this.handleAddTeacher(teacherData);
    } else if (mode === 'edit') {
      await this.handleEditTeacher(originalTeacher, teacherData);
    }
  }

  private async handleAddTeacher(teacherData: any) {
    try {
      const newTeacher = await this.apiService.createTeacher({
        name: teacherData.name,
        phone: teacherData.phone,
        email: teacherData.email || ''
      }).toPromise();
      
      this.notification.success('Teacher created successfully');
      await this.loadTeachers(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      this.notification.error('Failed to create teacher');
    }
  }

  private async handleEditTeacher(originalTeacher: any, updatedData: any) {
    try {
      await this.apiService.updateTeacher(originalTeacher.id, {
        name: updatedData.name,
        phone: updatedData.phone,
        email: updatedData.email || ''
      }).toPromise();
      
      this.notification.success('Teacher updated successfully');
      await this.loadTeachers(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      this.notification.error('Failed to update teacher');
    }
  }





 async handleRefresh(event: any) {
    try {
      // Call your refresh methods
    await this.loadTeachers();
    await this.loadClasses();
    this.handleReturnData();
      
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
























// export class TeachersManagementComponent implements OnInit {
//   teachers: Teacher[] = [];
//   isLoading: boolean = false;
//   availableClasses: any[] = [];

//   private notification = inject(Notification);
//   private authService = inject(AuthService);
//   private apiService = inject(ApiService);
//   private router = inject(Router);
//   private modalController = inject(ModalController);

//   async ngOnInit() {
//     await this.loadTeachers();
//     await this.loadClasses();
//     this.handleReturnData();
//   }

//   async loadTeachers() {
//     this.isLoading = true;
    
//     try {
//       const response = await this.apiService.getTeachers().toPromise();
      
//       if (response) {
//         this.teachers = response.map(teacher => ({
//           id: teacher.id.toString(),
//           name: teacher.name,
//           phone: teacher.phone,
//           email: teacher.email,
//           assignedClass: teacher.assigned_class || 'Not Assigned',
//           classId: teacher.class_id || '',
//           isActive: teacher.is_active,
//           joinDate: new Date(teacher.date_joined)
//         }));
//       } else {
//         this.teachers = [];
//       }
//     } catch (error: any) {
//       console.error('Error loading teachers:', error);
//       this.notification.error('Failed to load teachers');
//       this.teachers = [];
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   async loadClasses() {
//     try {
//       const response = await this.apiService.getClasses().toPromise();
//       this.availableClasses = response || [];
//     } catch (error: any) {
//       console.error('Error loading classes:', error);
//       this.availableClasses = [];
//     }
//   }



// addTeacher() {
//   this.router.navigate(['/add-teacher'], {
//     state: { 
//       mode: 'add',
//       returnUrl: '/superintendent' 
//     }
//   });
// }

// // For editing teacher
// editTeacher(teacher: any) {
//   this.router.navigate(['/edit-teacher'], {
//     state: {
//       mode: 'edit',
//       teacherData: teacher,
//       returnUrl: '/superintendent'
//     }
//   });
// }



// assignTeacher() {
//   this.router.navigate(['/assign-teacher'], {
//     state: { 
//       teachers: this.availableTeachers, // Pass your teachers array
//       classes: this.availableClasses,    // Pass your classes array
//       returnUrl: '/superintendent' 
//     }
//   });
// }

//   async deactivateTeacher(teacher: Teacher) {
//     if (confirm(`Are you sure you want to deactivate ${teacher.name}?`)) {
//       try {
//         await this.apiService.deleteTeacher(teacher.id).toPromise();
//         this.notification.success('Teacher deactivated successfully');
//         await this.loadTeachers(); // Refresh the list
//       } catch (error: any) {
//         console.error('Error deactivating teacher:', error);
//         this.notification.error('Failed to deactivate teacher');
//       }
//     }
//   }

//   goBack() {
//     this.router.navigate(['/superintendent']);
//   }



// handleReturnData() {
//   const navigation = this.router.getCurrentNavigation();
//   const state = navigation?.extras?.state as any;
  
//   if (state?.['success']) {
//     this.processTeacherModalResult(state);
//   }
// }

// private async processTeacherModalResult(state: any) {
//   const teacherData = state['teacherData'];
//   const mode = state['mode'];
//   const originalTeacher = state['originalTeacher'];

//   if (mode === 'add') {
//     await this.handleAddTeacher(teacherData);
//   } else if (mode === 'edit') {
//     await this.handleEditTeacher(originalTeacher, teacherData);
//   }
// }

// private async handleAddTeacher(teacherData: any) {
//   // Your add teacher logic here
// }

// private async handleEditTeacher(originalTeacher: any, updatedData: any) {
//   // Your edit teacher logic here
// }



// handleReturnData() {
//   const navigation = this.router.getCurrentNavigation();
//   const state = navigation?.extras?.state as any;
  
//   if (state?.['success']) {
//     if (state['assignmentData']) {
//       this.processAssignmentResult(state);
//     } else if (state['teacherData']) {
//       this.processTeacherModalResult(state);
//     }
//   }
// }



// private async processAssignmentResult(state: any) {
//   const assignmentData = state['assignmentData'];
  
//   if (assignmentData) {
//     try {
//       await this.apiService.assignTeacher({
//         teacher_id: parseInt(assignmentData.teacherId),
//         class_id: parseInt(assignmentData.classId)
//       }).toPromise();
      
//       this.notification.success('Teacher assigned successfully');
//       await this.loadTeachers(); // Refresh the list
//     } catch (error: any) {
//       console.error('Error assigning teacher:', error);
//       this.notification.error('Failed to assign teacher');
//     }
//   }
// }





//   async reassignTeacher(teacher: Teacher) {
//     const currentClass = this.availableClasses.find(c => c.id === teacher.classId);
    
//     const modal = await this.modalController.create({
//       component: ReassignTeacherModalComponent,
//       componentProps: {
//         teacher: teacher,
//         currentClass: currentClass,
//         availableClasses: this.availableClasses.filter(c => c.id !== teacher.classId)
//       }
//     });

//     modal.onDidDismiss().then(async (result) => {
//       if (result.data?.success) {
//         const reassignmentData = result.data.reassignmentData;
        
//         try {
//           await this.apiService.reassignTeacher({
//             teacher_id: parseInt(reassignmentData.teacherId),
//             class_id: parseInt(reassignmentData.newClassId)
//           }).toPromise();
          
//           this.notification.success('Teacher reassigned successfully');
//           await this.loadTeachers(); // Refresh the list
//         } catch (error: any) {
//           console.error('Error reassigning teacher:', error);
//           this.notification.error('Failed to reassign teacher');
//         }
//       }
//     });

//     await modal.present();
//   }








// }



















  // async addTeacher2() {
  //   const modal = await this.modalController.create({
  //     component: TeacherModalComponent,
  //     componentProps: {
  //       mode: 'add'
  //     }
  //   });

  //   modal.onDidDismiss().then(async (result) => {
  //     if (result.data?.success) {
  //       const teacherData = result.data.teacherData;
        
  //       // Add temporary teacher for immediate UI feedback
  //       const tempTeacher: Teacher = {
  //         id: Date.now().toString(),
  //         name: teacherData.name,
  //         phone: teacherData.phone,
  //         email: teacherData.email,
  //         assignedClass: 'Not Assigned',
  //         classId: '',
  //         isActive: true,
  //         joinDate: new Date()
  //       };
  //       this.teachers.unshift(tempTeacher);
        
  //       try {
  //         // Create teacher via API
  //         const createdTeacher = await this.apiService.createTeacher({
  //           name: teacherData.name,
  //           phone: teacherData.phone,
  //           email: teacherData.email,
  //           password: 'default123' // You might want to generate a default password
  //         }).toPromise();
          
  //         this.notification.success('Teacher created successfully');
          
  //         // Replace temporary teacher with real one
  //         const teacherIndex = this.teachers.findIndex(t => t.id === tempTeacher.id);
  //         if (teacherIndex > -1) {
  //           this.teachers[teacherIndex] = {
  //             id: createdTeacher.id.toString(),
  //             name: createdTeacher.name,
  //             phone: createdTeacher.phone,
  //             email: createdTeacher.email,
  //             assignedClass: createdTeacher.assigned_class || 'Not Assigned',
  //             classId: createdTeacher.class_id || '',
  //             isActive: createdTeacher.is_active,
  //             joinDate: new Date(createdTeacher.date_joined)
  //           };
  //         }
  //       } catch (error: any) {
  //         console.error('Error creating teacher:', error);
  //         this.notification.error('Failed to create teacher');
  //         // Remove temporary teacher
  //         this.teachers = this.teachers.filter(t => t.id !== tempTeacher.id);
  //       }
  //     }
  //   });

  //   await modal.present();
  // }

  // async editTeacher3(teacher: Teacher) {
  //   const modal = await this.modalController.create({
  //     component: TeacherModalComponent,
  //     componentProps: {
  //       mode: 'edit',
  //       teacherData: teacher
  //     }
  //   });

  //   modal.onDidDismiss().then(async (result) => {
  //     if (result.data?.success) {
  //       const updatedData = result.data.teacherData;
  //       const teacherIndex = this.teachers.findIndex(t => t.id === teacher.id);
        
  //       if (teacherIndex > -1) {
  //         // Store original data
  //         const originalTeacher = { ...this.teachers[teacherIndex] };
          
  //         // Update locally first
  //         this.teachers[teacherIndex] = {
  //           ...this.teachers[teacherIndex],
  //           name: updatedData.name,
  //           phone: updatedData.phone,
  //           email: updatedData.email
  //         };
          
  //         try {
  //           // Update via API
  //           await this.apiService.updateTeacher(teacher.id, {
  //             name: updatedData.name,
  //             phone: updatedData.phone,
  //             email: updatedData.email
  //           }).toPromise();
            
  //           this.notification.success('Teacher updated successfully');
  //         } catch (error: any) {
  //           console.error('Error updating teacher:', error);
  //           this.notification.error('Failed to update teacher');
  //           // Revert local changes
  //           this.teachers[teacherIndex] = originalTeacher;
  //         }
  //       }
  //     }
  //   });

  //   await modal.present();
  // }



// For adding teacher

