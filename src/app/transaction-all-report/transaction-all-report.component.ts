import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import config from '../../config';

type TransactionAllReportRow = {
  areaName: string;
  incomingJobNo: string;
  materialNo: string;
  materialName: string;
  materialSpec: string;
  lotNo: string;
  notControl: string;
  coil: number;
  qty: number;
  type: string;
  inchargeBy: string;
  time: string | null;
  remark: string;
};

type FilterKey =
  | 'incomingJobNo'
  | 'materialNo'
  | 'materialName'
  | 'materialSpec'
  | 'lotNo'
  | 'areaName'
  | 'type'
  | 'inchargeBy'
  | 'remark';

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
  isExporting = false;

  startDate = '';
  endDate = '';

  incomingJobNoFilter = 'all';
  materialNoFilter = 'all';
  materialNameFilter = 'all';
  materialSpecFilter = 'all';
  lotNoFilter = 'all';
  areaNameFilter = 'all';
  typeFilter = 'all';
  inchargeByFilter = 'all';
  remarkFilter = 'all';

  rows: TransactionAllReportRow[] = [];
  filteredRows: TransactionAllReportRow[] = [];

  incomingJobNoOptions: string[] = [];
  materialNoOptions: string[] = [];
  materialNameOptions: string[] = [];
  materialSpecOptions: string[] = [];
  lotNoOptions: string[] = [];
  areaNameOptions: string[] = [];
  typeOptions: string[] = [];
  inchargeByOptions: string[] = [];
  remarkOptions: string[] = [];

  dropdownOpen: Record<FilterKey, boolean> = {
    incomingJobNo: false,
    materialNo: false,
    materialName: false,
    materialSpec: false,
    lotNo: false,
    areaName: false,
    type: false,
    inchargeBy: false,
    remark: false
  };

  dropdownSearch: Record<FilterKey, string> = {
    incomingJobNo: '',
    materialNo: '',
    materialName: '',
    materialSpec: '',
    lotNo: '',
    areaName: '',
    type: '',
    inchargeBy: '',
    remark: ''
  };

  ngOnInit() {
    this.fetchTransactionAllList();
    this.setDefaultDateRange();
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
        this.resetAllOptions();
        this.isLoading = false;

        await Swal.fire({
          icon: 'error',
          title: 'Load Transaction All Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถโหลดข้อมูล Transaction All ได้'
        });
      }
    });
  }

  onFilterChange() {
    this.applyFilter();
  }

  clearFilters() {
    this.setDefaultDateRange();

    this.incomingJobNoFilter = 'all';
    this.materialNoFilter = 'all';
    this.materialNameFilter = 'all';
    this.materialSpecFilter = 'all';
    this.lotNoFilter = 'all';
    this.areaNameFilter = 'all';
    this.typeFilter = 'all';
    this.inchargeByFilter = 'all';
    this.remarkFilter = 'all';

    this.dropdownSearch.incomingJobNo = '';
    this.dropdownSearch.materialNo = '';
    this.dropdownSearch.materialName = '';
    this.dropdownSearch.materialSpec = '';
    this.dropdownSearch.lotNo = '';
    this.dropdownSearch.areaName = '';
    this.dropdownSearch.type = '';
    this.dropdownSearch.inchargeBy = '';
    this.dropdownSearch.remark = '';

    this.closeAllDropdowns();
    this.applyFilter();
  }

  private resetAllOptions() {
    this.incomingJobNoOptions = [];
    this.materialNoOptions = [];
    this.materialNameOptions = [];
    this.materialSpecOptions = [];
    this.lotNoOptions = [];
    this.areaNameOptions = [];
    this.typeOptions = [];
    this.inchargeByOptions = [];
    this.remarkOptions = [];
  }

  private buildUniqueOptions(values: any[]): string[] {
    return Array.from(
      new Set(
        values
          .map(v => String(v || '').trim())
          .filter(v => !!v)
      )
    ).sort((a, b) => a.localeCompare(b));
  }

  private toDateOnly(value?: string | null) {
    if (!value) return null;

    const d = new Date(value);
    if (isNaN(d.getTime())) return null;

    d.setHours(0, 0, 0, 0);
    return d;
  }

  private matchDateRange(row: TransactionAllReportRow): boolean {
    const start = this.startDate ? this.toDateOnly(this.startDate) : null;
    const end = this.endDate ? this.toDateOnly(this.endDate) : null;
    const rowDate = this.toDateOnly(row.time);

    const matchStart = !start || (!!rowDate && rowDate >= start);
    const matchEnd = !end || (!!rowDate && rowDate <= end);

    return matchStart && matchEnd;
  }

  private rowMatchesFilter(row: TransactionAllReportRow, excludeKey?: FilterKey): boolean {
    if (!this.matchDateRange(row)) return false;

    const matchIncomingJobNo =
      excludeKey === 'incomingJobNo' ||
      this.incomingJobNoFilter === 'all' ||
      (row.incomingJobNo || '') === this.incomingJobNoFilter;

    const matchMaterialNo =
      excludeKey === 'materialNo' ||
      this.materialNoFilter === 'all' ||
      (row.materialNo || '') === this.materialNoFilter;

    const matchMaterialName =
      excludeKey === 'materialName' ||
      this.materialNameFilter === 'all' ||
      (row.materialName || '') === this.materialNameFilter;

    const matchMaterialSpec =
      excludeKey === 'materialSpec' ||
      this.materialSpecFilter === 'all' ||
      (row.materialSpec || '') === this.materialSpecFilter;

    const matchLotNo =
      excludeKey === 'lotNo' ||
      this.lotNoFilter === 'all' ||
      (row.lotNo || '') === this.lotNoFilter;

    const matchAreaName =
      excludeKey === 'areaName' ||
      this.areaNameFilter === 'all' ||
      (row.areaName || '') === this.areaNameFilter;

    const matchType =
      excludeKey === 'type' ||
      this.typeFilter === 'all' ||
      (row.type || '') === this.typeFilter;

    const matchInchargeBy =
      excludeKey === 'inchargeBy' ||
      this.inchargeByFilter === 'all' ||
      (row.inchargeBy || '') === this.inchargeByFilter;

    const matchRemark =
      excludeKey === 'remark' ||
      this.remarkFilter === 'all' ||
      (row.remark || '') === this.remarkFilter;

    return (
      matchIncomingJobNo &&
      matchMaterialNo &&
      matchMaterialName &&
      matchMaterialSpec &&
      matchLotNo &&
      matchAreaName &&
      matchType &&
      matchInchargeBy &&
      matchRemark
    );
  }

  private rebuildRelatedOptions() {
    this.incomingJobNoOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'incomingJobNo')).map(x => x.incomingJobNo)
    );
    this.materialNoOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'materialNo')).map(x => x.materialNo)
    );
    this.materialNameOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'materialName')).map(x => x.materialName)
    );
    this.materialSpecOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'materialSpec')).map(x => x.materialSpec)
    );
    this.lotNoOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'lotNo')).map(x => x.lotNo)
    );
    this.areaNameOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'areaName')).map(x => x.areaName)
    );
    this.typeOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'type')).map(x => x.type)
    );
    this.inchargeByOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'inchargeBy')).map(x => x.inchargeBy)
    );
    this.remarkOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'remark')).map(x => x.remark)
    );
  }

  private syncInvalidSelectedFilters() {
    if (this.incomingJobNoFilter !== 'all' && !this.incomingJobNoOptions.includes(this.incomingJobNoFilter)) {
      this.incomingJobNoFilter = 'all';
      this.dropdownSearch.incomingJobNo = '';
    }
    if (this.materialNoFilter !== 'all' && !this.materialNoOptions.includes(this.materialNoFilter)) {
      this.materialNoFilter = 'all';
      this.dropdownSearch.materialNo = '';
    }
    if (this.materialNameFilter !== 'all' && !this.materialNameOptions.includes(this.materialNameFilter)) {
      this.materialNameFilter = 'all';
      this.dropdownSearch.materialName = '';
    }
    if (this.materialSpecFilter !== 'all' && !this.materialSpecOptions.includes(this.materialSpecFilter)) {
      this.materialSpecFilter = 'all';
      this.dropdownSearch.materialSpec = '';
    }
    if (this.lotNoFilter !== 'all' && !this.lotNoOptions.includes(this.lotNoFilter)) {
      this.lotNoFilter = 'all';
      this.dropdownSearch.lotNo = '';
    }
    if (this.areaNameFilter !== 'all' && !this.areaNameOptions.includes(this.areaNameFilter)) {
      this.areaNameFilter = 'all';
      this.dropdownSearch.areaName = '';
    }
    if (this.typeFilter !== 'all' && !this.typeOptions.includes(this.typeFilter)) {
      this.typeFilter = 'all';
      this.dropdownSearch.type = '';
    }
    if (this.inchargeByFilter !== 'all' && !this.inchargeByOptions.includes(this.inchargeByFilter)) {
      this.inchargeByFilter = 'all';
      this.dropdownSearch.inchargeBy = '';
    }
    if (this.remarkFilter !== 'all' && !this.remarkOptions.includes(this.remarkFilter)) {
      this.remarkFilter = 'all';
      this.dropdownSearch.remark = '';
    }
  }

  applyFilter() {
    this.rebuildRelatedOptions();
    this.syncInvalidSelectedFilters();
    this.rebuildRelatedOptions();
    this.filteredRows = this.rows.filter((row) => this.rowMatchesFilter(row));
  }

  getOptions(key: FilterKey): string[] {
    switch (key) {
      case 'incomingJobNo': return this.incomingJobNoOptions;
      case 'materialNo': return this.materialNoOptions;
      case 'materialName': return this.materialNameOptions;
      case 'materialSpec': return this.materialSpecOptions;
      case 'lotNo': return this.lotNoOptions;
      case 'areaName': return this.areaNameOptions;
      case 'type': return this.typeOptions;
      case 'inchargeBy': return this.inchargeByOptions;
      case 'remark': return this.remarkOptions;
    }
  }

  getFilterValue(key: FilterKey): string {
    switch (key) {
      case 'incomingJobNo': return this.incomingJobNoFilter;
      case 'materialNo': return this.materialNoFilter;
      case 'materialName': return this.materialNameFilter;
      case 'materialSpec': return this.materialSpecFilter;
      case 'lotNo': return this.lotNoFilter;
      case 'areaName': return this.areaNameFilter;
      case 'type': return this.typeFilter;
      case 'inchargeBy': return this.inchargeByFilter;
      case 'remark': return this.remarkFilter;
    }
  }

  setFilterValue(key: FilterKey, value: string) {
    switch (key) {
      case 'incomingJobNo': this.incomingJobNoFilter = value; break;
      case 'materialNo': this.materialNoFilter = value; break;
      case 'materialName': this.materialNameFilter = value; break;
      case 'materialSpec': this.materialSpecFilter = value; break;
      case 'lotNo': this.lotNoFilter = value; break;
      case 'areaName': this.areaNameFilter = value; break;
      case 'type': this.typeFilter = value; break;
      case 'inchargeBy': this.inchargeByFilter = value; break;
      case 'remark': this.remarkFilter = value; break;
    }
  }

  getDisplayedInputValue(key: FilterKey): string {
    const filterValue = this.getFilterValue(key);
    const searchValue = this.dropdownSearch[key];
    if (this.dropdownOpen[key]) return searchValue;
    return filterValue === 'all' ? '' : filterValue;
  }

  onDropdownFocus(key: FilterKey) {
    this.closeAllDropdowns(key);
    this.dropdownOpen[key] = true;
    const currentValue = this.getFilterValue(key);
    this.dropdownSearch[key] = currentValue === 'all' ? '' : currentValue;
  }

  onDropdownInput(key: FilterKey, value: string) {
    this.dropdownSearch[key] = value;
    this.dropdownOpen[key] = true;
  }

  onDropdownKeydown(key: FilterKey, event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitDropdownValue(key);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelDropdownValue(key);
    }
  }

  onDropdownBlur(key: FilterKey) {
    setTimeout(() => {
      this.commitDropdownValue(key);
    }, 150);
  }

  selectDropdownOption(key: FilterKey, option: string) {
    this.setFilterValue(key, option);
    this.dropdownSearch[key] = option;
    this.dropdownOpen[key] = false;
    this.applyFilter();
  }

  clearDropdownSelection(key: FilterKey) {
    this.setFilterValue(key, 'all');
    this.dropdownSearch[key] = '';
    this.dropdownOpen[key] = false;
    this.applyFilter();
  }

  private commitDropdownValue(key: FilterKey) {
    const typed = (this.dropdownSearch[key] || '').trim();
    const options = this.getOptions(key);
    const exact = options.find(x => x.trim().toLowerCase() === typed.toLowerCase());

    if (!typed) {
      this.setFilterValue(key, 'all');
      this.dropdownSearch[key] = '';
      this.dropdownOpen[key] = false;
      this.applyFilter();
      return;
    }

    if (!exact) {
      this.setFilterValue(key, 'all');
      this.dropdownSearch[key] = '';
      this.dropdownOpen[key] = false;
      this.applyFilter();
      return;
    }

    this.setFilterValue(key, exact);
    this.dropdownSearch[key] = exact;
    this.dropdownOpen[key] = false;
    this.applyFilter();
  }

  private cancelDropdownValue(key: FilterKey) {
    const currentValue = this.getFilterValue(key);
    this.dropdownSearch[key] = currentValue === 'all' ? '' : currentValue;
    this.dropdownOpen[key] = false;
  }

  closeAllDropdowns(exceptKey?: FilterKey) {
    (Object.keys(this.dropdownOpen) as FilterKey[]).forEach((key) => {
      if (key !== exceptKey) this.dropdownOpen[key] = false;
    });
  }

  getFilteredDropdownOptions(key: FilterKey): string[] {
    const search = (this.dropdownSearch[key] || '').trim().toLowerCase();
    const options = this.getOptions(key);
    if (!search) return options;
    return options.filter(x => x.toLowerCase().includes(search));
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeAllDropdowns();
  }

  private getExportPayload() {
    return {
      startDate: this.startDate || '',
      endDate: this.endDate || '',
      incomingJobNo: this.incomingJobNoFilter || 'all',
      materialNo: this.materialNoFilter || 'all',
      materialName: this.materialNameFilter || 'all',
      materialSpec: this.materialSpecFilter || 'all',
      lotNo: this.lotNoFilter || 'all',
      areaName: this.areaNameFilter || 'all',
      type: this.typeFilter || 'all',
      inchargeBy: this.inchargeByFilter || 'all',
      remark: this.remarkFilter || 'all'
    };
  }

  exportExcel() {
    if (this.isExporting) return;

    this.isExporting = true;

    this.http.post(
      `${config.apiServer}/api/transactionAll/exportExcel`,
      this.getExportPayload(),
      { responseType: 'blob' }
    ).subscribe({
      next: (blob: Blob) => {
        const file = new Blob([blob], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');

        const filename =
          `transaction_all_report_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;

        a.href = url;
        a.download = filename;
        a.click();

        window.URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: async (err) => {
        console.error('exportExcel error:', err);
        this.isExporting = false;

        await Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถ export excel ได้'
        });
      }
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

  formatNumber(value: any, maxDigits: number = 3) {
    return Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDigits
    });
  }

  trackByRow(index: number, row: TransactionAllReportRow) {
    return `${row.type}_${row.incomingJobNo}_${row.time}_${index}`;
  }



  private setDefaultDateRange() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    this.startDate = this.formatDateInput(yesterday);
    this.endDate = this.formatDateInput(today);
  }
  
  private formatDateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }


}