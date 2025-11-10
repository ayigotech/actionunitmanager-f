
// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule } from '@ionic/angular';
// import { ApiService } from 'src/app/services/api';
// import { Notification } from 'src/app/services/notification';

// interface BookItem {
//   bookTitle: string;
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;
// }

// interface BooksSummary {
//   classId: string;
//   className: string;
//   teacherName: string;
//   quarter: string;
//   orderDate: string;
//   totalOrderValue: number;
//   totalOrderQty: number;
//   status: 'ordered' | 'delivered' | 'pending';
//   books: BookItem[];
// }

// @Component({
//   selector: 'app-quarterly-orders',
//   templateUrl: './quarterly-orders.page.html',
//   styleUrls: ['./quarterly-orders.page.scss'],
//   standalone: true,
//   imports: [CommonModule, IonicModule]
// })
// export class QuarterlyOrdersPage {

//   booksData: BooksSummary[] = [];
//   filteredData: BooksSummary[] = [];
//   availableQuarters: string[] = [];
//   selectedQuarter: string = '';
//   isLoading: boolean = false;




//   constructor(
//     private apiService: ApiService,
//     private notification: Notification
//   ) {
//     this.loadOrdersData()
//     this.filterData();
//   }


//    async loadOrdersData() {
//     this.isLoading = true;
    
//     try {
//       // Load available quarters
//       const quartersResponse = await this.apiService.getSuperintendentOrdersQuarters().toPromise();
      
//       if (quartersResponse) {
//         this.availableQuarters = quartersResponse;
//         this.selectedQuarter = quartersResponse[0] || '';
//       }

//       // Load orders data
//       const ordersResponse = await this.apiService.getSuperintendentBookOrders().toPromise();
      
//       if (ordersResponse) {

       

//         this.booksData = ordersResponse.map((order: any) => ({
//           classId: order.class_id.toString(),
//           className: order.class_name,
//           teacherName: order.teacher_name,
//           quarter: order.quarter,
//           orderDate: order.order_date,
//           totalOrderQty: order.total_order_qty,
//           totalOrderValue: order.total_order_value,
//           status: this.mapOrderStatus(order.status),
//           books: order.books.map((book: any) => ({
//             bookTitle: book.book_title,
//             quantity: book.quantity,
//             unitPrice: book.unit_price,
//             totalPrice: book.total_price
//           }))
//         }));

//           // Generate available quarters from the loaded data
//         this.availableQuarters = [...new Set(this.booksData.map(item => item.quarter))].sort();
//         this.selectedQuarter = this.availableQuarters[0] || '';
        
//         this.filterData();
//       }
//     } catch (error) {
//       this.notification.error('Failed to load orders data');
//       console.error('Error loading orders:', error);
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   private mapOrderStatus(backendStatus: string): 'ordered' | 'delivered' | 'pending' {
//     switch (backendStatus) {
//       case 'submitted': return 'ordered';
//       case 'approved': return 'delivered';
//       default: return 'pending';
//     }
//   }


//    filterData() {
//     if (this.selectedQuarter) {
//       // Extract quarter and year from selectedQuarter (format: "Q1-Q2 2024")
//       const [quarter, year] = this.selectedQuarter.split(' ');
//       this.filteredData = this.booksData.filter(item => 
//         item.quarter === this.selectedQuarter
//       );
//     } else {
//       this.filteredData = [...this.booksData];
//     }
//   }

//   onQuarterChange(event: any) {
//     this.selectedQuarter = event.detail.value;
//     this.filterData();
//   }



//   async onRefresh(event: any) {
//     await this.loadOrdersData();
//     event.target.complete();
//   }


//   getTotalBooks(): number {
//     return this.filteredData.reduce((total, classOrder) => 
//       total + classOrder.books.reduce((sum, book) => sum + book.quantity, 0), 0
//     );
//   }

//   getTotalValue(): number {
//     return this.filteredData.reduce((total, classOrder) => total + classOrder.totalOrderValue, 0);
//   }

//   getClassesCount(): number {
//     return this.filteredData.length;
//   }

//   exportToExcel() {
//   const data: any[] = [];
  
//   this.filteredData.forEach((classOrder: BooksSummary) => {
//     classOrder.books.forEach((book: BookItem) => {
//       data.push({
//         'Class Name': classOrder.className,
//         'Teacher': classOrder.teacherName,
//         'Quarter': classOrder.quarter,
//         'Order Date': classOrder.orderDate,
//         'Book Title': book.bookTitle,
//         'Quantity': book.quantity,
//         'Unit Price': `GHS ${book.unitPrice.toFixed(2)}`,
//         'Total Price': `GHS ${book.totalPrice.toFixed(2)}`,
//         'Status': classOrder.status
//       });
//     });
//   });

//   // Add summary row
//   data.push({
//     'Class Name': 'TOTAL SUMMARY',
//     'Teacher': '',
//     'Quarter': '',
//     'Order Date': '',
//     'Book Title': '',
//     'Quantity': this.getTotalBooks(),
//     'Unit Price': '',
//     'Total Price': `GHS ${this.getTotalValue().toFixed(2)}`,
//     'Status': ''
//   });

//   console.log('Excel Export Data:', data);
//   alert('Excel export functionality will be implemented with SheetJS');
// }

// exportToPDF() {
//   const summary = {
//     quarter: this.selectedQuarter,
//     totalClasses: this.getClassesCount(),
//     totalBooks: this.getTotalBooks(),
//     totalValue: this.getTotalValue()
//   };

//   console.log('PDF Export Data:', {
//     summary,
//     orders: this.filteredData
//   });
//   alert('PDF export functionality will be implemented with jsPDF');
// }
// }





import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, 
  IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, IonLabel,
  IonBadge, IonIcon, IonButton
} from "@ionic/angular/standalone";

