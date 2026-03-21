import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  state?: string;
  priority?: string;
};

@Component({
  selector: 'app-job-transaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-transaction.component.html',
  styleUrl: './job-transaction.component.css'
})
export class JobTransactionComponent {
  constructor(private http: HttpClient) {}

  issueJobs: JobRow[] = [];
  returnJobs: JobRow[] = [];

  isLoading = false;

  ngOnInit() {
    this.fetchIssueAll();

    setInterval(() => {
      this.issueJobs = [...this.issueJobs];
      this.returnJobs = [...this.returnJobs];
    }, 60000);
  }

  fetchIssueAll() {
    this.isLoading = true;

    this.http.get<any>(config.apiServer + '/api/issue/fetIssueAll').subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.results) ? res.results : [];

        const mapped: JobRow[] = rows.map((r: any) => {
          const reqEmpNo = r?.requestUserEmpNo || '';
          const reqName = r?.requestUserName || '';

          const requestBy =
            reqEmpNo && reqName
              ? `${reqEmpNo} - ${reqName}`
              : reqEmpNo || reqName || '-';

          const rawType = String(r?.type || '').trim().toLowerCase();
          const type: 'Issue' | 'Return' =
            rawType === 'return' ? 'Return' : 'Issue';

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
            state: r?.state || '',
            priority: r?.priority || ''
          };
        });

        this.issueJobs = mapped.filter(x => x.type === 'Issue');
        this.returnJobs = mapped.filter(x => x.type === 'Return');

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire(
          'Error',
          err?.error?.message || err?.message || 'Load transaction fail',
          'error'
        );
      }
    });
  }

  onClickStockOut(row: JobRow) {
    Swal.fire({
      icon: 'info',
      title: 'Stock Out',
      html: `
        <div style="text-align:left; line-height:1.8;">
          <div><b>Job No:</b> ${row.jobNo || '-'}</div>
          <div><b>Material No:</b> ${row.materialNo || '-'}</div>
          <div><b>Material Name:</b> ${row.materialName || '-'}</div>
          <div><b>Material Spec:</b> ${row.materialSpec || '-'}</div>
          <div><b>M/C No:</b> ${row.mcNo || '-'}</div>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#2563eb'
    });
  }

  onClickReturn(row: JobRow) {
    Swal.fire({
      icon: 'info',
      title: 'Return',
      html: `
        <div style="text-align:left; line-height:1.8;">
          <div><b>Job No:</b> ${row.jobNo || '-'}</div>
          <div><b>Material No:</b> ${row.materialNo || '-'}</div>
          <div><b>Material Name:</b> ${row.materialName || '-'}</div>
          <div><b>Material Spec:</b> ${row.materialSpec || '-'}</div>
          <div><b>M/C No:</b> ${row.mcNo || '-'}</div>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#16a34a'
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
          <div style="margin-bottom:8px;"><b>Job No:</b> ${row.jobNo || '-'}</div>
          <div style="margin-bottom:8px;"><b>Material No:</b> ${row.materialNo || '-'}</div>
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


}