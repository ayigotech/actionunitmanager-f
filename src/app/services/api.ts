

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ChurchRegistration {
  church: {
    name: string;
    email: string;
    phone: string;
    address: string;
    district: string;
    country: string;
    denomination: string;
  };
  superintendent: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  subscription: {
    plan: 'free_trial' | 'monthly' | 'annual';
    trial_end_date: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  is_officer: boolean;
  access: string;
  refresh: string;
  user: any;
  church: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Register a new church/sabbath school with superintendent
   */
  registerChurch(data: ChurchRegistration): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/church/register/`, data);
  }
  
/*
 * Login for superintendent (church email + password)
 */
loginSuperintendent(credentials: { email: string; password: string }): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/superintendent-login/`, credentials);
}


loginTeacherMember(credentials: { phone: string}): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/teacher-member-login/`, credentials);
}

  /**
   * Login for member (phone number based)
   */
  loginMember(credentials: { phone: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/member-login/`, credentials);
  }

  /**
   * Refresh access token
   */
  refreshToken(refresh: string): Observable<{ access: string }> {
    return this.http.post<{ access: string }>(`${this.apiUrl}/api/auth/token/refresh/`, { refresh });
  }

  // Church Management Endpoints
  getChurchProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/church/profile/`);
  }

  updateChurchProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/church/profile/`, data);
  }

  // Action Unit Classes Endpoints
  getClasses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/classes/`);
  }

  createClass(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/classes/`, data);
  }

  updateClass(classId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/classes/${classId}/`, data);
  }

  deleteClass(classId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/classes/${classId}/`);
  }


/**
 * Get all teachers for the current church
 */
getTeachers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/teachers/`);
}

getTeacherClasses(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/teacher-classes/`);
}

// api.service.ts
getTeacherDashboardInfo(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/teacher/dashboard/`);
}

/**
 * Create a new teacher
 */
createTeacher(teacherData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/teachers/`, teacherData);
}

/**
 * Update a teacher
 */
updateTeacher(teacherId: string, teacherData: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/api/teachers/${teacherId}/`, teacherData);
}

/**
 * Delete (deactivate) a teacher
 */
deleteTeacher(teacherId: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/api/teachers/${teacherId}/`);
}

/**
 * Assign teacher to class
 */
assignTeacher(data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/teachers-assign-to-class/`, data);
}

/**
 * Reassign teacher to different class
 */
reassignTeacher(data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/teachers-reassign/`, data);
}

  // Members Endpoints
  getClassMembers(classId?: string): Observable<any[]> {
  const url = classId && classId !== 'all' 
    ? `${this.apiUrl}/api/members/${classId}/classes/`
    : `${this.apiUrl}/api/members-classes/`;
  return this.http.get<any[]>(url);
}

  createMember(memberData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/members-classes/`, memberData);
}


bulkImportMembers(membersData: any[]): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/members-bulk-import/`, {
    members: membersData
  });
}


updateMember(memberId: string, memberData: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/api/members-classes/${memberId}/`, memberData);
}


deleteMember(memberId: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/api/members-classes/${memberId}/`);
}


bulkImportMemberss(membersData: any[]): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/classes/members/bulk-import/`, {
    members: membersData
  });
}

  // Attendance Endpoints
 // api.service.ts - Add these methods
markAttendance(data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/attendance/`, data);
}

getAttendanceReport(filters: any): Observable<any[]> {
  let params = new HttpParams();
  if (filters.startDate) params = params.set('start_date', filters.startDate);
  if (filters.endDate) params = params.set('end_date', filters.endDate);
  if (filters.classId) params = params.set('class_id', filters.classId);
  
  return this.http.get<any[]>(`${this.apiUrl}/api/reports/attendance/`, { params });
}



