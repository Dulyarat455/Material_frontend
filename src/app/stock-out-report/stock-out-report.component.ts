import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import config from '../../config';

type StockOutReportRow = {
  stockOutId: number;
  jobNoIncoming: string;
  sectionName: string;
  inchargeBy: string;
  inchargeEmpNo: string;
  remark: string;
  timeStmp: string;
};

type FilterKey =
  | 'jobNoIncoming'
  | 'sectionName'
  | 'inchargeBy';

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
  isExporting = false;

  startDate = '';
  endDate = '';

  jobNoIncomingFilter = 'all';
  sectionNameFilter = 'all';
  inchargeByFilter = 'all';

  rows: StockOutReportRow[] = [];
  filteredRows: StockOutReportRow[] = [];

  jobNoIncomingOptions: string[] = [];
  sectionNameOptions: string[] = [];
  inchargeByOptions: string[] = [];

  dropdownOpen: Record<FilterKey, boolean> = {
    jobNoIncoming: false,
    sectionName: false,
    inchargeBy: false
  };

  dropdownSearch: Record<FilterKey, string> = {
    jobNoIncoming: '',
    sectionName: '',
    inchargeBy: ''
  };

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
        this.resetAllOptions();
        this.isLoading = false;
      }
    });
  }

  onFilterChange() {
    this.applyFilter();
  }

  clearFilters() {
    this.startDate = '';
    this.endDate = '';

    this.jobNoIncomingFilter = 'all';
    this.sectionNameFilter = 'all';
    this.inchargeByFilter = 'all';

    this.dropdownSearch.jobNoIncoming = '';
    this.dropdownSearch.sectionName = '';
    this.dropdownSearch.inchargeBy = '';

    this.closeAllDropdowns();
    this.applyFilter();
  }

  private resetAllOptions() {
    this.jobNoIncomingOptions = [];
    this.sectionNameOptions = [];
    this.inchargeByOptions = [];
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

  private matchDateRange(row: StockOutReportRow): boolean {
    const start = this.startDate ? this.toDateOnly(this.startDate) : null;
    const end = this.endDate ? this.toDateOnly(this.endDate) : null;
    const rowDate = this.toDateOnly(row.timeStmp);

    const matchStart = !start || (!!rowDate && rowDate >= start);
    const matchEnd = !end || (!!rowDate && rowDate <= end);

    return matchStart && matchEnd;
  }

  private rowMatchesFilter(row: StockOutReportRow, excludeKey?: FilterKey): boolean {
    if (!this.matchDateRange(row)) return false;

    const matchJobNoIncoming =
      excludeKey === 'jobNoIncoming' ||
      this.jobNoIncomingFilter === 'all' ||
      (row.jobNoIncoming || '') === this.jobNoIncomingFilter;

    const matchSectionName =
      excludeKey === 'sectionName' ||
      this.sectionNameFilter === 'all' ||
      (row.sectionName || '') === this.sectionNameFilter;

    const matchInchargeBy =
      excludeKey === 'inchargeBy' ||
      this.inchargeByFilter === 'all' ||
      (row.inchargeBy || '') === this.inchargeByFilter;

    return matchJobNoIncoming && matchSectionName && matchInchargeBy;
  }

  private rebuildRelatedOptions() {
    this.jobNoIncomingOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'jobNoIncoming')).map(x => x.jobNoIncoming)
    );

    this.sectionNameOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'sectionName')).map(x => x.sectionName)
    );

    this.inchargeByOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'inchargeBy')).map(x => x.inchargeBy)
    );
  }

  private syncInvalidSelectedFilters() {
    if (this.jobNoIncomingFilter !== 'all' && !this.jobNoIncomingOptions.includes(this.jobNoIncomingFilter)) {
      this.jobNoIncomingFilter = 'all';
      this.dropdownSearch.jobNoIncoming = '';
    }

    if (this.sectionNameFilter !== 'all' && !this.sectionNameOptions.includes(this.sectionNameFilter)) {
      this.sectionNameFilter = 'all';
      this.dropdownSearch.sectionName = '';
    }

    if (this.inchargeByFilter !== 'all' && !this.inchargeByOptions.includes(this.inchargeByFilter)) {
      this.inchargeByFilter = 'all';
      this.dropdownSearch.inchargeBy = '';
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
      case 'jobNoIncoming': return this.jobNoIncomingOptions;
      case 'sectionName': return this.sectionNameOptions;
      case 'inchargeBy': return this.inchargeByOptions;
    }
  }

  getFilterValue(key: FilterKey): string {
    switch (key) {
      case 'jobNoIncoming': return this.jobNoIncomingFilter;
      case 'sectionName': return this.sectionNameFilter;
      case 'inchargeBy': return this.inchargeByFilter;
    }
  }

  setFilterValue(key: FilterKey, value: string) {
    switch (key) {
      case 'jobNoIncoming': this.jobNoIncomingFilter = value; break;
      case 'sectionName': this.sectionNameFilter = value; break;
      case 'inchargeBy': this.inchargeByFilter = value; break;
    }
  }

  getDisplayedInputValue(key: FilterKey): string {
    const filterValue = this.getFilterValue(key);
    const searchValue = this.dropdownSearch[key];

    if (this.dropdownOpen[key]) {
      return searchValue;
    }

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
      jobNoIncoming: this.jobNoIncomingFilter || 'all',
      sectionName: this.sectionNameFilter || 'all',
      inchargeBy: this.inchargeByFilter || 'all'
    };
  }

  exportExcel() {
    if (this.isExporting) return;

    this.isExporting = true;

    this.http.post(
      `${config.apiServer}/api/stockOut/exportExcel`,
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
          `stock_out_report_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;

        a.href = url;
        a.download = filename;
        a.click();

        window.URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: (err) => {
        console.error('exportExcel error:', err);
        this.isExporting = false;
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

  trackByRow(_index: number, row: StockOutReportRow) {
    return row.stockOutId;
  }
}