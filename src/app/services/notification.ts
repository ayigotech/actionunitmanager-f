// import { Injectable, inject } from '@angular/core';
// import { ToastController } from '@ionic/angular';
// import { Toast } from '@capacitor/toast';
// import { Capacitor } from '@capacitor/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class Notification {
//   private toastController = inject(ToastController);
//   private isNative = Capacitor.isNativePlatform();

//   // Success notification
//   async success(message: string, title: string = 'Success') {
//     await this.showNotification(message, title, 'success');
//   }

//   // Error notification
//   async error(message: string, title: string = 'Error') {
//     await this.showNotification(message, title, 'error');
//   }

//   // Warning notification
//   async warning(message: string, title: string = 'Warning') {
//     await this.showNotification(message, title, 'warning');
//   }

//   // Info notification
//   async info(message: string, title: string = 'Info') {
//     await this.showNotification(message, title, 'info');
//   }

//   // Custom notification
//   async show(options: {
//     message: string;
//     title?: string;
//     color?: string;
//     duration?: number;
//     position?: 'top' | 'bottom' | 'middle';
//   }) {
//     await this.showNotification(
//       options.message, 
//       options.title || 'Info', 
//       this.mapColorToType(options.color)
//     );
//   }

//   private async showNotification(message: string, title: string, type: 'success' | 'error' | 'warning' | 'info') {
//     if (this.isNative) {
//       await this.showNativeToast(message, title, type);
//     } else {
//       await this.showIonicToast(message, title, type);
//     }
//   }



// private async showNativeToast(message: string, title: string, type: 'success' | 'error' | 'warning' | 'info') {
//   const emojis = {
//     success: '✅',
//     error: '❌', 
//     warning: '⚠️',
//     info: 'ℹ️'
//   };
  
//   const positions = {
//     success: 'top' as const,
//     error: 'center' as const,
//     warning: 'top' as const, 
//     info: 'bottom' as const
//   };

//   // Explicitly type the duration values
//   let duration: 'short' | 'long';
//   if (type === 'error' || type === 'warning') {
//     duration = 'long';
//   } else {
//     duration = 'short';
//   }

//   await Toast.show({
//     text: `${emojis[type]} ${title}: ${message}`,
//     duration: duration,
//     position: positions[type]
//   });
// }



//   private async showIonicToast(message: string, title: string, type: 'success' | 'error' | 'warning' | 'info') {
//     const colors = {
//       success: 'success',
//       error: 'danger',
//       warning: 'warning',
//       info: 'primary'
//     };

//     const icons = {
//       success: 'checkmark-circle',
//       error: 'alert-circle',
//       warning: 'warning',
//       info: 'information-circle'
//     };

//     const durations = {
//       success: 3000,
//       error: 5000,
//       warning: 4000,
//       info: 3000
//     };

//     const toast = await this.toastController.create({
//       header: title,
//       message: message,
//       duration: durations[type],
//       position: 'top',
//       color: colors[type],
//       icon: icons[type],
//       buttons: [
//         {
//           icon: 'close',
//           role: 'cancel'
//         }
//       ]
//     });
    
//     await toast.present();
//   }

//   private mapColorToType(color?: string): 'success' | 'error' | 'warning' | 'info' {
//     switch (color) {
//       case 'success': return 'success';
//       case 'danger': return 'error';
//       case 'warning': return 'warning';
//       case 'primary': 
//       default: return 'info';
//     }
//   }






//  extractErrorMessage(error: any): string {
//   if (error.error && error.error.details) {
//     // Django REST framework error format
//     const details = error.error.details;
    
//     if (details.non_field_errors && details.non_field_errors.length > 0) {
//       return details.non_field_errors[0];
//     }
    
//     // Check all field errors
//     for (const field in details) {
//       if (details[field].length > 0) {
//         return `${field}: ${details[field][0]}`;
//       }
//     }
//   }
  
//   if (error.error && error.error.error) {
//     return error.error.error;
//   }
  
//   if (error.status === 0) {
//     return 'Cannot connect to server. Please check your internet connection.';
//   }
  
//   if (error.status === 401) {
//     return 'Invalid email or password. Please try again.';
//   }
  
//   if (error.status === 400) {
//     return 'Invalid request. Please check your input.';
//   }
  
//   if (error.status === 500) {
//     return 'Server error. Please try again later.';
//   }
  
//   return 'An unexpected error occurred. Please try again.';
// }

// }



import { Injectable } from '@angular/core';
import * as iziToast from 'izitoast'; // Import at top level

@Injectable({
  providedIn: 'root'
})
export class Notification {
  
  constructor() {
    // Optional: Configure global iziToast settings
    iziToast.settings({
      timeout: 3000,
      resetOnHover: true,
      icon: 'material-icons',
      transitionIn: 'flipInX',
      transitionOut: 'flipOutX',
      position: 'topRight'
    });
  }

  success(message: string, title: string = 'Success') {
    iziToast.success({
      title,
      message,
      backgroundColor: '#28a745',
      theme: 'dark'
    });
  }

  error(message: string, title: string = 'Error') {
    // console.log('🔔 NotificationService.error called:', { title, message }); // Add this

     // Handle undefined or null messages
      const safeMessage = message || 'An error occurred';
      const safeTitle = title || 'Error';

    iziToast.error({
      title,
      message,
      backgroundColor: '#dc3545',
      theme: 'dark'
    });
  }

  warning(message: string, title: string = 'Warning') {
    iziToast.warning({
      title,
      message,
      backgroundColor: '#ffc107',
      theme: 'dark',
      timeout: 8000
    });
  }

  info(message: string, title: string = 'Info') {
    iziToast.info({
      title,
      message,
      backgroundColor: '#17a2b8',
      theme: 'dark'
    });
  }



   extractErrorMessage(error: any): string {
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