// absenting members
getAbsentMembers(classId?: string, filters?: any): Observable<any[]> {
  let params = new HttpParams();
  if (classId) params = params.set('class_id', classId);
  if (filters?.daysBack) params = params.set('days_back', filters.daysBack.toString());
  if (filters?.minAbsences) params = params.set('min_absences', filters.minAbsences.toString());
  
  const url = `${this.apiUrl}/api/reports/absent-members/`;
  return this.http.get<any[]>(url, { params });
}



  // Offerings Endpoints
  getOfferings(classId?: string): Observable<any[]> {
    const url = classId 
      ? `${this.apiUrl}/api/classes/${classId}/offerings/`
      : `${this.apiUrl}/api/offerings/`;
    return this.http.get<any[]>(url);
  }

  createOffering(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/offerings/`, data);
  }




  getBooksOrders(filters: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters.quarter) params = params.set('quarter', filters.quarter);
    if (filters.classId) params = params.set('class_id', filters.classId);
    
    return this.http.get<any[]>(`${this.apiUrl}/api/books/orders/`, { params });
  }

  // Messaging Endpoints
  sendMessageToTeachers(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/messaging/to-teachers/`, data);
  }

  sendMessageToAbsentMembers(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/messaging/to-absent-members/`, data);
  }

  // Reports Export Endpoints
  exportAttendanceReport(filters: any): Observable<Blob> {
    let params = new HttpParams();
    if (filters.startDate) params = params.set('start_date', filters.startDate);
    if (filters.endDate) params = params.set('end_date', filters.endDate);
    if (filters.format) params = params.set('format', filters.format);
    
    return this.http.get(`${this.apiUrl}/api/reports/attendance/export/`, { 
      params, 
      responseType: 'blob' 
    });
  }

  exportBooksReport(filters: any): Observable<Blob> {
    let params = new HttpParams();
    if (filters.quarter) params = params.set('quarter', filters.quarter);
    if (filters.format) params = params.set('format', filters.format);
    
    return this.http.get(`${this.apiUrl}/api/reports/books/export/`, { 
      params, 
      responseType: 'blob' 
    });
  }



// Quarterly Books Endpoints
getQuarterlyBooks(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/quarterly-books/`);
}

createQuarterlyBook(data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/quarterly-books/`, data);
}

updateQuarterlyBook(bookId: string, data: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/api/quarterly-books/${bookId}/`, data);
}

deleteQuarterlyBook(bookId: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/api/quarterly-books/${bookId}/`);
}



// Book Orders Endpoints
getBookOrders(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/book-orders/`);
}

createBookOrder(data: any): Observable<any> {
   console.log('Sending to backend:', data);
  return this.http.post<any>(`${this.apiUrl}/api/book-orders/`, data);
}

updateBookOrder(orderId: string, data: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/api/book-orders/${orderId}/`, data);
}

submitBookOrder(orderId: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/book-orders/${orderId}/submit/`, {});
}

getActiveQuarterlyBooks(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/quarterly-books/active/`);
}

getSuperintendentBookOrders(filters?: any): Observable<any[]> {
  let params = new HttpParams();
  if (filters?.quarter) params = params.set('quarter', filters.quarter);
  if (filters?.year) params = params.set('year', filters.year);
  
  return this.http.get<any[]>(`${this.apiUrl}/api/superintendent/book-orders/`, { params });
}

getSuperintendentOrdersQuarters(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/api/superintendent/orders-quarters/`);
}

getSuperintendentDashboardMetrics(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/superintendent/dashboard-metrics/`);
}

//reporting endpoint
getAttendanceReports(filters: any): Observable<any[]> {
  let params = new HttpParams();
  if (filters.startDate) params = params.set('start_date', filters.startDate);
  if (filters.endDate) params = params.set('end_date', filters.endDate);
  if (filters.classId) params = params.set('class_id', filters.classId);
  return this.http.get<any[]>(`${this.apiUrl}/api/reports/attendance/`, { params });
}

getOfferingsReports(filters: any): Observable<any[]> {
  let params = new HttpParams();
  if (filters.startDate) params = params.set('start_date', filters.startDate);
  if (filters.endDate) params = params.set('end_date', filters.endDate);
  if (filters.classId) params = params.set('class_id', filters.classId);
  return this.http.get<any[]>(`${this.apiUrl}/api/reports/offerings/`, { params });
}

getBooksReports(filters: any): Observable<any[]> {
  let params = new HttpParams();
  if (filters.quarter) params = params.set('quarter', filters.quarter);
  if (filters.year) params = params.set('year', filters.year);
  if (filters.classId) params = params.set('class_id', filters.classId);
  return this.http.get<any[]>(`${this.apiUrl}/api/reports/books/`, { params });
}

//officers insight tracking
getAtRiskMembers(filters?: any): Observable<any[]> {
  let params = new HttpParams();
  if (filters?.daysBack) params = params.set('days_back', filters.daysBack.toString());
  if (filters?.minAbsences) params = params.set('min_absences', filters.minAbsences.toString());
  
  return this.http.get<any[]>(`${this.apiUrl}/api/officers/at-risk-members/`, { params });
  
}

getOfficers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/officers/`);
}

createOfficer(data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/officers/`, data);
}

updateOfficer(officerId: string, data: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/api/officers/${officerId}/`, data);
}

deleteOfficer(officerId: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/api/officers/${officerId}/`);
}




 // Subscription Endpoints
getSubscriptionStatus(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/subscription/status/`);
}

initiateSubscriptionPayment(plan: string, phoneNumber: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/subscription/initiate-payment/`, {
    plan,
    phone_number: phoneNumber
  });
}

verifySubscriptionPayment(transactionId: string, plan: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/api/subscription/verify-payment/`, {
    transaction_id: transactionId,
    plan
  });
}

}














