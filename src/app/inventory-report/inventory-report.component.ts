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
  invoiceOne: string;
  materialNo: string;
  itemName: string;
  itemSpec: string;
  lotNo: string;
  accountCode: string;
  coil: number;
  qtyKgsPcs: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  area: string;
  stockNote: string;
  timeStmp: string;
  remark: string;
  notControl: string;


   // ui state
  isEditingStockNote?: boolean;
  stockNoteDraft?: string;
  originalStockNote?: string;
  isSavingStockNote?: boolean;


  // ui state: Coil
  isEditingCoil?: boolean;
  coilDraft?: number | string;
  originalCoil?: number;
  isSavingCoil?: boolean;

  // ui state: Qty
  isEditingQty?: boolean;
  qtyDraft?: number | string;
  originalQty?: number;
  isSavingQty?: boolean;

  // ui state: Not Control
  isSavingNotControl?: boolean;
};



type InventoryUnitSummaryRow = {
  unit: string;
  totalQty: number;
  totalPrice: number;
  palletCount: number;
};



type FilterKey =
  | 'jobNo'
  | 'recivedDate'
  | 'materialNo'
  | 'itemName'
  | 'spec'
  | 'lotNo'
  | 'area'
  | 'notControl';

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
  notControlFilter = 'all';


  inventoryRows: InventoryReportRow[] = [];
  filteredRows: InventoryReportRow[] = [];

  jobNoOptions: string[] = [];
  materialNoOptions: string[] = [];
  itemNameOptions: string[] = [];
  specOptions: string[] = [];
  lotNoOptions: string[] = [];
  areaOptions: string[] = [];
  recivedDateOptions: string[] = [];
  notControlOptions: string[] = [];

  userId: number | null = null;

  dropdownOpen: Record<FilterKey, boolean> = {
    jobNo: false,
    recivedDate: false,
    materialNo: false,
    itemName: false,
    spec: false,
    lotNo: false,
    area: false,
    notControl: false
  };

  dropdownSearch: Record<FilterKey, string> = {
    jobNo: '',
    recivedDate: '',
    materialNo: '',
    itemName: '',
    spec: '',
    lotNo: '',
    area: '',
    notControl: ''
  };

  role: string = '';


  ngOnInit() {
    this.userId = Number(localStorage.getItem('materialStore_userId')) || null;
    this.role = localStorage.getItem('materialStore_role')!;
    
    this.fetchInventoryList();
  }


 
  
  
  private getTimeSortValue(value: string): number {
    if (!value) return 0;
  
    const d = new Date(value);
  
    if (Number.isNaN(d.getTime())) return 0;
  
    return d.getTime();
  }



  private readonly areaSortPriority = [
    'Pending',
    '1101', '1102', '1103', '1104', '1105', '1106',
    '1107', '1108', '1109', '1110', '1111',
    '1201', '1202', '1203', '1204', '1205', '1206',
    '1207', '1208', '1209', '1210', '1211',
    '2101', '2102', '2103', '2104', '2105', '2106',
    '2201', '2202', '2203', '2204', '2205', '2206',
    '3101', '3102', '3103', '3104', '3105', '3106',
    '3201', '3202', '3203', '3204', '3205', '3206',
    'Chemical'
  ];
  
  private getAreaSortIndex(area: string): number {
    const areaText = String(area || '').trim();
  
    const index = this.areaSortPriority.findIndex(
      x => x.toLowerCase() === areaText.toLowerCase()
    );
  
    return index >= 0 ? index : 9999;
  }
  


  private sortInventoryRows(rows: InventoryReportRow[]): InventoryReportRow[] {
    return [...rows].sort((a, b) => {
      // 1) Account Code 4520 มาก่อนเสมอ
      // accountCode === '4520' => 0
      // accountCode อื่น ๆ => 1
      const accountA = String(a.accountCode || '').trim() === '4520' ? 0 : 1;
      const accountB = String(b.accountCode || '').trim() === '4520' ? 0 : 1;
  
      if (accountA !== accountB) {
        return accountA - accountB;
      }
  
      // 2) Control มาก่อน Not Control
      // notControl !== 'yes' => 0
      // notControl === 'yes' => 1
      const controlA = a.notControl === 'yes' ? 1 : 0;
      const controlB = b.notControl === 'yes' ? 1 : 0;
  
      if (controlA !== controlB) {
        return controlA - controlB;
      }
  
      // 3) Sort by Item Name
      const nameCompare = String(a.itemName || '').localeCompare(
        String(b.itemName || ''),
        undefined,
        {
          numeric: true,
          sensitivity: 'base'
        }
      );
  
      if (nameCompare !== 0) {
        return nameCompare;
      }
  
      // 4) Sort by Item Spec
      const specCompare = String(a.itemSpec || '').localeCompare(
        String(b.itemSpec || ''),
        undefined,
        {
          numeric: true,
          sensitivity: 'base'
        }
      );
  
      if (specCompare !== 0) {
        return specCompare;
      }
  
      // 5) Sort by Area Priority
      const areaA = this.getAreaSortIndex(a.area);
      const areaB = this.getAreaSortIndex(b.area);
  
      if (areaA !== areaB) {
        return areaA - areaB;
      }
  
      // ถ้า Area ไม่อยู่ใน priority list ให้เรียง A-Z ต่อ
      const areaTextCompare = String(a.area || '').localeCompare(
        String(b.area || ''),
        undefined,
        {
          numeric: true,
          sensitivity: 'base'
        }
      );
  
      if (areaTextCompare !== 0) {
        return areaTextCompare;
      }
  
      // 6) ถ้ายังเท่ากัน ค่อยเรียงตามเวลาเก่า -> ใหม่
      const timeA = this.getTimeSortValue(a.timeStmp);
      const timeB = this.getTimeSortValue(b.timeStmp);
  
      return timeA - timeB;
    });
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
    this.notControlFilter = 'all';

    this.dropdownSearch.jobNo = '';
    this.dropdownSearch.materialNo = '';
    this.dropdownSearch.itemName = '';
    this.dropdownSearch.spec = '';
    this.dropdownSearch.lotNo = '';
    this.dropdownSearch.area = '';
    this.dropdownSearch.recivedDate = '';
    this.dropdownSearch.notControl = '';

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


  private getNotControlLabel(row: InventoryReportRow): string {
    return row.notControl === 'yes' ? 'Not Control' : 'Control';
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


    const matchNotControl =
      excludeKey === 'notControl' ||
      this.notControlFilter === 'all' ||
      (
        this.notControlFilter === 'Not Control'
          ? row.notControl === 'yes'
          : row.notControl !== 'yes'
      );

    

    return (
      matchJobNo &&
      matchRecivedDate &&
      matchMaterialNo &&
      matchItemName &&
      matchSpec &&
      matchLotNo &&
      matchArea &&
      matchNotControl
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

    this.notControlOptions = this.buildUniqueOptions(
      this.inventoryRows
        .filter(row => this.rowMatchesFilter(row, 'notControl'))
        .map(row => this.getNotControlLabel(row))
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

    if (this.notControlFilter !== 'all' && !this.notControlOptions.includes(this.notControlFilter)) {
      this.notControlFilter = 'all';
      this.dropdownSearch.notControl = '';
    }


  }

  applyFilter() {
    this.rebuildRelatedOptions();
    this.syncInvalidSelectedFilters();
    this.rebuildRelatedOptions();

    const rows = this.inventoryRows.filter((row) => this.rowMatchesFilter(row));

    this.filteredRows = this.sortInventoryRows(rows);
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
      case 'notControl': return this.notControlOptions;
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
      case 'notControl': return this.notControlFilter;
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
      case 'notControl': this.notControlFilter = value; break;
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
      area: this.areaFilter || 'all',
      notControl: this.notControlFilter || 'all'
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




startEditCoil(row: InventoryReportRow) {
  if (this.role !== 'admin') return;
  if (row.isSavingCoil) return;

  this.filteredRows.forEach(r => {
    if (r !== row) {
      if (r.isEditingCoil) this.cancelEditCoil(r);
      if (r.isEditingQty) this.cancelEditQty(r);
      if (r.isEditingStockNote) this.cancelEditStockNote(r);
    }
  });

  row.isEditingCoil = true;
  row.originalCoil = Number(row.coil || 0);
  row.coilDraft = Number(row.coil || 0);
}

onCoilDraftChange(row: InventoryReportRow, value: string) {
  row.coilDraft = value;
}

hasCoilChanged(row: InventoryReportRow): boolean {
  return Number(row.coilDraft || 0) !== Number(row.originalCoil || 0);
}

onCoilBlur(row: InventoryReportRow) {
  setTimeout(() => {
    if (!row.isEditingCoil) return;

    if (!this.hasCoilChanged(row)) {
      this.cancelEditCoil(row);
    }
  }, 150);
}

cancelEditCoil(row: InventoryReportRow) {
  row.coilDraft = row.originalCoil ?? row.coil ?? 0;
  row.isEditingCoil = false;
  row.isSavingCoil = false;
}

private syncEditedCoil(incomingId: number, coil: number) {
  this.inventoryRows.forEach((r) => {
    if (r.incomingId === incomingId) {
      r.coil = coil;
      r.originalCoil = coil;
      r.coilDraft = coil;
      r.isEditingCoil = false;
      r.isSavingCoil = false;
    }
  });

  this.filteredRows.forEach((r) => {
    if (r.incomingId === incomingId) {
      r.coil = coil;
      r.originalCoil = coil;
      r.coilDraft = coil;
      r.isEditingCoil = false;
      r.isSavingCoil = false;
    }
  });
}



saveCoil(row: InventoryReportRow) {
  if (this.role !== 'admin') return;
  if (row.isSavingCoil) return;
  if (!this.hasCoilChanged(row)) return;

  const coilValue = Number(row.coilDraft);

  if (Number.isNaN(coilValue) || coilValue < 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Coil',
      text: 'กรุณากรอก Coil เป็นตัวเลขที่ถูกต้อง'
    });
    return;
  }

  row.isSavingCoil = true;

  const body = {
    userId: this.userId,
    incomingId: row.incomingId,
    coil: coilValue
  };

  this.http.post<any>(`${config.apiServer}/api/inventory/editCoil`, body).subscribe({
    next: async () => {
      this.syncEditedCoil(row.incomingId, coilValue);

      await Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'แก้ไข Coil เรียบร้อยแล้ว',
        timer: 1000,
        showConfirmButton: false
      });
    },
    error: async (err) => {
      console.error('saveCoil error:', err);
      row.isSavingCoil = false;

      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err?.error?.message || err?.error?.error || 'ไม่สามารถบันทึก Coil ได้'
      });
    }
  });
}





