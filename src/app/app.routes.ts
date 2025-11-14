import { Routes } from '@angular/router';

export const routes: Routes = [
 
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
   {
    path: 'auth/superintendent-login',
    loadComponent: () => import('./components/auth/superintendent-login/superintendent-login.component').then(m => m.SuperintendentLoginComponent)
  },
   {
    path: 'auth/teacher-login',
    loadComponent: () => import('./components/auth/teacher-login/teacher-login.component').then(m => m.TeacherLoginComponent)
  },
   {
    path: 'auth/officer-login',
    loadComponent: () => import('./components/auth/member-login/member-login.component').then(m => m.MemberLoginComponent)
  },
  {
    path: 'superintendent',
    loadComponent: () => import('./pages/superintendent/dashboard/dashboard.page').then( m => m.SuperintendentDashboardPage)
  },
  {
    path: 'teacher',
    loadComponent: () => import('./pages/teacher/dashboard/dashboard.page').then( m => m.TeacherDashboardPage)
  },
 
  {
  path: 'superintendent/classes',
  loadComponent: () => import('./pages/superintendent/classes-management/classes-management.component').then(m => m.ClassesManagementComponent)
},
{
  path: 'superintendent/teachers',
  loadComponent: () => import('./pages/superintendent/teachers-management/teachers-management.component').then(m => m.TeachersManagementComponent)
},
{
  path: 'teacher/attendance',
  loadComponent: () => import('./pages/teacher/attendance/attendance.component').then(m => m.AttendanceComponent)
},
{
  path: 'teacher/absent-members',
  loadComponent: () => import('./pages/teacher/absent-members/absent-members.component').then(m => m.AbsentMembersComponent)
},
{
  path: 'teacher/offerings',
  loadComponent: () => import('./pages/teacher/offerings/offerings.component').then(m => m.OfferingsComponent)
},
{
  path: 'teacher/books-ordering',
  loadComponent: () => import('./pages/teacher/books-ordering/books-ordering.component').then(m => m.BooksOrderingComponent)
},
  {
    path: 'superintendent/reports-dashboard',
    loadComponent: () => import('./pages/superintendent/reports-dashboard/reports-dashboard.page').then( m => m.ReportsDashboardPage)
  },
  {
    path: 'quarterly-orders',
    loadComponent: () => import('./pages/superintendent/quarterly-orders/quarterly-orders.page').then( m => m.QuarterlyOrdersPage)
  },
  {
  path: 'auth/signup',
  loadComponent: () => import('./pages/auth/church-signup/church-signup.page').then(m => m.ChurchSignupPage)
},
  {
    path: 'manage-membership',
    loadComponent: () => import('./pages/superintendent/manage-membership/manage-membership.page').then( m => m.ManageMembershipPage)
  },
  {
    path: 'manage-books',
    loadComponent: () => import('./pages/superintendent/manage-books/manage-books.page').then( m => m.ManageBooksPage)
  },

    {
    path: 'officers-insight',
    loadComponent: () => import('./pages/officers/officers-insight/officers-insight.page').then( m => m.OfficersInsightsPage)
  },
     {
    path: 'member-list',
    loadComponent: () => import('./pages/officers/member-list/member-list.component').then( m => m.MemberListComponent)
  },
  {
    path: 'manage-officers',
    loadComponent: () => import('./pages/superintendent/manage-officers/manage-officers.page').then( m => m.ManageOfficersPage)
  },

    {
    path: 'member-dashboard',
   loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },

  {
  path: 'subscription',
  loadComponent: () => import('./components/subscription-dashboard/subscription-dashboard.component').then(m => m.SubscriptionDashboardComponent)
},
  {
    path: 'test-offline',
    loadComponent: () => import('./pages/test-offline/test-offline.page').then( m => m.TestOfflinePage)
  },
  {
  path: 'add-class',
  loadComponent: () => import('./components/class-modal/class-modal.component').then(m => m.ClassModalComponent)
},
{
  path: 'edit-class',
  loadComponent: () => import('./components/class-modal/class-modal.component').then(m => m.ClassModalComponent)
},
{
  path: 'add-member',
  loadComponent: () => import('./components/bulk-import-members-modal/bulk-import-members-modal.component').then(m => m.BulkImportMembersModalComponent)
},

{
  path: 'add-bulk-member',
  loadComponent: () => import('./components/add-member-modal/add-member-modal.component').then(m => m.AddMemberModalComponent)
},
{
  path: 'edit-member',
  loadComponent: () => import('./components/add-member-modal/add-member-modal.component').then(m => m.AddMemberModalComponent)
},
{
  path: 'add-teacher',
  loadComponent: () => import('./components/teacher-modal/teacher-modal.component').then(m => m.TeacherModalComponent)
},
{
  path: 'edit-teacher',
  loadComponent: () => import('./components/teacher-modal/teacher-modal.component').then(m => m.TeacherModalComponent)
},
{
  path: 'assign-teacher',
  loadComponent: () => import('./components/assign-teacher-modal/assign-teacher-modal.component').then(m => m.AssignTeacherModalComponent)
},
{
  path: 'reassign-teacher',
  loadComponent: () => import('./components/reassign-teacher-modal/reassign-teacher-modal.component').then(m => m.ReassignTeacherModalComponent)
},
  
  {
  path: 'add-book',
  loadComponent: () => import('./components/book-modal/book-modal.component').then(m => m.BookModalComponent)
},
{
  path: 'edit-book',
  loadComponent: () => import('./components/book-modal/book-modal.component').then(m => m.BookModalComponent)
},
{
  path: 'add-officer',
  loadComponent: () => import('./components/add-officer-modal/add-officer-modal.component').then(m => m.AddOfficerModalComponent)
}
];




