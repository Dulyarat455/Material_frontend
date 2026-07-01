import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import config from '../../config';

type StockInRow = {
  id: number;
  jobNo: string;
  yearMonth: string;
  recivedDate: string;
  inspector: string;
  unloadBy: string;
  invoiceOne: string;
  taxLnvNo: string;
  materialNo: string;
  unitPrice: string;
  qtyOfPalletPack: string;
  coil: number;
  qtyKgsPcs: number;
  unit: string;
  kgsCoil: string;
  odCoil: string;
  remark: string;
  millSheet: string;
  itemName: string;
  itemSpec: string;
  lotNo: string;
  packing: string;
  rosh: string;
  result: string;
  supplier: string;
  amount: string;
  notControl?: string | null;
  reInspectionDate?: string | null;
  status: string;
  lineNo: string;
};

type FilterKey =
  | 'jobNo'
  | 'materialNo'
  | 'lineNo'
  | 'supplier'
  | 'notControl';

type EditableField =
  | 'invoiceOne'
  | 'lotNo'
  | 'remark';

@Component({
  selector: 'app-stock-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-in.component.html',
  styleUrl: './stock-in.component.css'
})
export class StockInComponent {
  constructor(private http: HttpClient) {}

  isLoading = false;

  isSavingEdit = false;

  editingCell: {
    rowId: number;
    field: EditableField;
  } | null = null;

  editValue = '';

  startDate = '';
  endDate = '';

  jobNoFilter = 'all';
  materialNoFilter = 'all';
  lineNoFilter = 'all';
  supplierFilter = 'all';
  notControlFilter = 'all';

  rows: StockInRow[] = [];
  filteredRows: StockInRow[] = [];

  jobNoOptions: string[] = [];
  materialNoOptions: string[] = [];
  lineNoOptions: string[] = [];
  supplierOptions: string[] = [];
  notControlOptions: string[] = [];


  dropdownOpen: Record<FilterKey, boolean> = {
    jobNo: false,
    materialNo: false,
    lineNo: false,
    supplier: false,
    notControl: false
  };

  dropdownSearch: Record<FilterKey, string> = {
    jobNo: '',
    materialNo: '',
    lineNo: '',
    supplier: '',
    notControl: ''
  };

  ngOnInit() {
    this.startDate = '';
    this.endDate = '';
    this.fetchStockInList();
  }

