

// import { Component, OnInit } from '@angular/core';
// import { IonicModule, ModalController, ToastController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AuthService } from '../../../services/auth';
// import { ApiService } from 'src/app/services/api';
// import { Notification } from 'src/app/services/notification';

// export interface Book {
//   id: string;
//   title: string;
//   price: number;
//   quantity: number;
//   total: number;
//   currency: string; // Add this
// }

// export interface BookOrder {
//   id: string;
//   quarter: string;
//   year: number;
//   books: Book[];
//   totalAmount: number;
//   status: 'draft' | 'submitted' | 'approved';
//   submittedDate?: Date;
// }

// @Component({
//   selector: 'app-books-ordering',
//   templateUrl: './books-ordering.component.html',
//   styleUrls: ['./books-ordering.component.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule]
// })
// export class BooksOrderingComponent implements OnInit {
//   user: any;
//   classInfo: any;
//   currentOrder: BookOrder | null = null;
//   availableBooks: Book[] = [];
//   isLoading: boolean = false;
//   isSubmitting: boolean = false;




//     // Quarter and Year Selection
//   selectedQuarter: string = '';
//   selectedYear: number = new Date().getFullYear();

//   quarters = [
//     { value: 'Q1-Q2', label: 'Q1-Q2' },
//     { value: 'Q3-Q4', label: 'Q3-Q4' },
    
//   ];

//   years: number[] = [];

//   currentYear: number = new Date().getFullYear();

//   constructor(
//     private authService: AuthService,
//     private apiService: ApiService,
//     private notification: Notification,
//     private router: Router,
//   ) {}

//   ngOnInit() {
    
//      this.initializeYears();
//     this.loadBooksData();
//   }



//     initializeYears() {
//     const currentYear = new Date().getFullYear();
//     // Generate years from current year to next 2 years for planning
//     for (let i = 0; i < 3; i++) {
//       this.years.push(currentYear + i);
//     }
//     this.selectedYear = currentYear;
    
//     // Set default quarter based on current month
//     const currentMonth = new Date().getMonth() + 1;
//     this.selectedQuarter = currentMonth <= 6 ? 'Q1-Q2' : 'Q3-Q4';
//   }



//   async loadBooksData() {
//     this.isLoading = true;
    
//     try {
//       // Get teacher's assigned classes
//       const classes = await this.apiService.getTeacherClasses().toPromise();
      
//       if (classes && classes.length > 0) {
//         this.classInfo = classes[0];
        
//         // Get active quarterly books
//         const booksResponse = await this.apiService.getActiveQuarterlyBooks().toPromise();
        
//         if (booksResponse) {
//           this.availableBooks = booksResponse.map((book: any) => ({
//             id: book.id.toString(),
//             title: book.title,
//             price: parseFloat(book.price),
//             currency: book.currency,
//             quantity: 0,
//             total: 0
//           }));
//         }
        
//         // Load order for selected quarter/year
//         await this.loadOrderForSelection();
//       } else {
//         this.notification.error('No class assigned to this teacher');
//       }
//     } catch (error) {
//       this.notification.error('Failed to load books data');
//       console.error('Error loading books data:', error);
//     } finally {
//       this.isLoading = false;
//     }
//   }



//   async onQuarterYearChange() {
//     if (this.selectedQuarter && this.selectedYear) {
//       await this.loadOrderForSelection();
//     }
//   }


//   private async loadOrderForSelection() {
//     try {
//       const ordersResponse = await this.apiService.getBookOrders().toPromise();
      
//       if (ordersResponse) {
//         const existingOrder = ordersResponse.find((order: any) => 
//           order.action_unit_class === this.classInfo.id &&
//           order.quarter === this.selectedQuarter &&
//           order.year === this.selectedYear
//         );
        
//         if (existingOrder) {
//           this.loadExistingOrder(existingOrder);
//         } else {
//           this.createNewOrder();
//         }
//       } else {
//         this.createNewOrder();
//       }
//     } catch (error) {
//       console.error('Error loading order:', error);
//       this.createNewOrder();
//     }
//   }


//    private loadExistingOrder(orderData: any) {
//     this.currentOrder = {
//       id: orderData.id.toString(),
//       quarter: orderData.quarter,
//       year: orderData.year,
//       books: this.availableBooks.map(book => {
//         const orderItem = orderData.order_items.find((item: any) => 
//           item.quarterly_book.toString() === book.id
//         );
//         return {
//           ...book,
//            currency: book.currency,
//           quantity: orderItem ? orderItem.quantity : 0,
//           total: orderItem ? parseFloat(orderItem.total_price) : 0
//         };
//       }),
//       totalAmount: parseFloat(orderData.total_amount),
//       status: orderData.status,
//       submittedDate: orderData.submitted_date ? new Date(orderData.submitted_date) : undefined
//     };
//   }


