
import { Component, OnInit,inject } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';
import { FeatureGuard } from 'src/app/services/feature-guard';
import { ReactiveFormsModule } from '@angular/forms';



export interface Class {
  id: string;
  name: string;
  teacher: string;
  teacherPhone?: string;
  memberCount: number;
  location: string;
  createdAt: Date;
  classId?: string; 
}


@Component({
  selector: 'app-classes-management',
  templateUrl: './classes-management.component.html',
  styleUrls: ['./classes-management.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ClassesManagementComponent implements OnInit {

  classes: Class[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notification = inject(Notification);  
  public featureGuard = inject(FeatureGuard);
  private modalCtrl = inject(ModalController);

 
  ngOnInit() {
  this.loadClasses();
  this.handleReturnData();
}

 
  async loadClasses() {
  this.isLoading = true;
  this.errorMessage = '';

  try {
    const response = await this.apiService.getClasses().toPromise();
    
    if (response) {
      // Transform the backend response to match our frontend interface
      this.classes = response.map(classItem => ({
        id: classItem.id.toString(),
        name: classItem.name,
        teacher: classItem.teacher_name || 'Not Assigned',
        teacherPhone: classItem.teacher_phone,
        memberCount: classItem.member_count || 0,
        location: classItem.location,
        createdAt: new Date(classItem.created_at)
      }));

      // this.notification.success('Classes loaded successfully');
      console.log(this.classes)
    } else {
      this.classes = [];
     console.error('No classes found');
    }
  } catch (error: any) {
    console.error('Error loading classes:', error);
    this.errorMessage = 'Failed to load classes. Please try again.';
    this.notification.error('Failed to load classes');
  } finally {
    this.isLoading = false;
  }
}



private assignTeacherToClass(classId: number, teacherName: string, teacherPhone: string) {
  // First, check if teacher exists or create a new teacher user
  // This is a simplified version - you might need a proper teacher management system
  const teacherData = {
    name: teacherName,
    phone: teacherPhone,
    role: 'teacher'
  };
  
  // You'll need to implement this method in your ApiService
  // this.apiService.assignTeacherToClass(classId, teacherData).subscribe({
  //   next: (response) => {
  //     console.log('Teacher assigned successfully:', response);
  //     this.notification.success('Teacher assigned to class');
  //     // Refresh the class to get updated teacher info
  //     this.loadClasses();
  //   },
  //   error: (error) => {
  //     console.error('Error assigning teacher:', error);
  //     this.notification.warning('Class created but failed to assign teacher');
  //   }
  // });
}



async addClass() {
  console.log('button clicked');
  this.router.navigate(['/add-class'], {
    state: { 
      mode: 'add',
      returnUrl: '/superintendent' // or your current page path
    }
  });
}

async editClass(classItem: Class) {
  this.router.navigate(['/edit-class'], {
    state: {
      mode: 'edit',
      classData: {
        ...classItem,
        teacherId: classItem.classId || ''
      },
      returnUrl: '/superintendent'
    }
  });
}

  
  async deleteClass(classItem: Class) {
  if (confirm(`Are you sure you want to delete "${classItem.name}"?`)) {
    try {
      await this.apiService.deleteClass(classItem.id).toPromise();
      this.notification.success(`Class "${classItem.name}" deleted successfully`);
      this.loadClasses(); // Reload the list
    } catch (error: any) {
      console.error('Error deleting class:', error);
      this.notification.error('Failed to delete class');
    }
  }
}



  viewClassDetails(classItem: Class) {
    // Navigate to class details page
    this.router.navigate(['/superintendent/class-details', classItem.id]);
  }

  async refreshClasses(event: any) {
    await this.loadClasses();
    event.target.complete();
  }

goBack() {
    this.router.navigate(['/superintendent']);
  }








handleReturnData() {
  const navigation = this.router.getCurrentNavigation();
  const state = navigation?.extras?.state as any;
  
  if (state?.['success']) {
    this.processModalResult(state);
  }
}

private async processModalResult(state: any) {
  const classData = state['classData'];
  const mode = state['mode'];
  const originalClass = state['originalClass'];

  if (mode === 'add') {
    await this.handleAddClass(classData);
  } else if (mode === 'edit') {
    await this.handleEditClass(originalClass, classData);
  }
}

private async handleAddClass(classData: any) {
  // Add temporary class for immediate UI feedback
  const tempClass: Class = {
    id: Date.now().toString(),
    name: classData.name,
    teacher: 'Not Assigned',
    teacherPhone: '',
    memberCount: 0,
    location: classData.location,
    createdAt: new Date()
  };
  this.classes.unshift(tempClass);
  
  try {
    // Create class via API
    const createdClass = await this.apiService.createClass({
      name: classData.name,
      location: classData.location
    }).toPromise();
    
    this.notification.success('Class created successfully');
    
    // Replace temporary class with real one
    const classIndex = this.classes.findIndex(c => c.id === tempClass.id);
    if (classIndex > -1) {
      this.classes[classIndex] = {
        id: createdClass.id.toString(),
        name: createdClass.name,
        teacher: createdClass.teacher_name || 'Not Assigned',
        teacherPhone: createdClass.teacher_phone || '',
        memberCount: createdClass.member_count || 0,
        location: createdClass.location,
        createdAt: new Date(createdClass.created_at)
      };
    }

    // Assign teacher if selected
    if (classData.teacherId) {
      await this.apiService.assignTeacher({
        teacher_id: parseInt(classData.teacherId),
        class_id: parseInt(createdClass.id)
      }).toPromise();
      this.notification.success('Teacher assigned to class');
      await this.loadClasses(); // Refresh to get updated teacher info
    }
  } catch (error: any) {
    console.error('Error creating class:', error);
    this.notification.error('Failed to create class');
    // Remove temporary class
    this.classes = this.classes.filter(c => c.id !== tempClass.id);
  }
}

private async handleEditClass(originalClass: any, updatedData: any) {
  const classIndex = this.classes.findIndex(c => c.id === originalClass.id);
  
  if (classIndex > -1) {
    // Store original data
    const originalClassData = { ...this.classes[classIndex] };
    
    // Update locally first
    this.classes[classIndex] = {
      ...this.classes[classIndex],
      name: updatedData.name,
      location: updatedData.location
    };
    
    try {
      // Update class via API
      await this.apiService.updateClass(originalClass.id, {
        name: updatedData.name,
        location: updatedData.location
      }).toPromise();
      
      this.notification.success('Class updated successfully');

      // Handle teacher assignment if changed
      if (updatedData.teacherId && updatedData.teacherId !== originalClass.classId) {
        await this.apiService.assignTeacher({
          teacher_id: parseInt(updatedData.teacherId),
          class_id: parseInt(originalClass.id)
        }).toPromise();
        this.notification.success('Teacher assigned to class');
        await this.loadClasses(); // Refresh to get updated teacher info
      }
    } catch (error: any) {
      console.error('Error updating class:', error);
      this.notification.error('Failed to update class');
      // Revert local changes
      this.classes[classIndex] = originalClassData;
    }
  }
}



   async handleRefresh(event: any) {
    try {
      // Call your refresh methods
      //await this.loadData();
       await this.loadClasses();
       await this.handleReturnData();
      
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