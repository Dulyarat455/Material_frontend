import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import config from '../../config';

type TransactionJobReportRow = {
  jobId: number;

  jobNo: string;
  type: string;
  state: string;
  remark: string;
  remarkMC: string;
  accountCode: string;
  priority: string;
  requestTime: string;
  inchargeTime?: string | null;

  area: string;

  incomingJobNo: string;
  materialNo: string;
  materialName: string;
  materialSpec: string;
  lotNo: string;
  recivedDate: string;

  coil: number;
  qty: number;

  requestBy: string;
  requestByEmpNo: string;
  inchargeBy: string;
  inchargeByEmpNo: string;
};

@Component({
  selector: 'app-transaction-job-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-job-report.component.html',
  styleUrl: './transaction-job-report.component.css'
})
export class TransactionJobReportComponent {
  constructor(private http: HttpClient) {}

  isLoading = false;
  searchText = '';

  rows: TransactionJobReportRow[] = [];
  filteredRows: TransactionJobReportRow[] = [];

  ngOnInit() {
    this.fetchTransactionJobList();
  }

  fetchTransactionJobList() {
    this.isLoading = true;

    this.http.get<any>(`${config.apiServer}/api/reportJob/list`).subscribe({
      next: (res) => {
        this.rows = Array.isArray(res?.results) ? res.results : [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('fetchTransactionJobList error:', err);
        this.rows = [];
        this.filteredRows = [];
        this.isLoading = false;
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
        row.jobNo,
        row.incomingJobNo,
        row.type,
        row.state,
        row.remark,
        row.remarkMC,
        row.accountCode,
        row.priority,
        row.area,
        row.materialNo,
        row.materialName,
        row.materialSpec,
        row.lotNo,
        row.requestBy,
        row.requestByEmpNo,
        row.inchargeBy,
        row.inchargeByEmpNo
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

  formatNumber(value: any) {
    return Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  trackByRow(_index: number, row: TransactionJobReportRow) {
    return row.jobId;
  }
}