startEditQty(row: InventoryReportRow) {
  if (this.role !== 'admin') return;
  if (row.isSavingQty) return;

  this.filteredRows.forEach(r => {
    if (r !== row) {
      if (r.isEditingCoil) this.cancelEditCoil(r);
      if (r.isEditingQty) this.cancelEditQty(r);
      if (r.isEditingStockNote) this.cancelEditStockNote(r);
    }
  });

  row.isEditingQty = true;
  row.originalQty = Number(row.qtyKgsPcs || 0);
  row.qtyDraft = Number(row.qtyKgsPcs || 0);
}

onQtyDraftChange(row: InventoryReportRow, value: string) {
  row.qtyDraft = value;
}

hasQtyChanged(row: InventoryReportRow): boolean {
  return Number(row.qtyDraft || 0) !== Number(row.originalQty || 0);
}

onQtyBlur(row: InventoryReportRow) {
  setTimeout(() => {
    if (!row.isEditingQty) return;

    if (!this.hasQtyChanged(row)) {
      this.cancelEditQty(row);
    }
  }, 150);
}

cancelEditQty(row: InventoryReportRow) {
  row.qtyDraft = row.originalQty ?? row.qtyKgsPcs ?? 0;
  row.isEditingQty = false;
  row.isSavingQty = false;
}

