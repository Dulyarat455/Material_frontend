import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { StorageComponent } from './storage/storage.component';
import { IssueComponent } from './issue/issue.component';
import { ReturnComponent } from './return/return.component';
import { JobTransactionComponent } from './job-transaction/job-transaction.component';
import { MaterialComponent } from './material/material.component';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';
import { TransactionJobReportComponent } from './transaction-job-report/transaction-job-report.component';
import { TransactionStoreReportComponent } from './transaction-store-report/transaction-store-report.component';
import { StockOutReportComponent } from './stock-out-report/stock-out-report.component';
import { RegisterComponent } from './register/register.component';
import { TransactionAllReportComponent } from './transaction-all-report/transaction-all-report.component';

export const routes: Routes = [

  {
    path: '',
    component: JobTransactionComponent,
  },

  {
    path: 'jobTransaction',
    component: JobTransactionComponent,
  },

  {
    path: 'signin',
    component: SignInComponent
  },


  {
    path: 'register',
    component: RegisterComponent
  },


  {
    path: 'storage',
    component: StorageComponent,
  },

  
  {
    path: 'issue',
    component: IssueComponent,
  },

  
  {
    path: 'return',
    component: ReturnComponent,
  },



  
  {
    path: 'material',
    component: MaterialComponent,
  },



  
  {
    path: 'inventory',
    component: InventoryReportComponent,
  },



  {
    path: 'transactionJob',
    component: TransactionJobReportComponent,
  },


  {
    path: 'transactionStore',
    component: TransactionStoreReportComponent,
  },


  {
    path: 'stockOut',
    component: StockOutReportComponent,
  },

  {
    path: 'transactionAll',
    component: TransactionAllReportComponent,
  },


  {
    path: '404',
    component: NotFoundComponent,
  },
  
  {
    path: '**',
    redirectTo: '404',
  },

  // {
  //   path: '**',
  //   redirectTo: '',
  // },
];
