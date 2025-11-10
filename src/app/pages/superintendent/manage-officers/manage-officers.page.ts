

// // officers-management.component.ts
// import { Component, OnInit } from '@angular/core';
// import { IonicModule, ModalController, AlertController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ApiService } from 'src/app/services/api';
// import { Notification } from 'src/app/services/notification';
// import { AddOfficerModalComponent } from 'src/app/components/add-officer-modal/add-officer-modal.component';


// export interface Officer {
//   id: string;
//   name: string;
//   phone: string;
//   email: string;
//   is_active: boolean;
//   is_officer: boolean;
//   date_joined: string;
// }

// @Component({
//  selector: 'app-manage-officers',
//   templateUrl: './manage-officers.page.html',
//   styleUrls: ['./manage-officers.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule]
// })
// export class ManageOfficersPage implements OnInit {
//   officers: Officer[] = [];
//   isLoading: boolean = false;
//   searchTerm: string = '';

//   constructor(
//     private apiService: ApiService,
//     private notification: Notification,
//     private modalController: ModalController,
//     private alertController: AlertController,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadOfficers();
//   }

//   async loadOfficers() {
//     this.isLoading = true;
    
//     try {
//       const response = await this.apiService.getOfficers().toPromise();
//       if (response) {
//         this.officers = response.map((officer: any) => ({
//           id: officer.id.toString(),
//           name: officer.name || 'No Name',
//           phone: officer.phone,
//           email: officer.email || '',
//           is_active: officer.is_active,
//           is_officer: officer.is_officer,
//           date_joined: officer.date_joined
//         }));
//       }
//     } catch (error) {
//       this.notification.error('Failed to load officers');
//       console.error('Error loading officers:', error);
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   get filteredOfficers(): Officer[] {
//     if (!this.searchTerm) return this.officers;
//     return this.officers.filter(officer => 
//       officer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
//       officer.phone.includes(this.searchTerm)
//     );
//   }

//   async openAddOfficerModal() {
//     const modal = await this.modalController.create({
//       component: AddOfficerModalComponent,
//       componentProps: {}
//     });

//     await modal.present();

//     const { data } = await modal.onWillDismiss();
    
//     if (data) {
//       try {
//         const newOfficer = await this.apiService.createOfficer(data).toPromise();
//         this.officers.unshift({
//           id: newOfficer.id.toString(),
//           name: newOfficer.name || 'No Name',
//           phone: newOfficer.phone,
//           email: newOfficer.email || '',
//           is_active: newOfficer.is_active,
//           is_officer: newOfficer.is_officer,
//           date_joined: newOfficer.date_joined
//         });
//         this.notification.success('Officer added successfully!');
//       } catch (error: any) {
//         this.notification.error(error.error?.message || 'Failed to add officer');
//       }
//     }
//   }

//   async toggleOfficerStatus(officer: Officer) {
//     try {
//       const updatedOfficer = await this.apiService.updateOfficer(officer.id, {
//         is_active: !officer.is_active
//       }).toPromise();
      
//       // Update local state
//       officer.is_active = updatedOfficer.is_active;
//       this.notification.success(`Officer ${officer.is_active ? 'activated' : 'deactivated'} successfully!`);
//     } catch (error) {
//       // Revert toggle on error
//       officer.is_active = !officer.is_active;
//       this.notification.error('Failed to update officer status');
//     }
//   }

//   async deleteOfficer(officer: Officer) {
//     const alert = await this.alertController.create({
//       header: 'Remove Officer',
//       message: `Are you sure you want to remove ${officer.name} as an officer? They will still remain as a church member.`,
//       buttons: [
//         {
//           text: 'Cancel',
//           role: 'cancel'
//         },
//         {
//           text: 'Remove',
//           role: 'destructive',
//           handler: async () => {
//             try {
//               await this.apiService.deleteOfficer(officer.id).toPromise();
//               this.officers = this.officers.filter(o => o.id !== officer.id);
//               this.notification.success('Officer removed successfully!');
//             } catch (error) {
//               this.notification.error('Failed to remove officer');
//             }
//           }
//         }
//       ]
//     });

//     await alert.present();
//   }

//   goBack() {
//     this.router.navigate(['/superintendent']);
//   }
// }




import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';
import { AlertController } from '@ionic/angular/standalone';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, 
  IonTitle, IonContent, IonIcon, IonBadge
} from "@ionic/angular/standalone";
import { Subject, takeUntil, filter } from 'rxjs';