private syncEditedQty(incomingId: number, qty: number) {
  this.inventoryRows.forEach((r) => {
    if (r.incomingId === incomingId) {
      r.qtyKgsPcs = qty;
      r.totalPrice = Number(qty || 0) * Number(r.unitPrice || 0);
      r.originalQty = qty;
      r.qtyDraft = qty;
      r.isEditingQty = false;
      r.isSavingQty = false;
    }
  });

  this.filteredRows.forEach((r) => {
    if (r.incomingId === incomingId) {
      r.qtyKgsPcs = qty;
      r.totalPrice = Number(qty || 0) * Number(r.unitPrice || 0);
      r.originalQty = qty;
      r.qtyDraft = qty;
      r.isEditingQty = false;
      r.isSavingQty = false;
    }
  });
}

saveQty(row: InventoryReportRow) {
  if (this.role !== 'admin') return;
  if (row.isSavingQty) return;
  if (!this.hasQtyChanged(row)) return;

  const qtyValue = Number(row.qtyDraft);

  if (Number.isNaN(qtyValue) || qtyValue < 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Qty',
      text: 'กรุณากรอก Qty เป็นตัวเลขที่ถูกต้อง'
    });
    return;
  }

  row.isSavingQty = true;

  const body = {
    userId: this.userId,
    incomingId: row.incomingId,
    qty: qtyValue
  };

  this.http.post<any>(`${config.apiServer}/api/inventory/editQty`, body).subscribe({
    next: async () => {
      this.syncEditedQty(row.incomingId, qtyValue);

      await Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'แก้ไข Qty เรียบร้อยแล้ว',
        timer: 1000,
        showConfirmButton: false
      });
    },
    error: async (err) => {
      console.error('saveQty error:', err);
      row.isSavingQty = false;

      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err?.error?.message || err?.error?.error || 'ไม่สามารถบันทึก Qty ได้'
      });
    }
  });
}





