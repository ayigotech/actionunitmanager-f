import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Notification } from 'src/app/services/notification';
import { ApiService } from 'src/app/services/api';
import { Router } from '@angular/router';

export interface ImportMemberRow {
  name: string;
  phone: string;
  email?: string;
  class: string;
  location:string;
  hasError?: boolean;
  errorMessage?: string;
}

@Component({
  selector: 'app-bulk-import-members-modal',
  templateUrl: './bulk-import-members-modal.component.html',
  styleUrls: ['./bulk-import-members-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class BulkImportMembersModalComponent {
  private modalCtrl = inject(ModalController);
  private apiService = inject(ApiService);
  private notification = inject(Notification);
  private router = inject(Router)

  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedFile: File | null = null;
  previewData: ImportMemberRow[] = [];
  isProcessing: boolean = false;
  errorMessage: string = '';
   returnUrl: string = '/superintendent';
  
  // For summary
  validRowsCount: number = 0;
  errorRowsCount: number = 0;
  duplicatePhones: string[] = [];

  constructor() {}


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      this.notification.error('Please select a valid Excel or CSV file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      this.notification.error('File size must be less than 10MB');
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.previewData = [];
    
    this.processExcelFile(file);
  }


  clearFile(): void {
    this.selectedFile = null;
    this.previewData = [];
    this.fileInput.nativeElement.value = '';
  }

  async processExcelFile(file: File): Promise<void> {
  this.isProcessing = true;
  
  try {
    let rows: any[] = [];
    
    if (file.name.endsWith('.csv')) {
      // Process CSV files
      const text = await this.readFileAsText(file);
      rows = this.parseCSV(text);
    } else {
      // For Excel files, you'll need a library
      // For now, we'll show a message to use CSV
      this.errorMessage = 'Please use CSV format for now, or install xlsx library for Excel support';
      this.notification.error(this.errorMessage);
      this.selectedFile = null;
      this.fileInput.nativeElement.value = '';
      return;
    }
    
    if (rows.length === 0) {
      this.errorMessage = 'No valid data found in file. Please check the format.';
      this.notification.error(this.errorMessage);
      return;
    }
    
    this.previewData = this.validateRows(rows);
    this.calculateSummary();
    
    // Show success message
    if (this.validRowsCount > 0) {
      this.notification.success(`Found ${this.validRowsCount} valid members to import`);
    } else {
      this.notification.warning('No valid members found. Please check your file format.');
    }
    
  } catch (error: any) {
    console.error('Error processing file:', error);
    this.errorMessage = 'Failed to process file. Please ensure it\'s a valid CSV file with proper headers.';
    this.notification.error(this.errorMessage);
  } finally {
    this.isProcessing = false;
  }
}



  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  private parseCSV(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Better CSV parsing that handles quoted fields and commas within values
  const headers = this.parseCSVLine(lines[0]).map((h: string) => h.trim().toLowerCase());
  
  return lines.slice(1).map((line, index) => {
    try {
      const values = this.parseCSVLine(line);
      const row: any = {};
      
      headers.forEach((header, i) => {
        if (values[i] !== undefined) {
          row[header] = values[i].trim();
        }
      });
      
      return row;
    } catch (error) {
      console.error(`Error parsing line ${index + 2}:`, error);
      return null;
    }
  }).filter(row => row !== null); // Remove failed parses
}

private parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quotes
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      // Regular character
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  return result;
}

private validateRows(rows: any[]): ImportMemberRow[] {
  const validatedRows: ImportMemberRow[] = [];
  const phoneSet = new Set<string>();

  rows.forEach((row, index) => {
    const validatedRow: ImportMemberRow = {
      name: (row.name || row.member || row['member name'] || '').trim(),
      phone: (row.phone || row.telephone || row.mobile || row['phone number'] || '').trim(),
      email: (row.email || row['email address'] || '').trim(),
      class: (row.class || row.classname || row['class name'] || row.group || '').trim(),
      location: (row.location || row.address || '').trim()
    };

    // Reset error state
    validatedRow.hasError = false;
    validatedRow.errorMessage = '';

    // Check required fields
    const missingFields: string[] = [];
    if (!validatedRow.name) missingFields.push('name');
    if (!validatedRow.phone) missingFields.push('phone');
    if (!validatedRow.class) missingFields.push('class');

    if (missingFields.length > 0) {
      validatedRow.hasError = true;
      validatedRow.errorMessage = `Missing: ${missingFields.join(', ')}`;
    }

    // Validate phone format (basic check)
    if (validatedRow.phone && !this.isValidPhone(validatedRow.phone)) {
      validatedRow.hasError = true;
      validatedRow.errorMessage = validatedRow.errorMessage 
        ? `${validatedRow.errorMessage}, Invalid phone format`
        : 'Invalid phone format';
    }

    // Check for duplicate phones in this file
    if (validatedRow.phone && phoneSet.has(validatedRow.phone)) {
      validatedRow.hasError = true;
      validatedRow.errorMessage = validatedRow.errorMessage 
        ? `${validatedRow.errorMessage}, Duplicate phone in file`
        : 'Duplicate phone number in file';
      this.duplicatePhones.push(validatedRow.phone);
    } else if (validatedRow.phone) {
      phoneSet.add(validatedRow.phone);
    }

    validatedRows.push(validatedRow);
  });

  return validatedRows;
}

private isValidPhone(phone: string): boolean {
  // Basic phone validation - adjust based on your country
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}



  private calculateSummary(): void {
    this.validRowsCount = this.previewData.filter(row => !row.hasError).length;
    this.errorRowsCount = this.previewData.filter(row => row.hasError).length;
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }


  async processFile(): Promise<void> {
  if (!this.selectedFile || this.previewData.length === 0) {
    this.notification.error('Please select a valid file first');
    return;
  }

  if (this.validRowsCount === 0) {
    this.notification.error('No valid rows to import');
    return;
  }

  this.isProcessing = true;
  
  try {
    const validMembers = this.previewData
      .filter(row => !row.hasError)
      .map(row => ({
        name: row.name,
        phone: row.phone,
        email: row.email || '',
        class_name: row.class,
        location: row.location || ''
      }));

    const result = await this.apiService.bulkImportMembers(validMembers).toPromise();
    
    if (result.summary.failed > 0) {
      this.notification.warning(
        `Imported ${result.summary.successful} members, ${result.summary.failed} failed`
      );
    } else {
      this.notification.success(`Successfully imported ${result.summary.successful} members`);
    }
  
    
  } catch (error: any) {
    console.error('Bulk import error:', error);
    
    if (error.error && error.error.summary) {
      // Backend returned structured error
      this.notification.error(
        `Failed to import members: ${error.error.summary.successful} successful, ${error.error.summary.failed} failed`
      );
    } else {
      this.notification.error('Failed to import members');
    }
  } finally {
    this.isProcessing = false;
  }
}


  get missingNameCount(): number {
    return this.previewData.filter(r => !r.name).length;
  }

  get missingPhoneCount(): number {
    return this.previewData.filter(r => !r.phone).length;
  }

  get missingClassCount(): number {
    return this.previewData.filter(r => !r.class).length;
  }

  get invalidPhoneCount(): number {
    return this.previewData.filter(r => r.phone && !this.isValidPhone(r.phone)).length;
  }

  // Make sure you have this validation method
  private isValidPhone3(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }




  cancel() {
    this.router.navigate([this.returnUrl], {
      state: { success: false }
    });
  }


  
  async refreshPage(event: any) {
    event.target.complete();
  }

}