import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { StorageComponent } from './storage/storage.component';
import { IssueComponent } from './issue/issue.component';
import { ReturnComponent } from './return/return.component';

export const routes: Routes = [
  {
    path: '',
    component: SignInComponent,
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