private syncEditedNotControl(incomingId: number, controlKey: string) {
  this.inventoryRows.forEach((r) => {
    if (r.incomingId === incomingId) {
      r.notControl = controlKey;
      r.isSavingNotControl = false;
    }
  });

  this.filteredRows.forEach((r) => {
    if (r.incomingId === incomingId) {
      r.notControl = controlKey;
      r.isSavingNotControl = false;
    }
  });
}



onToggleNotControl(row: InventoryReportRow, event: Event) {
  if (this.role !== 'admin') {
    event.preventDefault();
    return;
  }

  if (row.isSavingNotControl) {
    event.preventDefault();
    return;
  }

  const input = event.target as HTMLInputElement;
  const checked = input.checked;
  const oldValue = row.notControl || '';
  const controlKey = checked ? 'yes' : '';

  row.isSavingNotControl = true;

  const body = {
    userId: this.userId,
    incomingId: row.incomingId,
    controlKey
  };

  this.http.post<any>(`${config.apiServer}/api/inventory/editNotControl`, body).subscribe({
    next: async () => {
      this.syncEditedNotControl(row.incomingId, controlKey);

      await Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: checked ? 'ตั้งค่า Not Control เรียบร้อยแล้ว' : 'ยกเลิก Not Control เรียบร้อยแล้ว',
        timer: 900,
        showConfirmButton: false
      });
    },
    error: async (err) => {
      console.error('editNotControl error:', err);

      row.notControl = oldValue;
      row.isSavingNotControl = false;
      input.checked = oldValue === 'yes';

      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err?.error?.message || err?.error?.error || 'ไม่สามารถบันทึก Not Control ได้'
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


  formatQty(value: any, maxDigits: number = 3) {
    const n = Number(value || 0);
  
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDigits
    });
  }


  private getUnitSortPriority(unit: string): number {
    const u = String(unit || '').trim().toUpperCase();
  
    if (u === 'KGS') return 0;   // บนสุด
    if (u === 'PAL') return 90;   // ก่อน DRM
    if (u === 'DRM') return 100;  // ล่างสุด
  
    return 10; // unit อื่น ๆ อยู่ต่อจาก KGS และก่อน PAL/DRM
  }




  private buildUnitSummaryRows(rows: InventoryReportRow[]): InventoryUnitSummaryRow[] {
    const map = new Map<string, InventoryUnitSummaryRow>();
  
    (rows || []).forEach((row) => {
      const unit = String(row.unit || '').trim() || '-';
  
      if (!map.has(unit)) {
        map.set(unit, {
          unit,
          totalQty: 0,
          totalPrice: 0,
          palletCount: 0
        });
      }
  
      const item = map.get(unit)!;
      item.totalQty += Number(row.qtyKgsPcs || 0);
      item.totalPrice += Number(row.totalPrice || 0);
  
      if (unit.toUpperCase() === 'KGS') {
        item.palletCount += 1;
      }
    });
  
    return Array.from(map.values()).sort((a, b) => {
      const priorityA = this.getUnitSortPriority(a.unit);
      const priorityB = this.getUnitSortPriority(b.unit);
    
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
    
      return String(a.unit || '').localeCompare(
        String(b.unit || ''),
        undefined,
        {
          numeric: true,
          sensitivity: 'base'
        }
      );
    });
  }
  
  get controlRows(): InventoryReportRow[] {
    return (this.filteredRows || []).filter(row => row.notControl !== 'yes');
  }
  
  get notControlRows(): InventoryReportRow[] {
    return (this.filteredRows || []).filter(row => row.notControl === 'yes');
  }
  
  get controlUnitSummaryRows(): InventoryUnitSummaryRow[] {
    return this.buildUnitSummaryRows(this.controlRows);
  }
  
  get notControlUnitSummaryRows(): InventoryUnitSummaryRow[] {
    return this.buildUnitSummaryRows(this.notControlRows);
  }
  
  get controlGrandTotalPrice(): number {
    return this.controlUnitSummaryRows.reduce((sum, row) => {
      return sum + Number(row.totalPrice || 0);
    }, 0);
  }
  
  get notControlGrandTotalPrice(): number {
    return this.notControlUnitSummaryRows.reduce((sum, row) => {
      return sum + Number(row.totalPrice || 0);
    }, 0);
  }





  trackByInventory(_index: number, row: InventoryReportRow) {
    return row.transactionStoreId;
  }
}