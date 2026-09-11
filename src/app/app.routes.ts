import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './components/login/login.component';
import { LoanListComponent } from './components/loan-list/loan-list.component';
import { LoanRequestComponent } from './components/loan-request/loan-request.component';
import { AdminLoansComponent } from './components/admin-loans/admin-loans.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'loans', pathMatch: 'full' },
      { path: 'loans', component: LoanListComponent },
      { path: 'loans/new', component: LoanRequestComponent },
      { path: 'admin/loans', component: AdminLoansComponent, canActivate: [adminGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];