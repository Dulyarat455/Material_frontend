import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


import Swal from 'sweetalert2';
import config from '../../config';

type JobRow = {
  id: number;
  incomingId?: number | null;
  dateTimePD: string;
  jobNo: string;
  type: 'Issue' | 'Return';
  materialNo: string;
  materialName: string;
  materialSpec: string;
  mcNo: string;
  requestBy: string;
  remark?: string;
  accountCode?: string;
  state?: string;
  priority?: 'Normal' | 'Urgent';
};

@Component({
  selector: 'app-job-transaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-transaction.component.html',
  styleUrl: './job-transaction.component.css'
})
export class JobTransactionComponent {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  issueJobs: JobRow[] = [];
  returnJobs: JobRow[] = [];

  isLoadingIssue = false;
  isLoadingReturn = false;

  ngOnInit() {
    this.fetchIssueAll();
    this.fetchReturnAll();

    setInterval(() => {
      this.issueJobs = [...this.issueJobs];
      this.returnJobs = [...this.returnJobs];
    }, 60000);
  }

  get isLoading(): boolean {
    return this.isLoadingIssue || this.isLoadingReturn;
  }

  fetchIssueAll() {
    this.isLoadingIssue = true;

    this.http.get<any>(config.apiServer + '/api/issue/fetIssueAll').subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.results) ? res.results : [];
        this.issueJobs = rows.map((r: any) => this.mapJobRow(r, 'Issue'));
        this.isLoadingIssue = false;
      },
      error: (err) => {
        this.isLoadingIssue = false;
        Swal.fire(
          'Error',
          err?.error?.message || err?.message || 'Load issue transaction fail',
          'error'
        );
      }
    });
  }

  fetchReturnAll() {
    this.isLoadingReturn = true;

    this.http.get<any>(config.apiServer + '/api/return/fetchReturnAll').subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.results) ? res.results : [];
        this.returnJobs = rows.map((r: any) => this.mapJobRow(r, 'Return'));
        this.isLoadingReturn = false;
      },
      error: (err) => {
        this.isLoadingReturn = false;
        Swal.fire(
          'Error',
          err?.error?.message || err?.message || 'Load return transaction fail',
          'error'
        );
      }
    });
  }

  private mapJobRow(r: any, fallbackType: 'Issue' | 'Return'): JobRow {
    const reqEmpNo = r?.requestUserEmpNo || '';
    const reqName = r?.requestUserName || '';

    const requestBy =
      reqEmpNo && reqName
        ? `${reqEmpNo} - ${reqName}`
        : reqEmpNo || reqName || '-';

    const rawType = String(r?.type || fallbackType).trim().toLowerCase();
    const type: 'Issue' | 'Return' =
      rawType === 'return' ? 'Return' : 'Issue';

    const priority: 'Normal' | 'Urgent' =
      String(r?.priority || '').trim().toLowerCase() === 'urgent'
        ? 'Urgent'
        : 'Normal';

    return {
      id: Number(r?.id || 0),
      incomingId: r?.incomingId ?? null,
      dateTimePD: this.formatDateTime(r?.requestTime),
      jobNo: r?.jobNo || '-',
      type,
      materialNo: r?.materialNo || '-',
      materialName: r?.materialName || '-',
      materialSpec: r?.materialSpec || '-',
      mcNo: r?.areaName || '-',
      requestBy,
      remark: r?.remark || '',
      accountCode: r?.accountCode || '',
      state: r?.state || '',
      priority
    };
  }

  onClickStockOut(row: JobRow) {
    this.router.navigate(['/storage'], {
      state: {
        fromTransaction: true,
        mode: 'STOCK_OUT',
        job: {
          id: row.id,
          jobNo: row.jobNo,
          materialNo: row.materialNo,
          materialName: row.materialName,
          materialSpec: row.materialSpec,
          incomingId: row.incomingId ?? null
        }
      }
    });
  }

  onClickReturn(row: JobRow) {
    this.router.navigate(['/storage'], {
      state: {
        fromTransaction: true,
        mode: 'RETURN_STOCK_IN',
        returnMode: true,
        job: {
          id: row.id,
          jobNo: row.jobNo,
          materialNo: row.materialNo,
          materialName: row.materialName,
          materialSpec: row.materialSpec,
          incomingId: row.incomingId ?? null,
          type: row.type,
          mcNo: row.mcNo,
          requestBy: row.requestBy,
          remark: row.remark,
          state: row.state,
          priority: row.priority
        }
      }
    });
  }

  showRemark(row: JobRow) {
    const remarkText = (row.remark || '').trim();
    if (!remarkText) return;

    Swal.fire({
      icon: 'info',
      title: 'Job Remark',
      html: `
        <div style="text-align:left; line-height:1.7;">
          <div style="margin-bottom:8px;"><b>Job No:</b> ${this.escapeHtml(row.jobNo || '-')}</div>
          <div style="margin-bottom:8px;"><b>Material No:</b> ${this.escapeHtml(row.materialNo || '-')}</div>
          <div style="
            padding:12px;
            border-radius:10px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            color:#0f172a;
            white-space:pre-wrap;
            word-break:break-word;
          ">${this.escapeHtml(remarkText)}</div>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#2563eb'
    });
  }

  trackIssue(index: number, row: JobRow) {
    return row.id || row.jobNo;
  }

  trackReturn(index: number, row: JobRow) {
    return row.id || row.jobNo;
  }

  isOver10Min(row: JobRow): boolean {
    if (!row.dateTimePD || row.dateTimePD === '-') return false;

    const d = this.parseDateTime(row.dateTimePD);
    if (!d) return false;

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = diffMs / (1000 * 60);

    return diffMin >= 10;
  }

  parseDateTime(value: string): Date | null {
    try {
      const [datePart, timePart] = value.split(' ');
      const [dd, mm, yyyy] = datePart.split('-').map(Number);
      const [hh, min] = timePart.split(':').map(Number);

      return new Date(yyyy, mm - 1, dd, hh, min);
    } catch {
      return null;
    }
  }

  formatDateTime(value: any): string {
    if (!value) return '-';

    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);

    const pad = (n: number) => String(n).padStart(2, '0');

    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private escapeHtml(value: string): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}