//   private createNewOrder() {
//     this.currentOrder = {
//       id: 'draft',
//       quarter: this.selectedQuarter,
//       year: this.selectedYear,
//       books: [...this.availableBooks],
//       totalAmount: 0,
//       status: 'draft'
//     };
//   }



//  async submitOrder() {
//   const orderedBooks = this.getOrderedBooks();
//   if (orderedBooks.length === 0) {
//     this.notification.warning('Please add at least one book to your order');
//     return;
//   }

//   this.isSubmitting = true;

//   try {
//     const orderData = {
//       order_items: orderedBooks.map(book => ({
//         quarterly_book: book.id,
//         quantity: book.quantity
//       }))
//     };

//     let response;
//     if (this.currentOrder!.id === 'draft') {
//       // Create new order with submission
//       const createData = {
//         action_unit_class: this.classInfo.id,
//         quarter: this.selectedQuarter,
//         year: this.selectedYear,
//         order_items: orderedBooks.map(book => ({
//           quarterly_book: book.id,
//           quantity: book.quantity
//         }))
//       };
//       response = await this.apiService.createBookOrder(createData).toPromise();
//       // Submit the newly created order
//       response = await this.apiService.submitBookOrder(response.id).toPromise();
//     } else {
//       // Update existing order (regardless of status)
//       response = await this.apiService.updateBookOrder(this.currentOrder!.id, orderData).toPromise();
      
//       // If it was a draft, submit it
//       if (this.currentOrder!.status === 'draft') {
//         response = await this.apiService.submitBookOrder(response.id).toPromise();
//       }
//     }

//     // Update local state
//     this.currentOrder = {
//       id: response.id.toString(),
//       quarter: response.quarter,
//       year: response.year,
//       books: this.currentOrder!.books,
//       totalAmount: parseFloat(response.total_amount),
//       status: 'submitted', // Always set to submitted after save
//       submittedDate: response.submitted_date ? new Date(response.submitted_date) : new Date()
//     };

//     this.notification.success(
//       this.currentOrder!.id === 'draft' ? 'Order submitted successfully!' : 'Order updated successfully!'
//     );
    
//   } catch (error: any) {
//     console.error('Error submitting order:', error);
//     this.notification.error(error.error?.message || 'Failed to submit order');
//   } finally {
//     this.isSubmitting = false;
//   }
// }


//   // Update the updateQuantity method to recalculate totals
//   updateQuantity(book: Book, change: number) {
//     const newQuantity = Math.max(0, book.quantity + change);
//     book.quantity = newQuantity;
//     book.total = newQuantity * book.price;
//     this.calculateTotal();
//   }




//   calculateTotal() {
//     if (this.currentOrder) {
//       this.currentOrder.totalAmount = this.currentOrder.books.reduce(
//         (total, book) => total + book.total, 0
//       );
//     }
//   }

//   getOrderedBooks(): Book[] {
//     return this.currentOrder?.books.filter(book => book.quantity > 0) || [];
//   }

 

//   goBack() {
//     this.router.navigate(['/teacher']);
//   }
// }




import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ApiService } from 'src/app/services/api';
import { Notification } from 'src/app/services/notification';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, 
  IonTitle, IonContent, IonIcon, IonCard, IonCardContent,
  IonSpinner, IonBadge, IonNote
} from "@ionic/angular/standalone";

export interface Book {
  id: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  currency: string;
}

export interface BookOrder {
  id: string;
  quarter: string;
  year: number;
  books: Book[];
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved';
  submittedDate?: Date;
}

@Component({
  selector: 'app-books-ordering',
  templateUrl: './books-ordering.component.html',
  styleUrls: ['./books-ordering.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton, 
    IonTitle, IonContent, IonIcon, IonCard, IonCardContent,
    IonSpinner, IonBadge, IonNote
  ]
})
export class BooksOrderingComponent implements OnInit {
  user: any;
  classInfo: any;
  currentOrder: BookOrder | null = null;
  availableBooks: Book[] = [];
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  selectionForm!: FormGroup;

  // Quarter and Year Selection
  selectedQuarter: string = '';
  selectedYear: number = new Date().getFullYear();

