

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Notification } from 'src/app/services/notification';
import { AlertController, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/services/api';

// Import specific Ionic components
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, 
  IonTitle, IonContent, IonIcon, IonBadge
} from "@ionic/angular/standalone";
import { filter, Subject, takeUntil } from 'rxjs';

export interface QuarterlyBook {
  id: string;
  title: string;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-manage-books',
  templateUrl: './manage-books.page.html',
  styleUrls: ['./manage-books.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton,
    IonTitle, IonContent, IonIcon, IonBadge,
    IonRefresher,
    IonRefresherContent
]
})
export class ManageBooksPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  books: QuarterlyBook[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';

  private notification = inject(Notification);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private apiService = inject(ApiService);

 
  ngOnInit() {
  this.loadBooks();
  
  this.router.events.pipe(
    takeUntil(this.destroy$),
    filter(event => event instanceof NavigationEnd),
    filter(() => this.router.url.includes('/manage-books'))
  ).subscribe(() => {
    this.loadBooks(); // Always refresh when navigating to books page
  });
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadBooks() {
    this.isLoading = true;
    
    try {
      const booksResponse = await this.apiService.getQuarterlyBooks().toPromise();
      
      if (booksResponse) {
        this.books = booksResponse.map((book: any) => ({
          id: book.id.toString(),
          title: book.title,
          price: parseFloat(book.price),
          currency: book.currency,
          isActive: book.is_active,
          createdAt: new Date(book.created_at),
          updatedAt: new Date(book.updated_at)
        }));
      } else {
        this.books = [];
      }
    } catch (error) {
      this.notification.error('Failed to load books');
      console.error('Error loading books:', error);
      this.books = [];
    } finally {
      this.isLoading = false;
    }
  }



  openAddBookModal() {
    this.router.navigate(['/add-book'], {
      state: { 
        mode: 'add',
        returnUrl: '/manage-books'
      }
    });
  }

  openEditBookModal(book: QuarterlyBook) {
    this.router.navigate(['/edit-book'], {
      state: {
        mode: 'edit',
        bookData: book,
        returnUrl: '/manage-books'
      }
    });
  }

  async deleteBook(book: QuarterlyBook) {
    const confirmed = await this.showDeleteConfirmation(book.title);
    if (!confirmed) return;

    try {
      await this.apiService.deleteQuarterlyBook(book.id).toPromise();
      
      // Remove book from list
      const index = this.books.findIndex(b => b.id === book.id);
      if (index > -1) {
        this.books.splice(index, 1);
      }
      
      this.notification.success('Book deleted successfully!');
    } catch (error) {
      this.notification.error('Failed to delete book');
      console.error('Error deleting book:', error);
    }
  }

  async toggleBookStatus(book: QuarterlyBook) {
    try {
      const bookData = {
        title: book.title,
        price: book.price,
        currency: book.currency,
        is_active: !book.isActive
      };
      
      const response = await this.apiService.updateQuarterlyBook(book.id, bookData).toPromise();
      
      // Update book status in list
      const index = this.books.findIndex(b => b.id === book.id);
      if (index > -1) {
        this.books[index].isActive = response.is_active;
        this.books[index].updatedAt = new Date(response.updated_at);
      }
      
      this.notification.success(`Book ${response.is_active ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      // Revert toggle on error
      book.isActive = !book.isActive;
      this.notification.error('Failed to update book status');
      console.error('Error updating book status:', error);
    }
  }

  private async showDeleteConfirmation(bookTitle: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Confirm Delete',
        message: `Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => resolve(true)
          }
        ]
      });
      
      await alert.present();
    });
  }

  get filteredBooks(): QuarterlyBook[] {
    if (!this.searchTerm) return this.books;
    return this.books.filter(book => 
      book.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  goBack() {
    this.router.navigate(['/superintendent']);
  }

  // Handle return data from book modal routes
  handleReturnData() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state?.['success']) {
      if (state['bookData']) {
        this.processBookModalResult(state);
      }
    }
  }

  private processBookModalResult(state: any) {
    const bookData = state['bookData'];
    const mode = state['mode'];
    const originalBook = state['originalBook'];

    if (mode === 'add') {
      this.handleAddBook(bookData);
    } else if (mode === 'edit') {
      this.handleEditBook(originalBook, bookData);
    }
  }

  private handleAddBook(bookData: any) {
    // Add the new book to the list
    const newBook: QuarterlyBook = {
      id: bookData.id.toString(),
      title: bookData.title,
      price: parseFloat(bookData.price),
      currency: bookData.currency,
      isActive: bookData.is_active,
      createdAt: new Date(bookData.created_at),
      updatedAt: new Date(bookData.updated_at)
    };
    
    this.books.unshift(newBook);
    this.notification.success('Book added successfully!');
  }

  private handleEditBook(originalBook: any, updatedData: any) {
    // Update the book in the list
    const index = this.books.findIndex(b => b.id === originalBook.id);
    if (index > -1) {
      this.books[index] = {
        ...this.books[index],
        title: updatedData.title,
        price: parseFloat(updatedData.price),
        currency: updatedData.currency,
        isActive: updatedData.is_active,
        updatedAt: new Date(updatedData.updated_at)
      };
    }
    this.notification.success('Book updated successfully!');
  }










  async handleRefresh(event: any) {
    try {
      // Call your refresh methods
      await this.loadBooks();
      
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