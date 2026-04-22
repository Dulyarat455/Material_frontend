import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import config from '../../config';

type StockOutReportRow = {
  stockOutId: number;
  jobNoIncoming: string;
  inchargeBy: string;
  inchargeEmpNo: string;
  remark: string;
  timeStmp: string;
};

@Component({
  selector: 'app-stock-out-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-out-report.component.html',
  styleUrl: './stock-out-report.component.css'
})



export class StockOutReportComponent {

    constructor(private http: HttpClient) {}

    isLoading = false;
    searchText = '';

    rows: StockOutReportRow[] = [];
    filteredRows: StockOutReportRow[] = [];

    ngOnInit() {
      this.fetchStockOutList();
    }

    fetchStockOutList() {
      this.isLoading = true;

      this.http.get<any>(`${config.apiServer}/api/stockOut/list`).subscribe({
        next: (res) => {
          this.rows = Array.isArray(res?.results) ? res.results : [];
          this.applyFilter();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('fetchStockOutList error:', err);
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
          row.jobNoIncoming,
          row.inchargeBy,
          row.inchargeEmpNo,
          row.remark
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

    trackByRow(_index: number, row: StockOutReportRow) {
      return row.stockOutId;
    }

}
