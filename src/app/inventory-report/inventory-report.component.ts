import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import config from '../../config';
import Swal from 'sweetalert2';

type InventoryReportRow = {
  transactionStoreId: number;
  incomingId: number;
  jobNo: string;
  recivedDate: string;
  materialNo: string;
  itemName: string;
  itemSpec: string;
  lotNo: string;
  coil: number;
  qtyKgsPcs: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  area: string;
  stockNote: string;
  timeStmp: string;


   // ui state
  isEditingStockNote?: boolean;
  stockNoteDraft?: string;
  originalStockNote?: string;
  isSavingStockNote?: boolean;
};



type InventoryUnitSummaryRow = {
  unit: string;
  totalQty: number;
  totalPrice: number;
};



type FilterKey =
  | 'jobNo'
  | 'recivedDate'
  | 'materialNo'
  | 'itemName'
  | 'spec'
  | 'lotNo'
  | 'area';

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
  isExporting = false;

  startDate = '';
  endDate = '';

  jobNoFilter = 'all';
  materialNoFilter = 'all';
  itemNameFilter = 'all';
  specFilter = 'all';
  lotNoFilter = 'all';
  areaFilter = 'all';
  recivedDateFilter = 'all';


  inventoryRows: InventoryReportRow[] = [];
  filteredRows: InventoryReportRow[] = [];

  jobNoOptions: string[] = [];
  materialNoOptions: string[] = [];
  itemNameOptions: string[] = [];
  specOptions: string[] = [];
  lotNoOptions: string[] = [];
  areaOptions: string[] = [];
  recivedDateOptions: string[] = [];


  userId: number | null = null;

  dropdownOpen: Record<FilterKey, boolean> = {
    jobNo: false,
    recivedDate: false,
    materialNo: false,
    itemName: false,
    spec: false,
    lotNo: false,
    area: false
  };

  dropdownSearch: Record<FilterKey, string> = {
    jobNo: '',
    recivedDate: '',
    materialNo: '',
    itemName: '',
    spec: '',
    lotNo: '',
    area: ''
  };

  ngOnInit() {
    this.userId = Number(localStorage.getItem('materialStore_userId')) || null;
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
      error: async (err) => {
        console.error('fetchInventoryList error:', err);
        this.inventoryRows = [];
        this.filteredRows = [];
        this.resetAllOptions();
        this.isLoading = false;

        await Swal.fire({
          icon: 'error',
          title: 'Load Inventory Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถโหลดข้อมูล Inventory ได้'
        });
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
    this.itemNameFilter = 'all';
    this.specFilter = 'all';
    this.lotNoFilter = 'all';
    this.areaFilter = 'all';
    this.recivedDateFilter = 'all';

    this.dropdownSearch.jobNo = '';
    this.dropdownSearch.materialNo = '';
    this.dropdownSearch.itemName = '';
    this.dropdownSearch.spec = '';
    this.dropdownSearch.lotNo = '';
    this.dropdownSearch.area = '';
    this.dropdownSearch.recivedDate = '';

    this.closeAllDropdowns();
    this.applyFilter();
  }

  private resetAllOptions() {
    this.jobNoOptions = [];
    this.materialNoOptions = [];
    this.itemNameOptions = [];
    this.specOptions = [];
    this.lotNoOptions = [];
    this.areaOptions = [];
    this.recivedDateOptions = [];
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

  private toDateOnly(value?: string) {
    if (!value) return null;

    const d = new Date(value);
    if (isNaN(d.getTime())) return null;

    d.setHours(0, 0, 0, 0);
    return d;
  }

  private matchDateRange(row: InventoryReportRow): boolean {
    const start = this.startDate ? this.toDateOnly(this.startDate) : null;
    const end = this.endDate ? this.toDateOnly(this.endDate) : null;
    const rowDate = this.toDateOnly(row.timeStmp);

    const matchStartDate = !start || (!!rowDate && rowDate >= start);
    const matchEndDate = !end || (!!rowDate && rowDate <= end);

    return matchStartDate && matchEndDate;
  }

  private rowMatchesFilter(row: InventoryReportRow, excludeKey?: FilterKey): boolean {
    if (!this.matchDateRange(row)) return false;

    const matchJobNo =
      excludeKey === 'jobNo' ||
      this.jobNoFilter === 'all' ||
      (row.jobNo || '') === this.jobNoFilter;

    const matchRecivedDate =
      excludeKey === 'recivedDate' ||
      this.recivedDateFilter === 'all' ||
      (row.recivedDate || '') === this.recivedDateFilter;

    const matchMaterialNo =
      excludeKey === 'materialNo' ||
      this.materialNoFilter === 'all' ||
      (row.materialNo || '') === this.materialNoFilter;

    const matchItemName =
      excludeKey === 'itemName' ||
      this.itemNameFilter === 'all' ||
      (row.itemName || '') === this.itemNameFilter;

    const matchSpec =
      excludeKey === 'spec' ||
      this.specFilter === 'all' ||
      (row.itemSpec || '') === this.specFilter;

    const matchLotNo =
      excludeKey === 'lotNo' ||
      this.lotNoFilter === 'all' ||
      (row.lotNo || '') === this.lotNoFilter;

    const matchArea =
      excludeKey === 'area' ||
      this.areaFilter === 'all' ||
      (row.area || '') === this.areaFilter;

    return (
      matchJobNo &&
      matchRecivedDate &&
      matchMaterialNo &&
      matchItemName &&
      matchSpec &&
      matchLotNo &&
      matchArea
    );
  }

  private rebuildRelatedOptions() {
    this.jobNoOptions = this.buildUniqueOptions(
      this.inventoryRows
        .filter(row => this.rowMatchesFilter(row, 'jobNo'))
        .map(x => x.jobNo)
    );

    this.recivedDateOptions = this.buildUniqueOptions(
      this.inventoryRows
        .filter(row => this.rowMatchesFilter(row, 'recivedDate'))
        .map(x => x.recivedDate)
    );

    this.materialNoOptions = this.buildUniqueOptions(
      this.inventoryRows
        .filter(row => this.rowMatchesFilter(row, 'materialNo'))
        .map(x => x.materialNo)
    );

    this.itemNameOptions = this.buildUniqueOptions(
      this.inventoryRows
        .filter(row => this.rowMatchesFilter(row, 'itemName'))
        .map(x => x.itemName)
    );

    this.specOptions = this.buildUniqueOptions(
      this.inventoryRows
        .filter(row => this.rowMatchesFilter(row, 'spec'))
        .map(x => x.itemSpec)
    );

    this.lotNoOptions = this.buildUniqueOptions(
      this.inventoryRows
        .filter(row => this.rowMatchesFilter(row, 'lotNo'))
        .map(x => x.lotNo)
    );

    this.areaOptions = this.buildUniqueOptions(
      this.inventoryRows
        .filter(row => this.rowMatchesFilter(row, 'area'))
        .map(x => x.area)
    );
  }

  private syncInvalidSelectedFilters() {
    if (this.jobNoFilter !== 'all' && !this.jobNoOptions.includes(this.jobNoFilter)) {
      this.jobNoFilter = 'all';
      this.dropdownSearch.jobNo = '';
    }

    if (this.recivedDateFilter !== 'all' && !this.recivedDateOptions.includes(this.recivedDateFilter)) {
      this.recivedDateFilter = 'all';
      this.dropdownSearch.recivedDate = '';
    }

    if (this.materialNoFilter !== 'all' && !this.materialNoOptions.includes(this.materialNoFilter)) {
      this.materialNoFilter = 'all';
      this.dropdownSearch.materialNo = '';
    }

    if (this.itemNameFilter !== 'all' && !this.itemNameOptions.includes(this.itemNameFilter)) {
      this.itemNameFilter = 'all';
      this.dropdownSearch.itemName = '';
    }

    if (this.specFilter !== 'all' && !this.specOptions.includes(this.specFilter)) {
      this.specFilter = 'all';
      this.dropdownSearch.spec = '';
    }

    if (this.lotNoFilter !== 'all' && !this.lotNoOptions.includes(this.lotNoFilter)) {
      this.lotNoFilter = 'all';
      this.dropdownSearch.lotNo = '';
    }

    if (this.areaFilter !== 'all' && !this.areaOptions.includes(this.areaFilter)) {
      this.areaFilter = 'all';
      this.dropdownSearch.area = '';
    }
  }

  applyFilter() {
    this.rebuildRelatedOptions();
    this.syncInvalidSelectedFilters();
    this.rebuildRelatedOptions();

    this.filteredRows = this.inventoryRows.filter((row) => this.rowMatchesFilter(row));
  }

  getOptions(key: FilterKey): string[] {
    switch (key) {
      case 'jobNo': return this.jobNoOptions;
      case 'recivedDate': return this.recivedDateOptions;
      case 'materialNo': return this.materialNoOptions;
      case 'itemName': return this.itemNameOptions;
      case 'spec': return this.specOptions;
      case 'lotNo': return this.lotNoOptions;
      case 'area': return this.areaOptions;
    }
  }

  getFilterValue(key: FilterKey): string {
    switch (key) {
      case 'jobNo': return this.jobNoFilter;
      case 'recivedDate': return this.recivedDateFilter;
      case 'materialNo': return this.materialNoFilter;
      case 'itemName': return this.itemNameFilter;
      case 'spec': return this.specFilter;
      case 'lotNo': return this.lotNoFilter;
      case 'area': return this.areaFilter;
    }
  }

  setFilterValue(key: FilterKey, value: string) {
    switch (key) {
      case 'jobNo': this.jobNoFilter = value; break;
      case 'recivedDate': this.recivedDateFilter = value; break;
      case 'materialNo': this.materialNoFilter = value; break;
      case 'itemName': this.itemNameFilter = value; break;
      case 'spec': this.specFilter = value; break;
      case 'lotNo': this.lotNoFilter = value; break;
      case 'area': this.areaFilter = value; break;
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
      jobNo: this.jobNoFilter || 'all',
      recivedDate: this.recivedDateFilter || 'all',
      materialNo: this.materialNoFilter || 'all',
      itemName: this.itemNameFilter || 'all',
      spec: this.specFilter || 'all',
      lotNo: this.lotNoFilter || 'all',
      area: this.areaFilter || 'all'
    };
  }

  exportExcel() {
    if (this.isExporting) return;

    this.isExporting = true;

    this.http.post(
      `${config.apiServer}/api/inventory/exportExcel`,
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
          `inventory_report_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;

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



 

startEditStockNote(row: InventoryReportRow) {
  if (row.isSavingStockNote) return;

  this.filteredRows.forEach(r => {
    if (r !== row && r.isEditingStockNote) {
      this.cancelEditStockNote(r);
    }
  });

  row.isEditingStockNote = true;
  row.originalStockNote = row.stockNote || '';
  row.stockNoteDraft = row.stockNote || '';
}

onStockNoteDraftChange(row: InventoryReportRow, value: string) {
  row.stockNoteDraft = value;
}

hasStockNoteChanged(row: InventoryReportRow): boolean {
  return (row.stockNoteDraft || '') !== (row.originalStockNote || '');
}

onStockNoteBlur(row: InventoryReportRow) {
  setTimeout(() => {
    if (!row.isEditingStockNote) return;

    if (!this.hasStockNoteChanged(row)) {
      this.cancelEditStockNote(row);
    }
  }, 150);
}

cancelEditStockNote(row: InventoryReportRow) {
  row.stockNoteDraft = row.originalStockNote || row.stockNote || '';
  row.isEditingStockNote = false;
  row.isSavingStockNote = false;
}

private syncEditedStockNote(incomingId: number, stockNote: string) {
  this.inventoryRows.forEach((r) => {
    if (r.incomingId === incomingId) {
      r.stockNote = stockNote;
      r.originalStockNote = stockNote;
      r.stockNoteDraft = stockNote;
      r.isEditingStockNote = false;
      r.isSavingStockNote = false;
    }
  });

  this.filteredRows.forEach((r) => {
    if (r.incomingId === incomingId) {
      r.stockNote = stockNote;
      r.originalStockNote = stockNote;
      r.stockNoteDraft = stockNote;
      r.isEditingStockNote = false;
      r.isSavingStockNote = false;
    }
  });
}

saveStockNote(row: InventoryReportRow) {
  if (row.isSavingStockNote) return;
  if (!this.hasStockNoteChanged(row)) return;

  row.isSavingStockNote = true;

  const body = {
    userId: this.userId, 
    incomingId: row.incomingId,
    stockNote: row.stockNoteDraft ?? ''
  };

  this.http.post<any>(`${config.apiServer}/api/inventory/editStockNote`, body).subscribe({
    next: async () => {
      const newValue = row.stockNoteDraft ?? '';
      this.syncEditedStockNote(row.incomingId, newValue);

      await Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'แก้ไข Stock Note เรียบร้อยแล้ว',
        timer: 1000,
        showConfirmButton: false
      });
    },
    error: async (err) => {
      console.error('saveStockNote error:', err);
      row.isSavingStockNote = false;

      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err?.error?.message || err?.error?.error || 'ไม่สามารถบันทึก Stock Note ได้'
      });
    }
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

  get unitSummaryRows(): InventoryUnitSummaryRow[] {
    const map = new Map<string, InventoryUnitSummaryRow>();
  
    (this.filteredRows || []).forEach((row) => {
      const unit = String(row.unit || '').trim() || '-';
  
      if (!map.has(unit)) {
        map.set(unit, {
          unit,
          totalQty: 0,
          totalPrice: 0
        });
      }
  
      const item = map.get(unit)!;
      item.totalQty += Number(row.qtyKgsPcs || 0);
      item.totalPrice += Number(row.totalPrice || 0);
    });
  
    return Array.from(map.values()).sort((a, b) =>
      a.unit.localeCompare(b.unit)
    );
  }
  
  get grandTotalPriceByUnit(): number {
    return this.unitSummaryRows.reduce((sum, row) => {
      return sum + Number(row.totalPrice || 0);
    }, 0);
  }

  trackByInventory(_index: number, row: InventoryReportRow) {
    return row.transactionStoreId;
  }
}