interface BookItem {
  bookTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BooksSummary {
  classId: string;
  className: string;
  teacherName: string;
  quarter: string;
  orderDate: string;
  totalOrderValue: number;
  totalOrderQty: number;
  status: 'ordered' | 'delivered' | 'pending';
  books: BookItem[];
}

@Component({
  selector: 'app-quarterly-orders',
  templateUrl: './quarterly-orders.page.html',
  styleUrls: ['./quarterly-orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, 
    IonTitle, IonContent, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent,
    IonBadge, IonIcon, IonButton
  ]
})
export class QuarterlyOrdersPage {
  booksData: BooksSummary[] = [];
  filteredData: BooksSummary[] = [];
  availableQuarters: string[] = [];
  isLoading: boolean = false;
  filterForm!: FormGroup;

  private apiService = inject(ApiService);
  private notification = inject(Notification);
  private fb = inject(FormBuilder);

  constructor() {
    this.initializeForm();
    this.loadOrdersData();
  }

  initializeForm() {
    this.filterForm = this.fb.group({
      selectedQuarter: ['']
    });

    // Listen for quarter changes
    this.filterForm.get('selectedQuarter')?.valueChanges.subscribe(quarter => {
      this.filterData(quarter);
    });
  }

  async loadOrdersData() {
    this.isLoading = true;
    
    try {
      const ordersResponse = await this.apiService.getSuperintendentBookOrders().toPromise();
      
      if (ordersResponse) {
        this.booksData = ordersResponse.map((order: any) => ({
          classId: order.class_id.toString(),
          className: order.class_name,
          teacherName: order.teacher_name,
          quarter: order.quarter,
          orderDate: order.order_date,
          totalOrderQty: order.total_order_qty,
          totalOrderValue: order.total_order_value,
          status: this.mapOrderStatus(order.status),
          books: order.books.map((book: any) => ({
            bookTitle: book.book_title,
            quantity: book.quantity,
            unitPrice: book.unit_price,
            totalPrice: book.total_price
          }))
        }));

        // Generate available quarters from the loaded data
        this.availableQuarters = [...new Set(this.booksData.map(item => item.quarter))].sort();
        
        // Set initial quarter and update form
        const initialQuarter = this.availableQuarters[0] || '';
        this.filterForm.patchValue({ selectedQuarter: initialQuarter });
      }
    } catch (error) {
      this.notification.error('Failed to load orders data');
      console.error('Error loading orders:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private mapOrderStatus(backendStatus: string): 'ordered' | 'delivered' | 'pending' {
    switch (backendStatus) {
      case 'submitted': return 'ordered';
      case 'approved': return 'delivered';
      default: return 'pending';
    }
  }

  filterData(quarter: string) {
    if (quarter) {
      this.filteredData = this.booksData.filter(item => item.quarter === quarter);
    } else {
      this.filteredData = [...this.booksData];
    }
  }

  async onRefresh(event: any) {
    await this.loadOrdersData();
    if (event && event.target) {
      event.target.complete();
    }
  }

  getTotalBooks(): number {
    return this.filteredData.reduce((total, classOrder) => 
      total + classOrder.books.reduce((sum, book) => sum + book.quantity, 0), 0
    );
  }

  getTotalValue(): number {
    return this.filteredData.reduce((total, classOrder) => total + classOrder.totalOrderValue, 0);
  }

  getClassesCount(): number {
    return this.filteredData.length;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'delivered': return 'success';
      case 'ordered': return 'custom-primary';
      default: return 'warning';
    }
  }

  exportToExcel() {
    const data: any[] = [];
    
    this.filteredData.forEach((classOrder: BooksSummary) => {
      classOrder.books.forEach((book: BookItem) => {
        data.push({
          'Class Name': classOrder.className,
          'Teacher': classOrder.teacherName,
          'Quarter': classOrder.quarter,
          'Order Date': classOrder.orderDate,
          'Book Title': book.bookTitle,
          'Quantity': book.quantity,
          'Unit Price': `GHS ${book.unitPrice.toFixed(2)}`,
          'Total Price': `GHS ${book.totalPrice.toFixed(2)}`,
          'Status': classOrder.status
        });
      });
    });

    // Add summary row
    data.push({
      'Class Name': 'TOTAL SUMMARY',
      'Teacher': '',
      'Quarter': '',
      'Order Date': '',
      'Book Title': '',
      'Quantity': this.getTotalBooks(),
      'Unit Price': '',
      'Total Price': `GHS ${this.getTotalValue().toFixed(2)}`,
      'Status': ''
    });

    console.log('Excel Export Data:', data);
    alert('Excel export functionality will be implemented with SheetJS');
  }

  exportToPDF() {
    const summary = {
      quarter: this.filterForm.get('selectedQuarter')?.value,
      totalClasses: this.getClassesCount(),
      totalBooks: this.getTotalBooks(),
      totalValue: this.getTotalValue()
    };

    console.log('PDF Export Data:', {
      summary,
      orders: this.filteredData
    });
    alert('PDF export functionality will be implemented with jsPDF');
  }
}