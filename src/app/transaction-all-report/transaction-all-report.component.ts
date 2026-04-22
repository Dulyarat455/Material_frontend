import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import config from '../../config';

type TransactionAllReportRow = {
  areaName: string;
  incomingJobNo: string;
  type: string;
  inchargeBy: string;
  time: string | null;
};


@Component({
  selector: 'app-transaction-all-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-all-report.component.html',
  styleUrl: './transaction-all-report.component.css'
})
export class TransactionAllReportComponent {

  constructor(private http: HttpClient) {}

  isLoading = false;
  searchText = '';

  rows: TransactionAllReportRow[] = [];
  filteredRows: TransactionAllReportRow[] = [];

  ngOnInit() {
    this.fetchTransactionAllList();
  }

  fetchTransactionAllList() {
    this.isLoading = true;

    this.http.get<any>(`${config.apiServer}/api/transactionAll/list`).subscribe({
      next: (res) => {
        this.rows = Array.isArray(res?.results) ? res.results : [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: async (err) => {
        console.error('fetchTransactionAllList error:', err);
        this.rows = [];
        this.filteredRows = [];
        this.isLoading = false;

        await Swal.fire({
          icon: 'error',
          title: 'Load Transaction All Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถโหลดข้อมูล Transaction All ได้'
        });
      }
    });
  }

  onSearchChange() {
    this.applyFilter();
  }

  applyFilter() {
    const key = (this.searchText || '').trim().toLowerCase();

    if (!key) {
      this.filteredRows = [...this.rows];
      return;
    }

    this.filteredRows = this.rows.filter((row) => {
      return [
        row.areaName,
        row.incomingJobNo,
        row.type,
        row.inchargeBy
      ]
        .map(v => (v || '').toString().toLowerCase())
        .some(v => v.includes(key));
    });
  }

  formatDateTime(value?: string | null) {
    if (!value) return '-';

    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  trackByRow(index: number, row: TransactionAllReportRow) {
    return `${row.type}_${row.incomingJobNo}_${row.time}_${index}`;
  }


}
