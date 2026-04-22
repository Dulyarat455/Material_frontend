import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import config from '../../config';

type InventoryReportRow = {
  transactionStoreId: number;
  incomingId: number;
  jobNo: string;
  materialNo: string;
  itemName: string;
  itemSpec: string;
  lotNo: string;
  coil: number;
  qtyKgsPcs: number;
  unit: string;
  totalPrice: number;
  area: string;
  stockNote: string;
  timeStmp: string;
};

@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-report.component.html',
  styleUrl: './inventory-report.component.css'
})
export class InventoryReportComponent {
  constructor(private http: HttpClient) {}

  isLoading = false;
  searchText = '';

  inventoryRows: InventoryReportRow[] = [];
  filteredRows: InventoryReportRow[] = [];

  ngOnInit() {
    this.fetchInventoryList();
  }

  fetchInventoryList() {
    this.isLoading = true;

    this.http.get<any>(`${config.apiServer}/api/inventory/list`).subscribe({
      next: (res) => {
        this.inventoryRows = Array.isArray(res?.results) ? res.results : [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('fetchInventoryList error:', err);
        this.inventoryRows = [];
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
      this.filteredRows = [...this.inventoryRows];
      return;
    }

    this.filteredRows = this.inventoryRows.filter((row) => {
      return [
        row.jobNo,
        row.materialNo,
        row.itemName,
        row.itemSpec,
        row.lotNo,
        row.area,
        row.stockNote
      ]
        .map(v => (v || '').toString().toLowerCase())
        .some(v => v.includes(key));
    });
  }

  formatDateTime(value?: string) {
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

  formatNumber(value: any, digits: number = 0) {
    return Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  trackByInventory(_index: number, row: InventoryReportRow) {
    return row.transactionStoreId;
  }


 


}