  quarters = [
    { value: 'Q1-Q2', label: 'Q1-Q2' },
    { value: 'Q3-Q4', label: 'Q3-Q4' },
  ];

  years: number[] = [];

  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private notification = inject(Notification);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.initializeForm();
    this.initializeYears();
    this.loadBooksData();
    }

  initializeForm3() {
    const currentMonth = new Date().getMonth() + 1;
    const defaultQuarter = currentMonth <= 6 ? 'Q1-Q2' : 'Q3-Q4';
    
    this.selectionForm = this.fb.group({
      quarter: [defaultQuarter],
      year: [new Date().getFullYear()]
    });

    // Listen for changes
    this.selectionForm.valueChanges.subscribe(values => {
      this.selectedQuarter = values.quarter;
      this.selectedYear = values.year;
      this.onQuarterYearChange();
    });
  }



initializeForm() {
  const currentMonth = new Date().getMonth() + 1;
  const defaultQuarter = currentMonth <= 6 ? 'Q1-Q2' : 'Q3-Q4';
  
  this.selectionForm = this.fb.group({
    quarter: [defaultQuarter],
    year: [new Date().getFullYear()]
  });

  // Set selectedQuarter immediately
  this.selectedQuarter = defaultQuarter;
  this.selectedYear = new Date().getFullYear();

  // Listen for changes
  this.selectionForm.valueChanges.subscribe(values => {
    this.selectedQuarter = values.quarter;
    this.selectedYear = values.year;
    this.onQuarterYearChange();
  });
}


  initializeYears() {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 3; i++) {
      this.years.push(currentYear + i);
    }
  }

  async loadBooksData() {
    this.isLoading = true;
    
    try {
      const classes = await this.apiService.getTeacherClasses().toPromise();
      
      if (classes && classes.length > 0) {
        this.classInfo = classes[0];
        
        const booksResponse = await this.apiService.getActiveQuarterlyBooks().toPromise();
        
        if (booksResponse) {
          this.availableBooks = booksResponse.map((book: any) => ({
            id: book.id.toString(),
            title: book.title,
            price: parseFloat(book.price),
            currency: book.currency,
            quantity: 0,
            total: 0
          }));
        }
        
        await this.loadOrderForSelection();
      } else {
        this.notification.error('No class assigned to this teacher');
      }
    } catch (error) {
      this.notification.error('Failed to load books data');
      console.error('Error loading books data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onQuarterYearChange() {
    if (this.selectedQuarter && this.selectedYear) {
      await this.loadOrderForSelection();
    }
  }


  private async loadOrderForSelection() {
    try {
      const ordersResponse = await this.apiService.getBookOrders().toPromise();
      
      if (ordersResponse) {
        const existingOrder = ordersResponse.find((order: any) => 
          order.action_unit_class === this.classInfo.id &&
          order.quarter === this.selectedQuarter &&
          order.year === this.selectedYear
        );
        
        if (existingOrder) {
          this.loadExistingOrder(existingOrder);
        } else {
          this.createNewOrder();
        }
      } else {
        this.createNewOrder();
      }
    } catch (error) {
      console.error('Error loading order:', error);
      this.createNewOrder();
    }
  }


  private loadExistingOrder(orderData: any) {
    this.currentOrder = {
      id: orderData.id.toString(),
      quarter: orderData.quarter,
      year: orderData.year,
      books: this.availableBooks.map(book => {
        const orderItem = orderData.order_items.find((item: any) => 
          item.quarterly_book.toString() === book.id
        );
        return {
          ...book,
          currency: book.currency,
          quantity: orderItem ? orderItem.quantity : 0,
          total: orderItem ? parseFloat(orderItem.total_price) : 0
        };
      }),
      totalAmount: parseFloat(orderData.total_amount),
      status: orderData.status,
      submittedDate: orderData.submitted_date ? new Date(orderData.submitted_date) : undefined
    };
  }



  private createNewOrder() {
    this.currentOrder = {
      id: 'draft',
      quarter: this.selectedQuarter,
      year: this.selectedYear,
      books: [...this.availableBooks],
      totalAmount: 0,
      status: 'draft'
    };
  }




  async submitOrders() {
    const orderedBooks = this.getOrderedBooks();
    if (orderedBooks.length === 0) {
      this.notification.warning('Please add at least one book to your order');
      return;
    }

    this.isSubmitting = true;

    try {
      const orderData = {
        order_items: orderedBooks.map(book => ({
          quarterly_book: book.id,
          quantity: book.quantity
        }))
      };

      let response;
      if (this.currentOrder!.id === 'draft') {
        const createData = {
          action_unit_class: this.classInfo.id,
          quarter: this.selectedQuarter,
          year: this.selectedYear,
          order_items: orderedBooks.map(book => ({
            quarterly_book: book.id,
            quantity: book.quantity
          }))
        };


        console.log('createData: ', createData)

        response = await this.apiService.createBookOrder(createData).toPromise();
        response = await this.apiService.submitBookOrder(response.id).toPromise();
      } else {
        response = await this.apiService.updateBookOrder(this.currentOrder!.id, orderData).toPromise();
        
        if (this.currentOrder!.status === 'draft') {
          response = await this.apiService.submitBookOrder(response.id).toPromise();
        }
      }

      this.currentOrder = {
        id: response.id.toString(),
        quarter: response.quarter,
        year: response.year,
        books: this.currentOrder!.books,
        totalAmount: parseFloat(response.total_amount),
        status: 'submitted',
        submittedDate: response.submitted_date ? new Date(response.submitted_date) : new Date()
      };

      console.log("currentoder; ", this.currentOrder)

      this.notification.success(
        this.currentOrder!.id === 'draft' ? 'Order submitted successfully!' : 'Order updated successfully!'
      );
      
    } catch (error: any) {
      console.error('Error submitting order:', error);
      this.notification.error(error.error?.message || 'Failed to submit order');
    } finally {
      this.isSubmitting = false;
    }
  }



  async submitOrder() {
  // Add validation for quarter
  if (!this.selectedQuarter || this.selectedQuarter.trim() === '') {
    this.notification.error('Please select a quarter');
    return;
  }

  const orderedBooks = this.getOrderedBooks();
  if (orderedBooks.length === 0) {
    this.notification.warning('Please add at least one book to your order');
    return;
  }

  this.isSubmitting = true;

  try {
    const orderData = {
      action_unit_class: this.classInfo.id,
      quarter: this.selectedQuarter, // This should now have a value
      year: this.selectedYear,
      order_items: orderedBooks.map(book => ({
        quarterly_book: book.id,
        quantity: book.quantity
      }))
    };

    console.log('Submitting order:', orderData);

    let response;
    
    if (this.currentOrder!.id === 'draft') {
      // Create new order and submit it
      response = await this.apiService.createBookOrder(orderData).toPromise();
      response = await this.apiService.submitBookOrder(response.id).toPromise();
    } else {
      // Update existing order and submit if it's draft
      response = await this.apiService.updateBookOrder(this.currentOrder!.id, orderData).toPromise();
      if (this.currentOrder!.status === 'draft') {
        response = await this.apiService.submitBookOrder(response.id).toPromise();
      }
    }

    // Update local state
    this.currentOrder = {
      id: response.id.toString(),
      quarter: response.quarter,
      year: response.year,
      books: this.currentOrder!.books.map(book => {
        const responseBook = response.order_items.find((item: any) => 
          item.quarterly_book.toString() === book.id
        );
        return {
          ...book,
          quantity: responseBook ? responseBook.quantity : 0,
          total: responseBook ? parseFloat(responseBook.total_price) : 0
        };
      }),
      totalAmount: parseFloat(response.total_amount),
      status: response.status,
      submittedDate: response.submitted_date ? new Date(response.submitted_date) : new Date()
    };

    this.notification.success('Order submitted successfully!');
    
  } catch (error: any) {
    console.error('Error submitting order:', error);
    
    // Check if it's a quarter validation error
    if (error.error && (error.error.quarter || error.error.non_field_errors)) {
      this.notification.error('Invalid quarter selection');
    } else {
      this.notification.error(error.error?.message || 'Failed to submit order');
    }
  } finally {
    this.isSubmitting = false;
  }
}









  updateQuantity(book: Book, change: number) {
    const newQuantity = Math.max(0, book.quantity + change);
    book.quantity = newQuantity;
    book.total = newQuantity * book.price;
    this.calculateTotal();
  }

  calculateTotal() {
    if (this.currentOrder) {
      this.currentOrder.totalAmount = this.currentOrder.books.reduce(
        (total, book) => total + book.total, 0
      );
    }
  }

  getOrderedBooks(): Book[] {
    return this.currentOrder?.books.filter(book => book.quantity > 0) || [];
  }

  goBack() {
    this.router.navigate(['/teacher']);
  }
}