export interface Officer {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_officer: boolean;
  date_joined: string;
}

@Component({
  selector: 'app-manage-officers',
  templateUrl: './manage-officers.page.html',
  styleUrls: ['./manage-officers.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton, 
    IonTitle, IonContent, IonIcon, IonBadge
  ]
})
export class ManageOfficersPage implements OnInit, OnDestroy {
   private destroy$ = new Subject<void>();
  officers: Officer[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';

  private apiService = inject(ApiService);
  private notification = inject(Notification);
  private alertController = inject(AlertController);
  private router = inject(Router);

 


  ngOnInit() {
    this.loadOfficers();
    this.handleReturnData();
  
  this.router.events.pipe(
    takeUntil(this.destroy$),
    filter(event => event instanceof NavigationEnd),
    filter(() => this.router.url.includes('/manage-officers'))
  ).subscribe(() => {
     this.loadOfficers(); // Always refresh when navigating to books page
     this.handleReturnData();
  });
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }




  async loadOfficers() {
    this.isLoading = true;
    
    try {
      const response = await this.apiService.getOfficers().toPromise();
      if (response) {
        this.officers = response.map((officer: any) => ({
          id: officer.id.toString(),
          name: officer.name || 'No Name',
          phone: officer.phone,
          email: officer.email || '',
          is_active: officer.is_active,
          is_officer: officer.is_officer,
          date_joined: officer.date_joined
        }));
      }
    } catch (error) {
      this.notification.error('Failed to load officers');
      console.error('Error loading officers:', error);
    } finally {
      this.isLoading = false;
    }
  }

  get filteredOfficers(): Officer[] {
    if (!this.searchTerm) return this.officers;
    return this.officers.filter(officer => 
      officer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      officer.phone.includes(this.searchTerm)
    );
  }





  openAddOfficerModal() {
    this.router.navigate(['/add-officer'], {
      state: { 
        mode: 'add',
        returnUrl: '/manage-officers'
      }
    });
  }

  async toggleOfficerStatus(officer: Officer) {
    try {
      const updatedOfficer = await this.apiService.updateOfficer(officer.id, {
        is_active: !officer.is_active
      }).toPromise();
      
      // Update local state
      officer.is_active = updatedOfficer.is_active;
      this.notification.success(`Officer ${officer.is_active ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      // Revert toggle on error
      officer.is_active = !officer.is_active;
      this.notification.error('Failed to update officer status');
    }
  }

  async deleteOfficer(officer: Officer) {
    const alert = await this.alertController.create({
      header: 'Remove Officer',
      message: `Are you sure you want to remove ${officer.name} as an officer? They will still remain as a church member.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: async () => {
            try {
              await this.apiService.deleteOfficer(officer.id).toPromise();
              this.officers = this.officers.filter(o => o.id !== officer.id);
              this.notification.success('Officer removed successfully!');
            } catch (error) {
              this.notification.error('Failed to remove officer');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  goBack() {
    this.router.navigate(['/superintendent']);
  }

  // Handle return data from officer modal routes
  handleReturnData() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state?.['success']) {
      if (state['officerData']) {
        this.processOfficerModalResult(state);
      }
    }
  }

  private processOfficerModalResult(state: any) {
    const officerData = state['officerData'];
    const mode = state['mode'];

    if (mode === 'add') {
      this.handleAddOfficer(officerData);
    }
  }

  private handleAddOfficer(officerData: any) {
    // Add the new officer to the list
    const newOfficer: Officer = {
      id: officerData.id.toString(),
      name: officerData.name || 'No Name',
      phone: officerData.phone,
      email: officerData.email || '',
      is_active: officerData.is_active,
      is_officer: officerData.is_officer,
      date_joined: officerData.date_joined
    };
    
    this.officers.unshift(newOfficer);
    this.notification.success('Officer added successfully!');
  }
}