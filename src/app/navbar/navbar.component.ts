import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import config from '../../config';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  formattedDate: string = '';
  formattedTime: string = '';

  private timeInterval: any;
  private routerSub?: Subscription;

  token: string | undefined = '';
  role: string = '';
  section: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateDateTime();

    this.loadUserFromLocalStorage();

    // ✅ check ตอนเปิด component ครั้งแรก
    this.checkLoginAndRedirect();

    // ✅ check ทุกครั้งที่เปลี่ยน route
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadUserFromLocalStorage();
        this.checkLoginAndRedirect();
      });

    this.timeInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private loadUserFromLocalStorage() {
    this.token = localStorage.getItem('materialStore_token') || '';
    this.role = localStorage.getItem('materialStore_role') || '';
    this.section = localStorage.getItem('materialStore_sectionName') || '';
  }

  private checkLoginAndRedirect() {
    const token = (this.token || '').trim();

    if (token) return;

    const currentPath = this.router.url
      .split('?')[0]
      .split('#')[0]
      .replace(/^\/+/, '');

    const allowPaths = [
      '',
      'jobTransaction',
      'signin'
    ];

    if (!allowPaths.includes(currentPath)) {
      this.router.navigate(['/signin']);
    }
  }

  private updateDateTime() {
    const now = new Date();
    this.formattedDate = this.formatDate(now);
    this.formattedTime = this.formatTime(now);
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}