  fetchStockInList() {
    this.isLoading = true;

    this.http.get<any>(`${config.apiServer}/api/incoming/list`).subscribe({
      next: (res) => {
        this.rows = Array.isArray(res?.results) ? res.results : [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('fetchStockInList error:', err);

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

    this.jobNoFilter = 'all';
    this.materialNoFilter = 'all';
    this.lineNoFilter = 'all';
    this.supplierFilter = 'all';
    this.notControlFilter = 'all';

    this.dropdownSearch.jobNo = '';
    this.dropdownSearch.materialNo = '';
    this.dropdownSearch.lineNo = '';
    this.dropdownSearch.supplier = '';
    this.dropdownSearch.notControl = '';

    this.closeAllDropdowns();
    this.applyFilter();
  }

  private resetAllOptions() {
    this.jobNoOptions = [];
    this.materialNoOptions = [];
    this.lineNoOptions = [];
    this.supplierOptions = [];
    this.notControlOptions = [];
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

    const raw = String(value).trim();

    let d: Date;

    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      d = new Date(raw);
    } else if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
      const [day, month, year] = raw.split('/');
      d = new Date(`${year}-${month}-${day}T00:00:00`);
    } else {
      d = new Date(raw);
    }

    if (isNaN(d.getTime())) return null;

    d.setHours(0, 0, 0, 0);
    return d;
  }

  private matchDateRange(row: StockInRow): boolean {
    const start = this.startDate ? this.toDateOnly(this.startDate) : null;
    const end = this.endDate ? this.toDateOnly(this.endDate) : null;
    const rowDate = this.toDateOnly(row.recivedDate);

    const matchStart = !start || (!!rowDate && rowDate >= start);
    const matchEnd = !end || (!!rowDate && rowDate <= end);

    return matchStart && matchEnd;
  }

  private getNotControlFilterValue(row: StockInRow): string {
    return String(row.notControl || '').trim().toLowerCase() === 'yes'
      ? 'Not Control'
      : 'Blank';
  }

  private rowMatchesFilter(
    row: StockInRow,
    excludeKey?: FilterKey
  ): boolean {
    if (!this.matchDateRange(row)) return false;

    const matchJobNo =
      excludeKey === 'jobNo' ||
      this.jobNoFilter === 'all' ||
      (row.jobNo || '') === this.jobNoFilter;

    const matchMaterialNo =
      excludeKey === 'materialNo' ||
      this.materialNoFilter === 'all' ||
      (row.materialNo || '') === this.materialNoFilter;

    const matchLineNo =
      excludeKey === 'lineNo' ||
      this.lineNoFilter === 'all' ||
      (row.lineNo || '') === this.lineNoFilter;

    const matchSupplier =
      excludeKey === 'supplier' ||
      this.supplierFilter === 'all' ||
      (row.supplier || '') === this.supplierFilter;


    const matchNotControl =
      excludeKey === 'notControl' ||
      this.notControlFilter === 'all' ||
      this.getNotControlFilterValue(row) === this.notControlFilter;



    return (
      matchJobNo &&
      matchMaterialNo &&
      matchLineNo &&
      matchSupplier &&
      matchNotControl
    );
  }

  private rebuildRelatedOptions() {
    this.jobNoOptions = this.buildUniqueOptions(
      this.rows
        .filter(row => this.rowMatchesFilter(row, 'jobNo'))
        .map(x => x.jobNo)
    );

    this.materialNoOptions = this.buildUniqueOptions(
      this.rows
        .filter(row => this.rowMatchesFilter(row, 'materialNo'))
        .map(x => x.materialNo)
    );

    this.lineNoOptions = this.buildUniqueOptions(
      this.rows
        .filter(row => this.rowMatchesFilter(row, 'lineNo'))
        .map(x => x.lineNo)
    );

    this.supplierOptions = this.buildUniqueOptions(
      this.rows
        .filter(row => this.rowMatchesFilter(row, 'supplier'))
        .map(x => x.supplier)
    );

    this.notControlOptions = this.buildUniqueOptions(
      this.rows
        .filter(row => this.rowMatchesFilter(row, 'notControl'))
        .map(x => this.getNotControlFilterValue(x))
    );
  }

  private syncInvalidSelectedFilters() {
    if (
      this.jobNoFilter !== 'all' &&
      !this.jobNoOptions.includes(this.jobNoFilter)
    ) {
      this.jobNoFilter = 'all';
      this.dropdownSearch.jobNo = '';
    }

    if (
      this.materialNoFilter !== 'all' &&
      !this.materialNoOptions.includes(this.materialNoFilter)
    ) {
      this.materialNoFilter = 'all';
      this.dropdownSearch.materialNo = '';
    }

    if (
      this.lineNoFilter !== 'all' &&
      !this.lineNoOptions.includes(this.lineNoFilter)
    ) {
      this.lineNoFilter = 'all';
      this.dropdownSearch.lineNo = '';
    }

    if (
      this.supplierFilter !== 'all' &&
      !this.supplierOptions.includes(this.supplierFilter)
    ) {
      this.supplierFilter = 'all';
      this.dropdownSearch.supplier = '';
    }

    if (
      this.notControlFilter !== 'all' &&
      !this.notControlOptions.includes(this.notControlFilter)
    ) {
      this.notControlFilter = 'all';
      this.dropdownSearch.notControl = '';
    }

  }

  applyFilter() {
    this.rebuildRelatedOptions();
    this.syncInvalidSelectedFilters();
    this.rebuildRelatedOptions();

    this.filteredRows = this.rows.filter(row => {
      return this.rowMatchesFilter(row);
    });
  }

  getOptions(key: FilterKey): string[] {
    switch (key) {
      case 'jobNo':
        return this.jobNoOptions;
      case 'materialNo':
        return this.materialNoOptions;
      case 'lineNo':
        return this.lineNoOptions;
      case 'supplier':
        return this.supplierOptions;
      case 'notControl':
        return this.notControlOptions;
    }
  }

  getFilterValue(key: FilterKey): string {
    switch (key) {
      case 'jobNo':
        return this.jobNoFilter;
      case 'materialNo':
        return this.materialNoFilter;
      case 'lineNo':
        return this.lineNoFilter;
      case 'supplier':
        return this.supplierFilter;
      case 'notControl':
        return this.notControlFilter;
    }
  }

  setFilterValue(key: FilterKey, value: string) {
    switch (key) {
      case 'jobNo':
        this.jobNoFilter = value;
        break;
      case 'materialNo':
        this.materialNoFilter = value;
        break;
      case 'lineNo':
        this.lineNoFilter = value;
        break;
      case 'supplier':
        this.supplierFilter = value;
        break;
      case 'notControl':
        this.notControlFilter = value;
        break;
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

    const exact = options.find(x => {
      return x.trim().toLowerCase() === typed.toLowerCase();
    });

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
      if (key !== exceptKey) {
        this.dropdownOpen[key] = false;
      }
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

  formatDate(value?: string | null) {
    if (!value) return '-';

    const raw = String(value).trim();

    if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
      return raw;
    }

    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;

    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatNumber(value: any, decimals = 0) {
    const n = Number(value || 0);

    return n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  getNotControlText(row: StockInRow): string {
    return String(row.notControl || '').trim().toLowerCase() === 'yes'
      ? 'Not Control'
      : '';
  }




  isEditingCell(row: StockInRow, field: EditableField): boolean {
    return (
      this.editingCell?.rowId === row.id &&
      this.editingCell?.field === field
    );
  }
  
  startEditCell(row: StockInRow, field: EditableField) {
    if (this.isSavingEdit) return;
  
    this.editingCell = {
      rowId: row.id,
      field
    };
  
    this.editValue = String(row[field] || '');
  }
  
  cancelEditCell() {
    if (this.isSavingEdit) return;
  
    this.editingCell = null;
    this.editValue = '';
  }
  
  confirmEditCell(row: StockInRow, field: EditableField) {
    if (this.isSavingEdit) return;
  
    const nextValue = String(this.editValue ?? '');
  
    this.isSavingEdit = true;
  
    this.http.post<any>(
      `${config.apiServer}/api/incoming/updateReportField`,
      {
        id: row.id,
        field,
        value: nextValue
      }
    ).subscribe({
      next: () => {
        row[field] = nextValue;
  
        const rowInRows = this.rows.find(x => x.id === row.id);
        if (rowInRows) {
          rowInRows[field] = nextValue;
        }
  
        const rowInFiltered = this.filteredRows.find(x => x.id === row.id);
        if (rowInFiltered) {
          rowInFiltered[field] = nextValue;
        }
  
        this.editingCell = null;
        this.editValue = '';
        this.isSavingEdit = false;
  
        this.applyFilter();
      },
      error: (err) => {
        console.error('confirmEditCell error:', err);
  
        this.isSavingEdit = false;
      }
    });
  }
  

  trackByRow(_index: number, row: StockInRow) {
    return row.id;
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