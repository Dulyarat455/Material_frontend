import { Component, HostListener } from '@angular/core';
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

type FilterKey =
  | 'jobNo'
  | 'type'
  | 'state'
  | 'accountCode'
  | 'priority'
  | 'area'
  | 'incomingJobNo'
  | 'materialNo'
  | 'materialName'
  | 'materialSpec'
  | 'lotNo'
  | 'recivedDate'
  | 'requestBy'
  | 'inchargeBy';

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
  isExporting = false;

  rows: TransactionJobReportRow[] = [];
  filteredRows: TransactionJobReportRow[] = [];

  startDateRequest = '';
  endDateRequest = '';
  startDateIncharge = '';
  endDateIncharge = '';

  jobNoFilter = 'all';
  typeFilter = 'all';
  stateFilter = 'all';
  accountCodeFilter = 'all';
  priorityFilter = 'all';
  areaFilter = 'all';
  incomingJobNoFilter = 'all';
  materialNoFilter = 'all';
  materialNameFilter = 'all';
  materialSpecFilter = 'all';
  lotNoFilter = 'all';
  recivedDateFilter = 'all';
  requestByFilter = 'all';
  inchargeByFilter = 'all';

  jobNoOptions: string[] = [];
  typeOptions: string[] = [];
  stateOptions: string[] = [];
  accountCodeOptions: string[] = [];
  priorityOptions: string[] = [];
  areaOptions: string[] = [];
  incomingJobNoOptions: string[] = [];
  materialNoOptions: string[] = [];
  materialNameOptions: string[] = [];
  materialSpecOptions: string[] = [];
  lotNoOptions: string[] = [];
  recivedDateOptions: string[] = [];
  requestByOptions: string[] = [];
  inchargeByOptions: string[] = [];

  dropdownOpen: Record<FilterKey, boolean> = {
    jobNo: false,
    type: false,
    state: false,
    accountCode: false,
    priority: false,
    area: false,
    incomingJobNo: false,
    materialNo: false,
    materialName: false,
    materialSpec: false,
    lotNo: false,
    recivedDate: false,
    requestBy: false,
    inchargeBy: false
  };

  dropdownSearch: Record<FilterKey, string> = {
    jobNo: '',
    type: '',
    state: '',
    accountCode: '',
    priority: '',
    area: '',
    incomingJobNo: '',
    materialNo: '',
    materialName: '',
    materialSpec: '',
    lotNo: '',
    recivedDate: '',
    requestBy: '',
    inchargeBy: ''
  };

  ngOnInit() {
    this.fetchTransactionJobList();
    this.setDefaultRequestDateRange();
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
        this.resetAllOptions();
        this.isLoading = false;
      }
    });
  }



  private getExportPayload() {
    return {
      startDateRequest: this.startDateRequest || '',
      endDateRequest: this.endDateRequest || '',
      startDateIncharge: this.startDateIncharge || '',
      endDateIncharge: this.endDateIncharge || '',
  
      jobNo: this.jobNoFilter || 'all',
      type: this.typeFilter || 'all',
      state: this.stateFilter || 'all',
      accountCode: this.accountCodeFilter || 'all',
      priority: this.priorityFilter || 'all',
      area: this.areaFilter || 'all',
      incomingJobNo: this.incomingJobNoFilter || 'all',
      materialNo: this.materialNoFilter || 'all',
      materialName: this.materialNameFilter || 'all',
      materialSpec: this.materialSpecFilter || 'all',
      lotNo: this.lotNoFilter || 'all',
      recivedDate: this.recivedDateFilter || 'all',
      requestBy: this.requestByFilter || 'all',
      inchargeBy: this.inchargeByFilter || 'all'
    };
  }
  
  exportExcel() {
    if (this.isExporting) return;
  
    this.isExporting = true;
  
    this.http.post(
      `${config.apiServer}/api/reportJob/exportExcel`,
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
          `transaction_job_report_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;
  
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




  onFilterChange() {
    this.applyFilter();
  }

  clearFilters() {
    this.setDefaultRequestDateRange();
    this.startDateIncharge = '';
    this.endDateIncharge = '';

    this.jobNoFilter = 'all';
    this.typeFilter = 'all';
    this.stateFilter = 'all';
    this.accountCodeFilter = 'all';
    this.priorityFilter = 'all';
    this.areaFilter = 'all';
    this.incomingJobNoFilter = 'all';
    this.materialNoFilter = 'all';
    this.materialNameFilter = 'all';
    this.materialSpecFilter = 'all';
    this.lotNoFilter = 'all';
    this.recivedDateFilter = 'all';
    this.requestByFilter = 'all';
    this.inchargeByFilter = 'all';

    this.dropdownSearch.jobNo = '';
    this.dropdownSearch.type = '';
    this.dropdownSearch.state = '';
    this.dropdownSearch.accountCode = '';
    this.dropdownSearch.priority = '';
    this.dropdownSearch.area = '';
    this.dropdownSearch.incomingJobNo = '';
    this.dropdownSearch.materialNo = '';
    this.dropdownSearch.materialName = '';
    this.dropdownSearch.materialSpec = '';
    this.dropdownSearch.lotNo = '';
    this.dropdownSearch.recivedDate = '';
    this.dropdownSearch.requestBy = '';
    this.dropdownSearch.inchargeBy = '';

    this.closeAllDropdowns();
    this.applyFilter();
  }

  private resetAllOptions() {
    this.jobNoOptions = [];
    this.typeOptions = [];
    this.stateOptions = [];
    this.accountCodeOptions = [];
    this.priorityOptions = [];
    this.areaOptions = [];
    this.incomingJobNoOptions = [];
    this.materialNoOptions = [];
    this.materialNameOptions = [];
    this.materialSpecOptions = [];
    this.lotNoOptions = [];
    this.recivedDateOptions = [];
    this.requestByOptions = [];
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

  private matchRequestDateRange(row: TransactionJobReportRow): boolean {
    const start = this.startDateRequest ? this.toDateOnly(this.startDateRequest) : null;
    const end = this.endDateRequest ? this.toDateOnly(this.endDateRequest) : null;
    const rowDate = this.toDateOnly(row.requestTime);

    const matchStart = !start || (!!rowDate && rowDate >= start);
    const matchEnd = !end || (!!rowDate && rowDate <= end);

    return matchStart && matchEnd;
  }

  private matchInchargeDateRange(row: TransactionJobReportRow): boolean {
    const start = this.startDateIncharge ? this.toDateOnly(this.startDateIncharge) : null;
    const end = this.endDateIncharge ? this.toDateOnly(this.endDateIncharge) : null;
    const rowDate = this.toDateOnly(row.inchargeTime || '');

    const matchStart = !start || (!!rowDate && rowDate >= start);
    const matchEnd = !end || (!!rowDate && rowDate <= end);

    return matchStart && matchEnd;
  }

  private rowMatchesFilter(row: TransactionJobReportRow, excludeKey?: FilterKey): boolean {
    if (!this.matchRequestDateRange(row)) return false;
    if (!this.matchInchargeDateRange(row)) return false;

    const matchJobNo =
      excludeKey === 'jobNo' ||
      this.jobNoFilter === 'all' ||
      (row.jobNo || '') === this.jobNoFilter;

    const matchType =
      excludeKey === 'type' ||
      this.typeFilter === 'all' ||
      (row.type || '') === this.typeFilter;

    const matchState =
      excludeKey === 'state' ||
      this.stateFilter === 'all' ||
      (row.state || '') === this.stateFilter;

    const matchAccountCode =
      excludeKey === 'accountCode' ||
      this.accountCodeFilter === 'all' ||
      (row.accountCode || '') === this.accountCodeFilter;

    const matchPriority =
      excludeKey === 'priority' ||
      this.priorityFilter === 'all' ||
      (row.priority || '') === this.priorityFilter;

    const matchArea =
      excludeKey === 'area' ||
      this.areaFilter === 'all' ||
      (row.area || '') === this.areaFilter;

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

    const matchRecivedDate =
      excludeKey === 'recivedDate' ||
      this.recivedDateFilter === 'all' ||
      (row.recivedDate || '') === this.recivedDateFilter;

    const matchRequestBy =
      excludeKey === 'requestBy' ||
      this.requestByFilter === 'all' ||
      (row.requestBy || '') === this.requestByFilter;

    const matchInchargeBy =
      excludeKey === 'inchargeBy' ||
      this.inchargeByFilter === 'all' ||
      (row.inchargeBy || '') === this.inchargeByFilter;

    return (
      matchJobNo &&
      matchType &&
      matchState &&
      matchAccountCode &&
      matchPriority &&
      matchArea &&
      matchIncomingJobNo &&
      matchMaterialNo &&
      matchMaterialName &&
      matchMaterialSpec &&
      matchLotNo &&
      matchRecivedDate &&
      matchRequestBy &&
      matchInchargeBy
    );
  }

  private rebuildRelatedOptions() {
    this.jobNoOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'jobNo')).map(x => x.jobNo)
    );

    this.typeOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'type')).map(x => x.type)
    );

    this.stateOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'state')).map(x => x.state)
    );

    this.accountCodeOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'accountCode')).map(x => x.accountCode)
    );

    this.priorityOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'priority')).map(x => x.priority)
    );

    this.areaOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'area')).map(x => x.area)
    );

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

    this.recivedDateOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'recivedDate')).map(x => x.recivedDate)
    );

    this.requestByOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'requestBy')).map(x => x.requestBy)
    );

    this.inchargeByOptions = this.buildUniqueOptions(
      this.rows.filter(row => this.rowMatchesFilter(row, 'inchargeBy')).map(x => x.inchargeBy)
    );
  }

  private syncInvalidSelectedFilters() {
    if (this.jobNoFilter !== 'all' && !this.jobNoOptions.includes(this.jobNoFilter)) {
      this.jobNoFilter = 'all';
      this.dropdownSearch.jobNo = '';
    }

    if (this.typeFilter !== 'all' && !this.typeOptions.includes(this.typeFilter)) {
      this.typeFilter = 'all';
      this.dropdownSearch.type = '';
    }

    if (this.stateFilter !== 'all' && !this.stateOptions.includes(this.stateFilter)) {
      this.stateFilter = 'all';
      this.dropdownSearch.state = '';
    }

    if (this.accountCodeFilter !== 'all' && !this.accountCodeOptions.includes(this.accountCodeFilter)) {
      this.accountCodeFilter = 'all';
      this.dropdownSearch.accountCode = '';
    }

    if (this.priorityFilter !== 'all' && !this.priorityOptions.includes(this.priorityFilter)) {
      this.priorityFilter = 'all';
      this.dropdownSearch.priority = '';
    }

    if (this.areaFilter !== 'all' && !this.areaOptions.includes(this.areaFilter)) {
      this.areaFilter = 'all';
      this.dropdownSearch.area = '';
    }

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

    if (this.recivedDateFilter !== 'all' && !this.recivedDateOptions.includes(this.recivedDateFilter)) {
      this.recivedDateFilter = 'all';
      this.dropdownSearch.recivedDate = '';
    }

    if (this.requestByFilter !== 'all' && !this.requestByOptions.includes(this.requestByFilter)) {
      this.requestByFilter = 'all';
      this.dropdownSearch.requestBy = '';
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
      case 'jobNo': return this.jobNoOptions;
      case 'type': return this.typeOptions;
      case 'state': return this.stateOptions;
      case 'accountCode': return this.accountCodeOptions;
      case 'priority': return this.priorityOptions;
      case 'area': return this.areaOptions;
      case 'incomingJobNo': return this.incomingJobNoOptions;
      case 'materialNo': return this.materialNoOptions;
      case 'materialName': return this.materialNameOptions;
      case 'materialSpec': return this.materialSpecOptions;
      case 'lotNo': return this.lotNoOptions;
      case 'recivedDate': return this.recivedDateOptions;
      case 'requestBy': return this.requestByOptions;
      case 'inchargeBy': return this.inchargeByOptions;
    }
  }

  getFilterValue(key: FilterKey): string {
    switch (key) {
      case 'jobNo': return this.jobNoFilter;
      case 'type': return this.typeFilter;
      case 'state': return this.stateFilter;
      case 'accountCode': return this.accountCodeFilter;
      case 'priority': return this.priorityFilter;
      case 'area': return this.areaFilter;
      case 'incomingJobNo': return this.incomingJobNoFilter;
      case 'materialNo': return this.materialNoFilter;
      case 'materialName': return this.materialNameFilter;
      case 'materialSpec': return this.materialSpecFilter;
      case 'lotNo': return this.lotNoFilter;
      case 'recivedDate': return this.recivedDateFilter;
      case 'requestBy': return this.requestByFilter;
      case 'inchargeBy': return this.inchargeByFilter;
    }
  }

  setFilterValue(key: FilterKey, value: string) {
    switch (key) {
      case 'jobNo': this.jobNoFilter = value; break;
      case 'type': this.typeFilter = value; break;
      case 'state': this.stateFilter = value; break;
      case 'accountCode': this.accountCodeFilter = value; break;
      case 'priority': this.priorityFilter = value; break;
      case 'area': this.areaFilter = value; break;
      case 'incomingJobNo': this.incomingJobNoFilter = value; break;
      case 'materialNo': this.materialNoFilter = value; break;
      case 'materialName': this.materialNameFilter = value; break;
      case 'materialSpec': this.materialSpecFilter = value; break;
      case 'lotNo': this.lotNoFilter = value; break;
      case 'recivedDate': this.recivedDateFilter = value; break;
      case 'requestBy': this.requestByFilter = value; break;
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







  private setDefaultRequestDateRange() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    this.startDateRequest = this.formatDateInput(yesterday);
    this.endDateRequest = this.formatDateInput(today);
  }
  
  private formatDateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }




}