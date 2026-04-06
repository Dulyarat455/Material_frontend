import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';
import config from '../../config';

type storeMasterRow = {
  id: number;
  name: string;
};

type SlotStatus = 'OCCUPIED' | 'PARTIAL' | 'EMPTY' | 'REJECTED';

type MaterialItem = {
  materialNo: string;
  description: string;
  qty: number;
  uom: string;
  invNo: string;
  receivedAt: string;
  fifoRank: number;
  urgent?: boolean;

  itemNo?: string;
  itemName?: string;
  itemSpec?: string;
  remark?: string;

  // ใช้สำหรับ table mode
  jobNo?: string;
  coil?: number;
  //part user
  timestmp: string;
  stockNote?: string;
  userId: number;
  userName: string;
  userEmpNo: string;

  incomingId?: number;
  storeId?: number;
};

type SlotRow = {
  storeId?: number;
  storeCode: string;
  zone: 'A' | 'B' | 'C' | 'D' | 'PENDING';
  row: 'TOP' | 'BTM' | 'PENDING';
  status: SlotStatus;
  usedQty?: number;
  materials: MaterialItem[];
};

type MoveRow = {
  uid: string;
  checked: boolean;
  area: string;
  receivedDate: string;
  invoice: string;
  qty: number;
  remark?: string;
  toArea: string;

  itemNo: string;
  itemName: string;
  itemSpec: string;
  coil?: number;
  unit?: string;

  sourceStoreCode: string;
  sourceInvNo: string;

  jobNo: string;
  incomingId: number;
  storeId: number;
  stockNote?: string;
};

type TransactionNavJob = {
  id: number;
  incomingId?: number | null;
  dateTimePD?: string;
  jobNo?: string;
  type?: 'Issue' | 'Return';
  materialNo?: string;
  materialName?: string;
  materialSpec?: string;
  mcNo?: string;
  requestBy?: string;
  remark?: string;
  state?: string;
  priority?: 'Normal' | 'Urgent';
};


type StockOutRow = {
  uid: string;
  checked: boolean;
  area: string;
  receivedDate: string;
  jobNo: string;
  invoice: string;
  qty: number;
  remark?: string;

  itemNo: string;
  itemName: string;
  itemSpec: string;
  coil?: number;
  unit?: string;

  incomingId: number;
  storeId: number;
  sourceStoreCode: string;
  stockNote?: string;
};




type StockScanField =
  | 'jobNo'
  | 'yearMonth'
  | 'recivedDate'
  | 'inspector'
  | 'unloadBy'
  | 'invoiceOne'
  | 'taxInvNo'
  | 'itemNo'
  | 'unitPrice'
  | 'qtyOfPalletPack'
  | 'coil'
  | 'qtyKgsPcs'
  | 'unit'
  | 'kgsCoil'
  | 'odCoil'
  | 'remark'
  | 'millSheet'
  | 'itemName'
  | 'specDwg'
  | 'lotNo'
  | 'quantity'
  | 'rosh'
  | 'result'
  | 'supplier'
  | 'amount';


  type ReturnStockField =
  | 'jobNoIncoming'
  | 'yearMonth'
  | 'recivedDate'
  | 'inspector'
  | 'unloadBy'
  | 'invoiceOne'
  | 'taxInvNo'
  | 'materialNoScan'
  | 'unitPrice'
  | 'qtyOfPalletPack'
  | 'scannerCoil'
  | 'scannerQtyKgsPcs'
  | 'unit'
  | 'kgsCoil'
  | 'odCoil'
  | 'remark'
  | 'millSheet'
  | 'itemNameScan'
  | 'specDwg'
  | 'lotNo'
  | 'quantity'
  | 'rosh'
  | 'result'
  | 'supplier'
  | 'amount'
  | 'coil'
  | 'qtyKgsPcs';




@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.css'
})
export class StorageComponent {
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  @ViewChild('scanJobNo') scanJobNo?: ElementRef<HTMLInputElement>;
  @ViewChild('scanYearMonth') scanYearMonth?: ElementRef<HTMLInputElement>;
  @ViewChild('scanRecivedDate') scanRecivedDate?: ElementRef<HTMLInputElement>;
  @ViewChild('scanInspector') scanInspector?: ElementRef<HTMLInputElement>;
  @ViewChild('scanUnloadBy') scanUnloadBy?: ElementRef<HTMLInputElement>;
  @ViewChild('scanInvoiceOne') scanInvoiceOne?: ElementRef<HTMLInputElement>;
  @ViewChild('scanTaxInvNo') scanTaxInvNo?: ElementRef<HTMLInputElement>;
  @ViewChild('scanItemNo') scanItemNo?: ElementRef<HTMLInputElement>;
  @ViewChild('scanUnitPrice') scanUnitPrice?: ElementRef<HTMLInputElement>;
  @ViewChild('scanQtyOfPalletPack') scanQtyOfPalletPack?: ElementRef<HTMLInputElement>;
  @ViewChild('scanCoil') scanCoil?: ElementRef<HTMLInputElement>;
  @ViewChild('scanQtyKgsPcs') scanQtyKgsPcs?: ElementRef<HTMLInputElement>;
  @ViewChild('scanUnit') scanUnit?: ElementRef<HTMLInputElement>;
  @ViewChild('scanKgsCoil') scanKgsCoil?: ElementRef<HTMLInputElement>;
  @ViewChild('scanOdCoil') scanOdCoil?: ElementRef<HTMLInputElement>;
  @ViewChild('scanRemark') scanRemark?: ElementRef<HTMLInputElement>;
  @ViewChild('scanMillSheet') scanMillSheet?: ElementRef<HTMLInputElement>;
  @ViewChild('scanItemName') scanItemName?: ElementRef<HTMLInputElement>;
  @ViewChild('scanSpecDwg') scanSpecDwg?: ElementRef<HTMLInputElement>;
  @ViewChild('scanLotNo') scanLotNo?: ElementRef<HTMLInputElement>;
  @ViewChild('scanQuantity') scanQuantity?: ElementRef<HTMLInputElement>;
  @ViewChild('scanRosh') scanRosh?: ElementRef<HTMLInputElement>;
  @ViewChild('scanResult') scanResult?: ElementRef<HTMLInputElement>;
  @ViewChild('scanSupplier') scanSupplier?: ElementRef<HTMLInputElement>;
  @ViewChild('scanAmount') scanAmount?: ElementRef<HTMLInputElement>;



  //returnStockIn
@ViewChild('returnScanJobNo') returnScanJobNo?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanYearMonth') returnScanYearMonth?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanRecivedDate') returnScanRecivedDate?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanInspector') returnScanInspector?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanUnloadBy') returnScanUnloadBy?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanInvoiceOne') returnScanInvoiceOne?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanTaxInvNo') returnScanTaxInvNo?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanItemNo') returnScanItemNo?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanUnitPrice') returnScanUnitPrice?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanQtyOfPalletPack') returnScanQtyOfPalletPack?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanScannerCoil') returnScanScannerCoil?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanScannerQtyKgsPcs') returnScanScannerQtyKgsPcs?: ElementRef<HTMLInputElement>;
@ViewChild('returnActualCoil') returnActualCoil?: ElementRef<HTMLInputElement>;
@ViewChild('returnActualQtyKgsPcs') returnActualQtyKgsPcs?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanUnit') returnScanUnit?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanKgsCoil') returnScanKgsCoil?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanOdCoil') returnScanOdCoil?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanRemark') returnScanRemark?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanMillSheet') returnScanMillSheet?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanItemName') returnScanItemName?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanSpecDwg') returnScanSpecDwg?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanLotNo') returnScanLotNo?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanQuantity') returnScanQuantity?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanRosh') returnScanRosh?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanResult') returnScanResult?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanSupplier') returnScanSupplier?: ElementRef<HTMLInputElement>;
@ViewChild('returnScanAmount') returnScanAmount?: ElementRef<HTMLInputElement>;

  viewMode: 'NONE' | 'SLOT' | 'PENDING' | 'CHEMICAL' = 'NONE';
  panelMode: 'TABLE' | 'STOCK_IN' | 'STOCK_OUT' | 'MOVE_AREA' | 'RETURN_STOCK_IN' = 'TABLE';

  stockForm = {
    jobNo: '',
    yearMonth: '',
    recivedDate: '',
    inspector: '',
    unloadBy: '',
    invoiceOne: '',
    taxInvNo: '',

    itemNo: '',
    unitPrice: '',
    qtyOfPalletPack: '',
    coil: '',
    qtyKgsPcs: '',
    unit: '',
    kgsCoil: '',
    odCoil: '',
    remark: '',
    millSheet: '',

    itemName: '',
    specDwg: '',
    lotNo: '',
    quantity: '',
    rosh: '',
    result: '',
    supplier: '',
    amount: '',

    storageArea: '',
    stockNote: '',
    rawScan: ''
  };

  
  //returnStockIn
  returnStockForm = {
      requestJobNo: '',
      itemNo: '',
      itemName: '',
      itemSpec: '',
    
      // scanner fields
      jobNoIncoming: '',
      yearMonth: '',
      recivedDate: '',
      inspector: '',
      unloadBy: '',
      invoiceOne: '',
      taxInvNo: '',
      materialNoScan: '',
      unitPrice: '',
      qtyOfPalletPack: '',
      scannerCoil: '',
      scannerQtyKgsPcs: '',
      unit: '',
      kgsCoil: '',
      odCoil: '',
      remark: '',
      millSheet: '',
      itemNameScan: '',
      specDwg: '',
      lotNo: '',
      quantity: '',
      rosh: '',
      result: '',
      supplier: '',
      amount: '',
    
      // return actual values
      coil: '',
      qtyKgsPcs: '',
    
      storageArea: '',
      stockNote: ''
  };



  moveSearchItemNo = '';
  moveRows: MoveRow[] = [];
  moveDestinationArea = '';
  moveForm = {
    itemNo: '',
    itemName: '',
    itemSpec: ''
  };

  storeMasters: storeMasterRow[] = [];
  isSavingStock = false;
  isMovingArea = false;

  materialSuggestions: string[] = [];
  showMaterialSuggestions = false;

  userId: number | null = null;



  
  stockOutRequestJobNo = '';
  stockOutSearchItemNo = '';
  stockOutRows: StockOutRow[] = [];
  stockOutForm = {
    itemNo: '',
    itemName: '',
    itemSpec: ''
  };

  selectedTransactionJob: {
    id: number;
    jobNo: string;
    materialNo: string;
    materialName: string;
    materialSpec: string;
    incomingId?: number | null;
  } | null = null;

  // isReturnFromTransaction = false;
  // returnJobInfo: TransactionNavJob | null = null;





  // ใช้ข้อมูลจริงจาก API
  pendingItems: MaterialItem[] = [];
  chemicalItems: MaterialItem[] = [];

  // ใช้ API แทน mock
  slots: SlotRow[] = [];

  selectedSlot: SlotRow | null = null;

  get totalSlots() {
    return this.slots.length;
  }

  get occupiedCount() {
    return this.slots.filter(s => s.status === 'OCCUPIED').length;
  }

  get pendingCount() {
    return this.pendingItems.length;
  }


  get chemicalCount() {
    return this.chemicalItems.length;
  }
  

  get rejectedCount() {
    return this.slots.filter(s => s.status === 'REJECTED').length;
  }

  ngOnInit() {
    this.userId = Number(localStorage.getItem('materialStore_userId')) || null;
    this.fetchStoreMaster();
    this.fetchStorageMap();

    this.applyTransactionState();
  }



  private applyTransactionState() {
    const navState = (history.state || {}) as {
      fromTransaction?: boolean;
      mode?: 'STOCK_IN' | 'STOCK_OUT' | 'MOVE_AREA' | 'TABLE' | 'RETURN_STOCK_IN';
      returnMode?: boolean;
      job?: TransactionNavJob;
    };
  
    if (!navState?.fromTransaction || !navState?.job) return;
  
    const job = navState.job;
    this.panelMode = navState.mode || 'STOCK_OUT';
  
    this.selectedTransactionJob = {
      id: Number(job.id || null),
      jobNo: job.jobNo || '',
      materialNo: job.materialNo || '',
      materialName: job.materialName || '',
      materialSpec: job.materialSpec || '',
      incomingId: job.incomingId ?? null
    };
  
    if (this.panelMode === 'RETURN_STOCK_IN') {
      this.returnStockForm = {
        requestJobNo: job.jobNo || '',
        itemNo: job.materialNo || '',
        itemName: job.materialName || '',
        itemSpec: job.materialSpec || '',
    
        jobNoIncoming: '',
        yearMonth: '',
        recivedDate: '',
        inspector: '',
        unloadBy: '',
        invoiceOne: '',
        taxInvNo: '',
        materialNoScan: '',
        unitPrice: '',
        qtyOfPalletPack: '',
        scannerCoil: '',
        scannerQtyKgsPcs: '',
        unit: '',
        kgsCoil: '',
        odCoil: '',
        remark: '',
        millSheet: '',
        itemNameScan: '',
        specDwg: '',
        lotNo: '',
        quantity: '',
        rosh: '',
        result: '',
        supplier: '',
        amount: '',
    
        coil: '',
        qtyKgsPcs: '',
    
        storageArea: '',
        stockNote: job.remark || ''
      };
  
      Swal.fire({
        icon: 'info',
        title: 'Open Return Stock In',
        text: `โหลดข้อมูล Return Job ${job.jobNo || '-'} เรียบร้อยแล้ว`,
        timer: 1200,
        showConfirmButton: false
      });
  
      setTimeout(() => {
        this.focusEl(this.returnScanJobNo);
      }, 0);
  
      return;
    }
  
    if (this.panelMode === 'STOCK_OUT') {
      this.stockOutRequestJobNo = job.jobNo || '';
      this.stockOutSearchItemNo = job.materialNo || '';
      this.stockOutForm = {
        itemNo: job.materialNo || '',
        itemName: job.materialName || '',
        itemSpec: job.materialSpec || ''
      };
  
      this.stockOutRows = [];
  
      Swal.fire({
        icon: 'info',
        title: 'Open Stock Out',
        text: `โหลดข้อมูล Job ${job.jobNo || '-'} เรียบร้อยแล้ว`,
        timer: 1200,
        showConfirmButton: false
      });

       // ✅ รอให้ fetchStorageMap โหลดข้อมูล slots มาก่อนค่อย search
      setTimeout(() => this.searchStockOutItem(), 250);
    }
  }

  


  searchStockOutItem() {
    const key = (this.stockOutSearchItemNo || '').trim().toLowerCase();
  
    this.stockOutRows = [];
    this.stockOutForm = {
      itemNo: '',
      itemName: '',
      itemSpec: ''
    };
  
    if (!key) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Material No',
        text: 'กรุณากรอก Material No'
      });
      return;
    }
  
    const rows: StockOutRow[] = [];
  
    this.slots.forEach((slot) => {
      (slot.materials || []).forEach((m, index) => {
        const materialNo = (m.materialNo || m.itemNo || '').trim().toLowerCase();
  
        if (materialNo === key) {
          rows.push({
            uid: `${slot.storeCode}_${m.incomingId || index}_${m.invNo}`,
            checked: false,
            area: slot.storeCode,
            receivedDate: m.receivedAt || '',
            jobNo: m.jobNo || '',
            invoice: m.invNo || '',
            qty: Number(m.qty || 0),
            remark: m.remark || '',
  
            itemNo: m.materialNo || m.itemNo || '',
            itemName: m.itemName || m.description || '',
            itemSpec: m.itemSpec || '',
            coil: m.coil != null ? Number(m.coil) : undefined,
            unit: m.uom || '',
  
            incomingId: Number(m.incomingId || 0),
            storeId: Number(slot.storeId || m.storeId || 0),
            sourceStoreCode: slot.storeCode,
            stockNote: m.stockNote || ''
          });
        }
      });
    });




    this.pendingItems.forEach((m, index) => {
      const materialNo = (m.materialNo || m.itemNo || '').trim().toLowerCase();
  
      if (materialNo === key) {
        rows.push({
          uid: `Pending_${m.incomingId || index}_${m.invNo}`,
          checked: false,
          area: 'Pending',
          receivedDate: m.receivedAt || '',
          jobNo: m.jobNo || '',
          invoice: m.invNo || '',
          qty: Number(m.qty || 0),
          remark: m.remark || '',
  
          itemNo: m.materialNo || m.itemNo || '',
          itemName: m.itemName || m.description || '',
          itemSpec: m.itemSpec || '',
          coil: m.coil != null ? Number(m.coil) : undefined,
          unit: m.uom || '',
  
          incomingId: Number(m.incomingId || 0),
          storeId: Number(m.storeId || 0),
          sourceStoreCode: 'Pending',
          stockNote: m.stockNote || ''
        });
      }
    });
  



    this.chemicalItems.forEach((m, index) => {
      const materialNo = (m.materialNo || m.itemNo || '').trim().toLowerCase();
  
      if (materialNo === key) {
        rows.push({
          uid: `Chemical_${m.incomingId || index}_${m.invNo}`,
          checked: false,
          area: 'Chemical',
          receivedDate: m.receivedAt || '',
          jobNo: m.jobNo || '',
          invoice: m.invNo || '',
          qty: Number(m.qty || 0),
          remark: m.remark || '',
  
          itemNo: m.materialNo || m.itemNo || '',
          itemName: m.itemName || m.description || '',
          itemSpec: m.itemSpec || '',
          coil: m.coil != null ? Number(m.coil) : undefined,
          unit: m.uom || '',
  
          incomingId: Number(m.incomingId || 0),
          storeId: Number(m.storeId || 0),
          sourceStoreCode: 'Chemical',
          stockNote: m.stockNote || ''
        });
      }
    });


  
    this.stockOutRows = rows;
  
    if (rows.length) {
      this.stockOutForm = {
        itemNo: this.selectedTransactionJob?.materialNo || rows[0].itemNo,
        itemName: this.selectedTransactionJob?.materialName || rows[0].itemName,
        itemSpec: this.selectedTransactionJob?.materialSpec || rows[0].itemSpec
      };
      return;
    }
  
    Swal.fire({
      icon: 'info',
      title: 'No item found',
      text: `ไม่พบ Material No : ${this.stockOutSearchItemNo}`
    });
  }


  isAllStockOutChecked(): boolean {
    return this.stockOutRows.length > 0 && this.stockOutRows.every(row => row.checked);
  }


  get selectedStockOutRow(): StockOutRow | null {
    return this.stockOutRows.find(r => r.checked) || null;
  }
  
  isStockOutRowDisabled(row: StockOutRow): boolean {
    const selected = this.selectedStockOutRow;
    return !!selected && selected.uid !== row.uid;
  }
  
  onSelectSingleStockOut(row: StockOutRow, ev: Event) {
    const checked = (ev.target as HTMLInputElement)?.checked === true;
  
    this.stockOutRows = this.stockOutRows.map(r => {
      if (r.uid === row.uid) {
        return { ...r, checked };
      }
      return { ...r, checked: false };
    });
  }



  slotsBy(zone: SlotRow['zone'], row: SlotRow['row']) {
    return this.slots.filter(s => s.zone === zone && s.row === row);
  }

  trackSlot(index: number, s: SlotRow) {
    return s.storeCode;
  }

  private focusEl(ref?: ElementRef<HTMLInputElement>) {
    setTimeout(() => {
      const el = ref?.nativeElement;
      if (!el) return;
      el.focus();
      el.select();
    }, 0);
  }

  focusScanFirst() {
    if (this.panelMode !== 'STOCK_IN') return;
    this.focusEl(this.scanJobNo);
  }

  onStockScanEnter(field: StockScanField, ev: any) {
    if (ev?.key === 'Enter') ev.preventDefault();

    if (this.panelMode !== 'STOCK_IN') return;

    switch (field) {
      case 'jobNo':
        if (!this.stockForm.jobNo) return;
        return this.focusEl(this.scanYearMonth);

      case 'yearMonth':
        if (!this.stockForm.yearMonth) return;
        return this.focusEl(this.scanRecivedDate);

      case 'recivedDate':
        if (!this.stockForm.recivedDate) return;
        return this.focusEl(this.scanInspector);

      case 'inspector':
        if (!this.stockForm.inspector) return;
        return this.focusEl(this.scanUnloadBy);

      case 'unloadBy':
        if (!this.stockForm.unloadBy) return;
        return this.focusEl(this.scanInvoiceOne);

      case 'invoiceOne':
        if (!this.stockForm.invoiceOne) return;
        return this.focusEl(this.scanTaxInvNo);

      case 'taxInvNo':
        if (!this.stockForm.taxInvNo) return;
        return this.focusEl(this.scanItemNo);

      case 'itemNo':
        if (!this.stockForm.itemNo) return;
        return this.focusEl(this.scanUnitPrice);

      case 'unitPrice':
        if (!this.stockForm.unitPrice) return;
        return this.focusEl(this.scanQtyOfPalletPack);

      case 'qtyOfPalletPack':
        if (!this.stockForm.qtyOfPalletPack) return;
        return this.focusEl(this.scanCoil);

      case 'coil':
        if (!this.stockForm.coil) return;
        return this.focusEl(this.scanQtyKgsPcs);

      case 'qtyKgsPcs':
        if (!this.stockForm.qtyKgsPcs) return;
        return this.focusEl(this.scanUnit);

      case 'unit':
        if (!this.stockForm.unit) return;
        return this.focusEl(this.scanKgsCoil);

      case 'kgsCoil':
        if (!this.stockForm.kgsCoil) return;
        return this.focusEl(this.scanOdCoil);

      case 'odCoil':
        if (!this.stockForm.odCoil) return;
        return this.focusEl(this.scanRemark);

      case 'remark':
        if (!this.stockForm.remark) return;
        return this.focusEl(this.scanMillSheet);

      case 'millSheet':
        if (!this.stockForm.millSheet) return;
        return this.focusEl(this.scanItemName);

      case 'itemName':
        if (!this.stockForm.itemName) return;
        return this.focusEl(this.scanSpecDwg);

      case 'specDwg':
        if (!this.stockForm.specDwg) return;
        return this.focusEl(this.scanLotNo);

      case 'lotNo':
        if (!this.stockForm.lotNo) return;
        return this.focusEl(this.scanQuantity);

      case 'quantity':
        if (!this.stockForm.quantity) return;
        return this.focusEl(this.scanRosh);

      case 'rosh':
        if (!this.stockForm.rosh) return;
        return this.focusEl(this.scanResult);

      case 'result':
        if (!this.stockForm.result) return;
        return this.focusEl(this.scanSupplier);

      case 'supplier':
        if (!this.stockForm.supplier) return;
        return this.focusEl(this.scanAmount);

      case 'amount':
        if (!this.stockForm.amount) return;
        return;
    }
  }


  onReturnStockEnter(field: ReturnStockField, ev: any) {
    if (ev?.key === 'Enter') ev.preventDefault();
    if (this.panelMode !== 'RETURN_STOCK_IN') return;
  
    switch (field) {
      case 'jobNoIncoming':
        if (!this.returnStockForm.jobNoIncoming) return;
        return this.focusEl(this.returnScanYearMonth);
  
      case 'yearMonth':
        if (!this.returnStockForm.yearMonth) return;
        return this.focusEl(this.returnScanRecivedDate);
  
      case 'recivedDate':
        if (!this.returnStockForm.recivedDate) return;
        return this.focusEl(this.returnScanInspector);
  
      case 'inspector':
        if (!this.returnStockForm.inspector) return;
        return this.focusEl(this.returnScanUnloadBy);
  
      case 'unloadBy':
        if (!this.returnStockForm.unloadBy) return;
        return this.focusEl(this.returnScanInvoiceOne);
  
      case 'invoiceOne':
        if (!this.returnStockForm.invoiceOne) return;
        return this.focusEl(this.returnScanTaxInvNo);
  
      case 'taxInvNo':
        if (!this.returnStockForm.taxInvNo) return;
        return this.focusEl(this.returnScanItemNo);
  
      case 'materialNoScan':
        if (!this.returnStockForm.materialNoScan) return;
        return this.focusEl(this.returnScanUnitPrice);
  
      case 'unitPrice':
        if (!this.returnStockForm.unitPrice) return;
        return this.focusEl(this.returnScanQtyOfPalletPack);
  
      case 'qtyOfPalletPack':
        if (!this.returnStockForm.qtyOfPalletPack) return;
        return this.focusEl(this.returnScanScannerCoil);
  
      case 'scannerCoil':
        if (!this.returnStockForm.scannerCoil) return;
        return this.focusEl(this.returnScanScannerQtyKgsPcs);
  
      case 'scannerQtyKgsPcs':
        if (!this.returnStockForm.scannerQtyKgsPcs) return;
        return this.focusEl(this.returnScanUnit);
  
      case 'unit':
        if (!this.returnStockForm.unit) return;
        return this.focusEl(this.returnScanKgsCoil);
  
      case 'kgsCoil':
        if (!this.returnStockForm.kgsCoil) return;
        return this.focusEl(this.returnScanOdCoil);
  
      case 'odCoil':
        if (!this.returnStockForm.odCoil) return;
        return this.focusEl(this.returnScanRemark);
  
      case 'remark':
        if (!this.returnStockForm.remark) return;
        return this.focusEl(this.returnScanMillSheet);
  
      case 'millSheet':
        if (!this.returnStockForm.millSheet) return;
        return this.focusEl(this.returnScanItemName);
  
      case 'itemNameScan':
        if (!this.returnStockForm.itemNameScan) return;
        return this.focusEl(this.returnScanSpecDwg);
  
      case 'specDwg':
        if (!this.returnStockForm.specDwg) return;
        return this.focusEl(this.returnScanLotNo);
  
      case 'lotNo':
        if (!this.returnStockForm.lotNo) return;
        return this.focusEl(this.returnScanQuantity);
  
      case 'quantity':
        if (!this.returnStockForm.quantity) return;
        return this.focusEl(this.returnScanRosh);
  
      case 'rosh':
        if (!this.returnStockForm.rosh) return;
        return this.focusEl(this.returnScanResult);
  
      case 'result':
        if (!this.returnStockForm.result) return;
        return this.focusEl(this.returnScanSupplier);
  
      case 'supplier':
        if (!this.returnStockForm.supplier) return;
        return this.focusEl(this.returnScanAmount);
  
      case 'amount':
        if (!this.returnStockForm.amount) return;
        return this.focusEl(this.returnActualCoil);
  
      case 'coil':
        if (!this.returnStockForm.coil) return;
        return this.focusEl(this.returnActualQtyKgsPcs);
  
      case 'qtyKgsPcs':
        if (!this.returnStockForm.qtyKgsPcs) return;
        return;
    }
  }




  setPanelMode(mode: 'TABLE' | 'STOCK_IN' | 'STOCK_OUT' | 'MOVE_AREA' | 'RETURN_STOCK_IN') {
    this.panelMode = mode;
  
    // ใช้กับ stock in เดิมเท่านั้น
    if (this.viewMode === 'PENDING') {
      this.stockForm.storageArea = 'Pending';
    } else {
      this.stockForm.storageArea = this.selectedSlot?.storeCode || '';
    }
  
    // reset move area state
    if (mode !== 'MOVE_AREA') {
      this.moveRows = [];
      this.moveSearchItemNo = '';
      this.moveDestinationArea = '';
      this.moveForm = {
        itemNo: '',
        itemName: '',
        itemSpec: ''
      };
    } else {
      if (this.viewMode === 'PENDING') {
        this.moveDestinationArea = 'Pending';
      } else {
        this.moveDestinationArea = this.selectedSlot?.storeCode || '';
      }
    }
  
    // reset stock out state เมื่อไม่ได้อยู่โหมดนี้
    if (mode !== 'STOCK_OUT') {
      this.stockOutRequestJobNo = '';
      this.stockOutSearchItemNo = '';
      this.stockOutRows = [];
      this.stockOutForm = {
        itemNo: '',
        itemName: '',
        itemSpec: ''
      };
    }
  
    // reset return stock in state เมื่อไม่ได้อยู่โหมดนี้
    if (mode !== 'RETURN_STOCK_IN') {
      this.returnStockForm = {
        requestJobNo: '',
        itemNo: '',
        itemName: '',
        itemSpec: '',
    
        jobNoIncoming: '',
        yearMonth: '',
        recivedDate: '',
        inspector: '',
        unloadBy: '',
        invoiceOne: '',
        taxInvNo: '',
        materialNoScan: '',
        unitPrice: '',
        qtyOfPalletPack: '',
        scannerCoil: '',
        scannerQtyKgsPcs: '',
        unit: '',
        kgsCoil: '',
        odCoil: '',
        remark: '',
        millSheet: '',
        itemNameScan: '',
        specDwg: '',
        lotNo: '',
        quantity: '',
        rosh: '',
        result: '',
        supplier: '',
        amount: '',
    
        coil: '',
        qtyKgsPcs: '',
    
        storageArea: '',
        stockNote: ''
      };
    }
  
    // selectedTransactionJob ให้ล้างเมื่อไม่ใช่ flow transaction
    if (mode !== 'STOCK_OUT' && mode !== 'RETURN_STOCK_IN') {
      this.selectedTransactionJob = null;
    }
  
    if (mode === 'STOCK_IN') {
      setTimeout(() => this.focusScanFirst(), 0);
    }
  
    if (mode === 'RETURN_STOCK_IN') {
      setTimeout(() => this.focusEl(this.returnScanJobNo), 0);
    }
  }






  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }


  private normalizeScanValue(v: any): string {
    return (v || '').toString().trim().toUpperCase();
  }


  confirmStockAction() {
    if (this.panelMode !== 'STOCK_IN') return;

    const requiredFields = [
      { key: 'jobNo', label: 'Job No.' },
      { key: 'itemNo', label: 'Material No' },
      { key: 'coil', label: 'Coil' },
      { key: 'qtyKgsPcs', label: 'Qty Kgs/Pcs' },
      { key: 'unit', label: 'Unit' },
      { key: 'itemName', label: 'Item Name' },
      { key: 'specDwg', label: 'Spec/Dwg' },
      { key: 'lotNo', label: 'Lot No.' },
      { key: 'storageArea', label: 'Storage Area' }
    ];

    const missing = requiredFields
      .filter(f => !(this.stockForm as any)[f.key]?.toString().trim())
      .map(f => f.label);

    if (missing.length) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลยังไม่ครบ',
        html: `
          <div style="text-align:left">
            กรุณาตรวจสอบข้อมูลต่อไปนี้:<br><br>
            <b>${missing.join('<br>')}</b>
          </div>
        `
      });
      return;
    }

    const payload = JSON.parse(JSON.stringify(this.stockForm));

    const orderedPayload = {
      jobNo: payload.jobNo,
      yearMonth: payload.yearMonth,
      recivedDate: payload.recivedDate,
      inspector: payload.inspector,
      unloadBy: payload.unloadBy,
      invoiceOne: payload.invoiceOne,
      taxInvNo: payload.taxInvNo,

      itemNo: payload.itemNo,
      unitPrice: payload.unitPrice,
      qtyOfPalletPack: payload.qtyOfPalletPack,
      coil: payload.coil,
      qtyKgsPcs: payload.qtyKgsPcs,
      unit: payload.unit,
      kgsCoil: payload.kgsCoil,
      odCoil: payload.odCoil,
      remark: payload.remark,
      millSheet: payload.millSheet,

      itemName: payload.itemName,
      specDwg: payload.specDwg,
      lotNo: payload.lotNo,
      quantity: payload.quantity,
      rosh: payload.rosh,
      result: payload.result,
      supplier: payload.supplier,
      amount: payload.amount,

      storageArea: payload.storageArea,
      stockNote: payload.stockNote,
      rawScan: payload.rawScan
    };

    if (this.panelMode === 'STOCK_IN') {
      Swal.fire({
        title: 'Confirm Stock In Data',
        html: `
          <div style="text-align:left; max-height: 420px; overflow:auto;">
            <pre style="
              margin:0;
              white-space:pre-wrap;
              word-break:break-word;
              font-size:13px;
              line-height:1.45;
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              padding:12px;
              color:#0f172a;
            ">${this.escapeHtml(JSON.stringify(orderedPayload, null, 2))}</pre>
          </div>
        `,
        width: '720px',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      }).then((result) => {
        if (!result.isConfirmed) return;
        this.submitStockIn();
      });

      return;
    } else if (this.panelMode === 'STOCK_OUT') {
      console.log('CONFIRM STOCK OUT DATA = ', payload);
    } else {
      console.log('CONFIRM STOCK ACTION DATA = ', payload);
    }

    Swal.fire({
      icon: 'success',
      title: 'Check complete',
      text: 'ข้อมูลครบแล้ว ดูผลลัพธ์ใน console ได้เลย'
    });
  }

  resetStockForm() {
    this.stockForm = {
      jobNo: '',
      yearMonth: '',
      recivedDate: '',
      inspector: '',
      unloadBy: '',
      invoiceOne: '',
      taxInvNo: '',

      itemNo: '',
      unitPrice: '',
      qtyOfPalletPack: '',
      coil: '',
      qtyKgsPcs: '',
      unit: '',
      kgsCoil: '',
      odCoil: '',
      remark: '',
      millSheet: '',

      itemName: '',
      specDwg: '',
      lotNo: '',
      quantity: '',
      rosh: '',
      result: '',
      supplier: '',
      amount: '',

      storageArea: '',
      stockNote: '',
      rawScan: ''
    };

    this.selectedSlot = null;
    this.viewMode = 'NONE';

    setTimeout(() => this.focusScanFirst(), 0);
  }

  slotClass(s: SlotRow) {
    return {
      'slot-card': true,
      'st-occupied': s.status === 'OCCUPIED',
      'st-partial': s.status === 'PARTIAL',
      'st-empty': s.status === 'EMPTY',
      'st-rejected': s.status === 'REJECTED',
      'is-selected': this.selectedSlot?.storeCode === s.storeCode && this.viewMode === 'SLOT',
      'is-move-highlight': this.isMoveHighlighted(s.storeCode)
    };
  }

  isMoveHighlighted(slotId: string): boolean {
    return this.panelMode === 'MOVE_AREA' &&
      this.moveRows.some(r => r.sourceStoreCode === slotId);
  }

  onMoveMaterialInput() {
    const key = (this.moveSearchItemNo || '').trim().toLowerCase();

    if (!key) {
      this.materialSuggestions = [];
      this.showMaterialSuggestions = false;
      return;
    }

    const allMaterialNos = [
      ...this.slots.flatMap(slot => (slot.materials || []).map(m => (m.materialNo || m.itemNo || '').trim())),
      ...this.pendingItems.map(m => (m.materialNo || m.itemNo || '').trim())
    ].filter(Boolean);

    const uniqueMaterialNos = Array.from(new Set(allMaterialNos));

    this.materialSuggestions = uniqueMaterialNos
      .filter(x => x.toLowerCase().includes(key))
      .slice(0, 8);

    this.showMaterialSuggestions = this.materialSuggestions.length > 0;
  }

  selectMaterialSuggestion(materialNo: string) {
    this.moveSearchItemNo = materialNo;
    this.showMaterialSuggestions = false;
    this.materialSuggestions = [];
    this.searchMoveItem();
  }

  hideMaterialSuggestions() {
    setTimeout(() => {
      this.showMaterialSuggestions = false;
    }, 150);
  }

  onClickSlot(s: SlotRow) {
    this.viewMode = 'SLOT';
    this.selectedSlot = s;

    this.stockForm.storageArea = s.storeCode;
    this.returnStockForm.storageArea = s.storeCode;

    switch (this.panelMode) {
      case 'MOVE_AREA':
        this.moveDestinationArea = s.storeCode;
        return;

      case 'STOCK_IN':
      case 'STOCK_OUT':
        setTimeout(() => this.focusScanFirst(), 0);
        return;


      case 'RETURN_STOCK_IN':
        setTimeout(() => this.focusEl(this.returnScanJobNo), 0);
      return;
      

      case 'TABLE':
      default:
        return;
    }
  }

  onClickPendingArea() {
    this.viewMode = 'PENDING';
    this.selectedSlot = null;

    this.stockForm.storageArea = 'Pending';
    this.returnStockForm.storageArea = 'Pending';

    if (this.panelMode === 'MOVE_AREA') {
      this.moveDestinationArea = 'Pending';
      return;
    }

    if (this.panelMode === 'STOCK_IN' || this.panelMode === 'STOCK_OUT') {
      setTimeout(() => this.focusScanFirst(), 0);
    }

    if (this.panelMode === 'RETURN_STOCK_IN') {
      setTimeout(() => this.focusEl(this.returnScanJobNo), 0);
    }


  }


  onClickChemicalArea() {
    this.viewMode = 'CHEMICAL';
    this.selectedSlot = null;

    this.stockForm.storageArea = 'Chemical';
    this.returnStockForm.storageArea = 'Chemical';
  
    if (this.panelMode === 'MOVE_AREA') {
      this.moveDestinationArea = 'Chemical';
      return;
    }
  
    if (this.panelMode === 'STOCK_IN' || this.panelMode === 'STOCK_OUT') {
      setTimeout(() => this.focusScanFirst(), 0);
    }

    if (this.panelMode === 'RETURN_STOCK_IN') {
      setTimeout(() => this.focusEl(this.returnScanJobNo), 0);
    }

  }




  onChangeMoveDestinationArea() {
    const area = (this.moveDestinationArea || '').trim();

    if (!area) {
      this.selectedSlot = null;
      if (this.viewMode === 'SLOT') {
        this.viewMode = 'NONE';
      }
      return;
    }

    if (area === 'Pending') {
      this.viewMode = 'PENDING';
      this.selectedSlot = null;
      this.stockForm.storageArea = 'Pending';
      return;
    }


    if (area === 'Chemical') {
      this.viewMode = 'CHEMICAL';
      this.selectedSlot = null;
      this.stockForm.storageArea = 'Chemical';
      return;
    }


    const slot = this.slots.find(s => s.storeCode === area);

    if (slot) {
      this.selectedSlot = slot;
      this.viewMode = 'SLOT';
      this.stockForm.storageArea = slot.storeCode;
    }
  }

  openMaterialDetailSwal(item: MaterialItem) {
    Swal.fire({
      title: 'Material Detail',
      icon: 'info',
      html: `
        <div style="text-align:left; line-height:1.8;">
          <div><b>Material No:</b> ${item.itemNo || item.materialNo || '-'}</div>
          <div><b>Material Name:</b> ${item.itemName || item.description || '-'}</div>
          <div><b>D/O NO:</b> ${item.invNo || '-'}</div>
          <div><b>ReceivedDate:</b> ${item.receivedAt || '-'}</div>
           <div><b>Remark:</b> ${item.stockNote || '-'}</div>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#2563eb'
    });
  }



  openRemarkSwal(remark?: string) {
    const text = (remark || '').toString().trim();
  
    Swal.fire({
      title: 'Remark',
      icon: 'info',
      html: `
        <div style="
          text-align:left;
          line-height:1.8;
          white-space:pre-wrap;
          word-break:break-word;
          max-height:320px;
          overflow:auto;
          padding:4px 2px;
        ">
          ${this.escapeHtml(text || '-')}
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#2563eb'
    });
  }

  // ใช้ในโหมด Move Area
  searchMoveItem() {
    const key = (this.moveSearchItemNo || '').trim().toLowerCase();

    this.showMaterialSuggestions = false;
    this.materialSuggestions = [];
    this.moveRows = [];
    this.moveDestinationArea = '';
    this.moveForm = {
      itemNo: '',
      itemName: '',
      itemSpec: ''
    };

    if (!key) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Material No',
        text: 'กรุณากรอก Material No'
      });
      return;
    }

    const rows: MoveRow[] = [];

    this.slots.forEach(slot => {
      (slot.materials || []).forEach((m, index) => {
        const materialNo = (m.materialNo || m.itemNo || '').trim().toLowerCase();

        if (materialNo === key) {
          rows.push({
            uid: `${slot.storeCode}_${m.incomingId || index}_${m.invNo}`,
            checked: false,
            area: slot.storeCode,
            receivedDate: m.receivedAt || '',
            invoice: m.invNo || '',
            qty: Number(m.qty || 0),
            remark: m.remark || '',
            toArea: '',

            itemNo: m.materialNo || m.itemNo || '',
            itemName: m.itemName  || '',
            itemSpec: m.itemSpec || '',
            coil: m.coil != null ? Number(m.coil) : undefined,
            unit: m.uom || '',

            sourceStoreCode: slot.storeCode,
            sourceInvNo: m.invNo || '',

            jobNo: m.jobNo || '',
            incomingId: Number(m.incomingId || 0),
            storeId: Number(slot.storeId || m.storeId || 0),
            stockNote: m.stockNote || ''
          });
        }
      });
    });

    this.pendingItems.forEach((m, index) => {
      const materialNo = (m.materialNo || m.itemNo || '').trim().toLowerCase();

      if (materialNo === key) {
        rows.push({
          uid: `Pending_${m.incomingId || index}_${m.invNo}`,
          checked: false,
          area: 'Pending',
          receivedDate: m.receivedAt || '',
          invoice: m.invNo || '',
          qty: Number(m.qty || 0),
          remark: m.remark || '',
          toArea: '',

          itemNo: m.materialNo || m.itemNo || '',
          itemName: m.itemName || m.description || '',
          itemSpec: m.itemSpec || '',
          coil: m.coil != null ? Number(m.coil) : undefined,
          unit: m.uom || '',

          sourceStoreCode: 'Pending',
          sourceInvNo: m.invNo || '',

          jobNo: m.jobNo || '',
          incomingId: Number(m.incomingId || 0),
          storeId: Number(m.storeId || 0),
          stockNote: m.stockNote || ''
        });
      }
    });



    this.chemicalItems.forEach((m, index) => {
      const materialNo = (m.materialNo || m.itemNo || '').trim().toLowerCase();
  
      if (materialNo === key) {
        rows.push({
          uid: `Chemical_${m.incomingId || index}_${m.invNo}`,
          checked: false,
          area: 'Chemical',
          receivedDate: m.receivedAt || '',
          invoice: m.invNo || '',
          qty: Number(m.qty || 0),
          remark: m.remark || '',
          toArea: '',
  
          itemNo: m.materialNo || m.itemNo || '',
          itemName: m.itemName || m.description || '',
          itemSpec: m.itemSpec || '',
          coil: m.coil != null ? Number(m.coil) : undefined,
          unit: m.uom || '',
  
          sourceStoreCode: 'Chemical',
          sourceInvNo: m.invNo || '',
  
          jobNo: m.jobNo || '',
          incomingId: Number(m.incomingId || 0),
          storeId: Number(m.storeId || 0),
          stockNote: m.stockNote || ''
        });
      }
    });



    this.moveRows = rows;

    if (rows.length) {
      this.moveForm = {
        itemNo: rows[0].itemNo,
        itemName: rows[0].itemName,
        itemSpec: rows[0].itemSpec
      };
      return;
    }

    Swal.fire({
      icon: 'info',
      title: 'No item found',
      text: `ไม่พบ Material No : ${this.moveSearchItemNo}`
    });
  }

  // ใช้ในโหมด Move Area
  confirmMoveArea() {
    if (this.isMovingArea) return;

    const selected = this.moveRows.filter(r => r.checked);

    if (!selected.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No selection',
        text: 'กรุณาเลือกรายการที่ต้องการย้าย'
      });
      return;
    }

    if (!this.moveDestinationArea || this.moveDestinationArea.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Missing destination area',
        text: 'กรุณาเลือก Area ปลายทาง'
      });
      return;
    }

    const sameAreaRows = selected.filter(r => r.sourceStoreCode === this.moveDestinationArea);
    if (sameAreaRows.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid destination',
        text: 'Area ปลายทางต้องไม่ใช่ area เดิมของรายการที่เลือก'
      });
      return;
    }

    const html = `
      <div style="text-align:left; max-height:360px; overflow:auto;">
        <div style="margin-bottom:12px;">
          <b>Destination Area:</b> ${this.moveDestinationArea}
        </div>
        ${selected.map((r, i) => `
          <div style="padding:10px 0; border-bottom:1px solid #e2e8f0;">
            <div><b>${i + 1}. Material:</b> ${r.itemNo}</div>
            <div><b>From:</b> ${r.sourceStoreCode}</div>
            <div><b>To:</b> ${this.moveDestinationArea}</div>
            <div><b>Qty:</b> ${r.qty}</div>
            <div><b>Invoice:</b> ${r.invoice || '-'}</div>
          </div>
        `).join('')}
      </div>
    `;

    Swal.fire({
      icon: 'question',
      title: 'Confirm Move Area',
      html,
      width: '720px',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.isMovingArea = true;

      const requests = selected.map(row => {
        const body = {
          incomingId: row.incomingId,
          storeId: row.storeId,
          userId: this.userId,
          storeCodeDestination: this.moveDestinationArea,
          stockNote: row.stockNote ||  ''
        };

        return this.http.post(config.apiServer + '/api/mc/moveArea', body).toPromise();
      });

      Promise.all(requests)
        .then(() => {
          this.isMovingArea = false;

          Swal.fire({
            icon: 'success',
            title: 'Move completed',
            text: 'ย้าย Area เรียบร้อยแล้ว'
          }).then(() => {
            this.moveSearchItemNo = '';
            this.moveRows = [];
            this.moveDestinationArea = '';
            this.moveForm = {
              itemNo: '',
              itemName: '',
              itemSpec: ''
            };
            this.fetchStorageMap();
          });
        })
        .catch((err) => {
          this.isMovingArea = false;

          Swal.fire({
            icon: 'error',
            title: 'Move Area Fail',
            text: err?.error?.message || err?.message || 'ย้าย Area ไม่สำเร็จ'
          });
        });
    });
  }

  // pending area ยังเป็น mock อยู่ ใช้ย้ายของจาก pending เข้า slot ชั่วคราว
  // assignPendingToSlot(p: MaterialItem, slot: SlotRow) {
  //   if (!slot) return;

  //   if (slot.status === 'REJECTED') {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Slot rejected',
  //       text: 'ช่องนี้ถูก Reject ไม่สามารถจัดเก็บได้'
  //     });
  //     return;
  //   }

  //   this.pendingItems = this.pendingItems.filter(x => x !== p);

  //   slot.materials = [...(slot.materials || []), { ...p }];
  //   slot.usedQty = (slot.usedQty || 0) + p.qty;
  //   slot.status = slot.usedQty > 0 ? 'OCCUPIED' : 'EMPTY';

  //   this.selectedSlot = slot;
  //   this.viewMode = 'SLOT';

  //   if (this.panelMode !== 'TABLE' && this.panelMode !== 'MOVE_AREA') {
  //     this.stockForm.storageArea = slot.storeCode;
  //   }

  //   Swal.fire({
  //     icon: 'success',
  //     title: 'Stored',
  //     text: `จัดเก็บ ${p.matCode} เข้าช่อง ${slot.storeCode} แล้ว`,
  //     timer: 900,
  //     showConfirmButton: false
  //   });
  // }

  // pending area ยังเป็น mock อยู่
  openQuickStoreSwal(p: MaterialItem) {
  //   const empty = this.slots.find(s => s.status === 'EMPTY');
  //   if (!empty) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'No empty slot',
  //       text: 'ไม่มีช่องว่างในระบบตอนนี้'
  //     });
  //     return;
  //   }

  //   Swal.fire({
  //     title: 'Store material',
  //     icon: 'question',
  //     html: `<div style="text-align:left">
  //       <div><b>Material:</b> ${p.matCode}</div>
  //       <div><b>Qty:</b> ${p.qty} ${p.uom}</div>
  //       <div><b>Suggested Slot:</b> ${empty.storeCode}</div>
  //       <div style="color:#64748b; font-size:12px; margin-top:8px;">กด Confirm เพื่อย้ายจาก Pending → Slot</div>
  //     </div>`,
  //     showCancelButton: true,
  //     confirmButtonText: 'Confirm',
  //     cancelButtonText: 'Cancel',
  //     confirmButtonColor: '#2563eb',
  //   }).then(r => {
  //     if (!r.isConfirmed) return;
  //     this.assignPendingToSlot(p, empty);
  //   });
  }

  // โหลด dropdown storage area
  fetchStoreMaster() {
    this.http.get(config.apiServer + '/api/storeMaster/list').subscribe({
      next: (res: any) => {
        this.storeMasters = (res.results || []).map((r: any) => ({
          id: r.id,
          name: r.name,
        }));
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.message || err?.message || 'Load store master fail',
          icon: 'error',
        });
      },
    });
  }

  // โหลด layout + material จาก API จริง
  fetchStorageMap() {
    this.http.get(config.apiServer + '/api/mc/fetchIncomingAll').subscribe({
      next: (res: any) => {
        const rows = res?.results || [];
  
        const normalSlots: SlotRow[] = [];
        const pendingMaterials: MaterialItem[] = [];
        const chemicalMaterials: MaterialItem[] = [];
  
        rows.forEach((r: any) => {
          const zone = String(r.zone || '').toUpperCase();
          const row = String(r.row || '').toUpperCase();
          const storeCode = String(r.storeCode || r.name || '').trim();
  
          const materials = (r.materials || []).map((m: any) => ({
            incomingId: Number(m.incomingId || m.id || 0),
            storeId: Number(r.storeId || r.id || 0),
  
            jobNo: m.jobNo || '',
            materialNo: m.materialNo || m.matCode || '',
            description: m.description || '',
            qty: Number(m.qtyKgsPcs || m.qty || 0),
            uom: m.unit || m.uom || '',
            invNo: m.invoiceOne || m.invNo || '',
            receivedAt: m.recivedDate || m.receivedAt || '',
            fifoRank: Number(m.fifoRank || 0),
            coil: m.coil != null ? Number(m.coil) : undefined,
            itemNo: m.materialNo || m.itemNo || '',
            itemName: m.itemName || '',
            itemSpec: m.itemSpec || '',
            remark: m.remark || '',
            stockNote: m.stockNote || '',
  
            timestmp: m.timeStmp || '',
            userId: Number(m.userId || 0),
            userName: m.userName || '',
            userEmpNo: m.userEmpNo || ''
          }));
  
          const isPending =
            storeCode.toUpperCase() === 'PENDING' ||
            zone === 'PENDING' ||
            row === 'PENDING';
  
          const isChemical =
            storeCode.toUpperCase() === 'CHEMICAL' ||
            zone === 'CHEMICAL' ||
            row === 'CHEMICAL';
  
          if (isPending) {
            pendingMaterials.push(...materials);
            return;
          }
  
          if (isChemical) {
            chemicalMaterials.push(...materials);
            return;
          }
  
          normalSlots.push({
            storeId: Number(r.storeId || r.id || 0),
            storeCode,
            zone: zone as 'A' | 'B' | 'C' | 'D',
            row: row as 'TOP' | 'BTM',
            status: this.normalizeSlotStatus(r.status),
            usedQty: Number(r.usedQty || 0),
            materials
          });
        });
  
        this.slots = normalSlots;
        this.pendingItems = pendingMaterials;
        this.chemicalItems = chemicalMaterials;
  
        if (this.viewMode === 'PENDING') {
          this.stockForm.storageArea = 'Pending';
          this.selectedSlot = null;
        } else if (this.viewMode === 'CHEMICAL') {
          this.stockForm.storageArea = 'Chemical';
          this.selectedSlot = null;
        } else if (this.selectedSlot?.storeCode) {
          const freshSelected = this.slots.find(
            s => s.storeCode === this.selectedSlot?.storeCode
          );
  
          this.selectedSlot = freshSelected || null;
  
          if (freshSelected) {
            this.stockForm.storageArea = freshSelected.storeCode;
          } else if (this.viewMode === 'SLOT') {
            this.viewMode = 'NONE';
            this.stockForm.storageArea = '';
          }
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err?.error?.message || err?.message || 'Load storage map fail',
          icon: 'error',
        });
      }
    });
  }

  private normalizeSlotStatus(status: any): SlotStatus {
    const value = String(status || '').toUpperCase();

    if (value === 'OCCUPIED') return 'OCCUPIED';
    if (value === 'PARTIAL') return 'PARTIAL';
    if (value === 'REJECTED') return 'REJECTED';
    return 'EMPTY';
  }


  onChangeStorageArea() {
    const area =
      this.panelMode === 'RETURN_STOCK_IN'
        ? (this.returnStockForm.storageArea || '').trim()
        : (this.stockForm.storageArea || '').trim();
  
    if (!area) {
      this.selectedSlot = null;
  
      if (
        this.viewMode === 'SLOT' ||
        this.viewMode === 'PENDING' ||
        this.viewMode === 'CHEMICAL'
      ) {
        this.viewMode = 'NONE';
      }
      return;
    }
  
    if (area === 'Pending') {
      this.viewMode = 'PENDING';
      this.selectedSlot = null;
      this.stockForm.storageArea = 'Pending';
      this.returnStockForm.storageArea = 'Pending';
  
      if (this.panelMode === 'MOVE_AREA') {
        this.moveDestinationArea = 'Pending';
      }
      return;
    }
  
    if (area === 'Chemical') {
      this.viewMode = 'CHEMICAL';
      this.selectedSlot = null;
      this.stockForm.storageArea = 'Chemical';
      this.returnStockForm.storageArea = 'Chemical';
  
      if (this.panelMode === 'MOVE_AREA') {
        this.moveDestinationArea = 'Chemical';
      }
      return;
    }
  
    const slot = this.slots.find(s => s.storeCode === area);
  
    if (slot) {
      this.selectedSlot = slot;
      this.viewMode = 'SLOT';
  
      this.stockForm.storageArea = slot.storeCode;
      this.returnStockForm.storageArea = slot.storeCode;
  
      if (this.panelMode === 'MOVE_AREA') {
        this.moveDestinationArea = slot.storeCode;
      }
    } else {
      this.selectedSlot = null;
      this.viewMode = 'NONE';
    }
  }




  // ******** stockIn ************
  submitStockIn() {
    if (this.isSavingStock) return;

    this.isSavingStock = true;

    const body = {
      jobNo: this.stockForm.jobNo,
      yearMonth: this.stockForm.yearMonth,
      recivedDate: this.stockForm.recivedDate,
      inspector: this.stockForm.inspector,
      unloadBy: this.stockForm.unloadBy,
      invoiceOne: this.stockForm.invoiceOne,
      taxLnvNo: this.stockForm.taxInvNo,

      materialNo: this.stockForm.itemNo,
      unitPrice: this.stockForm.unitPrice,
      qtyOfPalletPack: this.stockForm.qtyOfPalletPack,
      coil: this.stockForm.coil,
      qtyKgsPcs: this.stockForm.qtyKgsPcs,
      unit: this.stockForm.unit,
      kgsCoil: this.stockForm.kgsCoil,
      odCoil: this.stockForm.odCoil,
      remark: this.stockForm.remark,
      millSheet: this.stockForm.millSheet,

      itemName: this.stockForm.itemName,
      itemSpec: this.stockForm.specDwg,
      lotNo: this.stockForm.lotNo,
      packing: this.stockForm.quantity,
      rosh: this.stockForm.rosh,
      result: this.stockForm.result,
      supplier: this.stockForm.supplier,
      amount: this.stockForm.amount,

      storageArea: this.stockForm.storageArea,
      userId: this.userId,
      stockNote: this.stockForm.stockNote
    };

    this.http.post(config.apiServer + '/api/mc/stockIn', body).subscribe({
      next: (res: any) => {
        this.isSavingStock = false;

        Swal.fire({
          icon: 'success',
          title: 'Stock In Success',
          text: res?.message || 'บันทึก Stock In สำเร็จ'
        }).then(() => {
          this.resetStockForm();
          this.fetchStorageMap();
        });
      },
      error: (err) => {
        this.isSavingStock = false;

        Swal.fire({
          icon: 'error',
          title: 'Stock In Fail',
          text: err?.error?.message || err?.message || 'บันทึก Stock In ไม่สำเร็จ'
        });
      }
    });
  }




  // toggleAllStockOutRows(ev: Event) {
  //   const checked = (ev.target as HTMLInputElement)?.checked === true;
  //   this.stockOutRows = this.stockOutRows.map(r => ({ ...r, checked }));
  // }
  




  
  private submitStockOutByProduction(picked: StockOutRow) {
    const body = {
      jobId: this.selectedTransactionJob!.id,
      incomingId: picked.incomingId,
      userId: this.userId,
      inchargeTime: new Date().toISOString()
    };
  
    this.isSavingStock = true;
  
    this.http.post(config.apiServer + '/api/mc/stockOutByProduction', body).subscribe({
      next: (res: any) => {
        this.isSavingStock = false;
  
        Swal.fire({
          icon: 'success',
          title: 'Stock Out Success',
          text: res?.message || 'ทำรายการ Stock Out สำเร็จ'
        }).then(() => {
          this.stockOutRows = [];
          
          this.selectedTransactionJob = null;
          this.stockOutRequestJobNo = '';
          this.stockOutSearchItemNo = '';
          this.stockOutForm = {
            itemNo: '',
            itemName: '',
            itemSpec: ''
          };
          this.panelMode = 'TABLE';
          
          // this.fetchStorageMap();
          // this.searchStockOutItem();
          this.router.navigate(['/jobTransaction']);
        });
      },
      error: (err) => {
        this.isSavingStock = false;
  
        Swal.fire({
          icon: 'error',
          title: 'Stock Out Fail',
          text: err?.error?.message || err?.message || 'ทำรายการ Stock Out ไม่สำเร็จ'
        });
      }
    });
  }



  private openIncomingJobScanModal(picked: StockOutRow) {
    const expectedJobNo = this.normalizeScanValue(picked.jobNo);
  
    Swal.fire({
      icon: 'question',
      title: 'Scan Incoming Tag',
      width: 760,
      html: `
        <style>
          .swal2-popup .stock-panel {
            padding: 8px 6px 0;
            max-height: 65vh;
            overflow-y: auto;
          }
  
          .swal2-popup .stock-row {
            display: grid;
            grid-template-columns: 120px 1fr;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
          }
  
          .swal2-popup .stock-row label {
            font-size: 14px;
            font-weight: 700;
            line-height: 1.2;
            margin: 0;
          }
  
          .swal2-popup .stock-row input {
            width: 100%;
            min-width: 0;
            height: 38px;
            border: 1px solid #d0d7e2;
            border-radius: 8px;
            padding: 0 10px;
            box-sizing: border-box;
            outline: none;
          }
  
          .swal2-popup .stock-row input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          }
        </style>
  
        <div class="stock-panel">
          <div style="text-align:left; margin-bottom:12px;">
            กรุณาสแกนใบ <b>Material Incoming</b><br>
            ระบบจะตรวจสอบเฉพาะ <b>Job No.</b> ว่าตรงกับรายการที่เลือกหรือไม่
          </div>
  
          <div style="text-align:left; margin-bottom:12px;">
            <b>Selected Incoming Job No:</b> ${this.escapeHtml(picked.jobNo || '-')}
          </div>
  
          <div class="stock-row">
            <label>Job No.</label>
            <input id="swal-scan-jobno" type="text" autocomplete="off" placeholder="Scan Job No." />
          </div>
  
          <div class="stock-row"><label>yearMonth</label><input id="swal-scan-yearMonth" type="text" /></div>
          <div class="stock-row"><label>recivedDate</label><input id="swal-scan-recivedDate" type="text" /></div>
          <div class="stock-row"><label>inspector</label><input id="swal-scan-inspector" type="text" /></div>
          <div class="stock-row"><label>UnloadBy</label><input id="swal-scan-unloadBy" type="text" /></div>
          <div class="stock-row"><label>invoiceOne</label><input id="swal-scan-invoiceOne" type="text" /></div>
          <div class="stock-row"><label>taxInvNo</label><input id="swal-scan-taxInvNo" type="text" /></div>
          <div class="stock-row"><label>materialNo</label><input id="swal-scan-itemNo" type="text" /></div>
          <div class="stock-row"><label>unitPrice</label><input id="swal-scan-unitPrice" type="text" /></div>
          <div class="stock-row"><label>qtyOfPalletPack</label><input id="swal-scan-qtyOfPalletPack" type="text" /></div>
          <div class="stock-row"><label>coil</label><input id="swal-scan-coil" type="text" /></div>
          <div class="stock-row"><label>qtyKgsPcs</label><input id="swal-scan-qtyKgsPcs" type="text" /></div>
          <div class="stock-row"><label>unit</label><input id="swal-scan-unit" type="text" /></div>
          <div class="stock-row"><label>kgsCoil</label><input id="swal-scan-kgsCoil" type="text" /></div>
          <div class="stock-row"><label>odCoil</label><input id="swal-scan-odCoil" type="text" /></div>
          <div class="stock-row"><label>remark</label><input id="swal-scan-remark" type="text" /></div>
          <div class="stock-row"><label>millSheet</label><input id="swal-scan-millSheet" type="text" /></div>
          <div class="stock-row"><label>Item Name.</label><input id="swal-scan-itemName" type="text" /></div>
          <div class="stock-row"><label>Spec/Dwg</label><input id="swal-scan-specDwg" type="text" /></div>
          <div class="stock-row"><label>Lot No.</label><input id="swal-scan-lotNo" type="text" /></div>
          <div class="stock-row"><label>packing</label><input id="swal-scan-quantity" type="text" /></div>
          <div class="stock-row"><label>rosh</label><input id="swal-scan-rosh" type="text" /></div>
          <div class="stock-row"><label>result</label><input id="swal-scan-result" type="text" /></div>
          <div class="stock-row"><label>supplier</label><input id="swal-scan-supplier" type="text" /></div>
          <div class="stock-row"><label>amount</label><input id="swal-scan-amount" type="text" /></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Verify',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      didOpen: () => {
        const popup = Swal.getPopup();
        if (!popup) return;
  
        const jobNoInput = popup.querySelector('#swal-scan-jobno') as HTMLInputElement | null;
        const amountInput = popup.querySelector('#swal-scan-amount') as HTMLInputElement | null;
        const confirmBtn = Swal.getConfirmButton();
  
        if (confirmBtn) {
          confirmBtn.disabled = true;
        }
  
        const toggleVerifyButton = () => {
          if (!confirmBtn || !amountInput) return;
          confirmBtn.disabled = !(amountInput.value || '').trim();
        };
  
        if (jobNoInput) {
          setTimeout(() => {
            jobNoInput.focus();
            jobNoInput.select();
          }, 0);
  
          jobNoInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
            }
          });
        }
  
        if (amountInput) {
          amountInput.addEventListener('input', toggleVerifyButton);
          amountInput.addEventListener('change', toggleVerifyButton);
          amountInput.addEventListener('keyup', toggleVerifyButton);
  
          amountInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
            }
          });
  
          toggleVerifyButton();
        }
      },
      preConfirm: () => {
        const popup = Swal.getPopup();
        if (!popup) return false;
  
        const scannedJobNo = this.normalizeScanValue(
          (popup.querySelector('#swal-scan-jobno') as HTMLInputElement | null)?.value || ''
        );
  
        const amount = (popup.querySelector('#swal-scan-amount') as HTMLInputElement | null)?.value || '';
  
        if (!amount.trim()) {
          Swal.showValidationMessage('ข้อมูลยังไม่ครบ!');
          return false;
        }
  
        if (!scannedJobNo) {
          Swal.showValidationMessage('กรุณาสแกน Job No. จากใบ Material Incoming');
          return false;
        }
  
        if (scannedJobNo !== expectedJobNo) {
          Swal.showValidationMessage(
            `Job No. ของ Material ไม่ตรงกัน (scan: ${scannedJobNo} / expected: ${expectedJobNo})`
          );
          return false;
        }
  
        return {
          jobNo: scannedJobNo,
          yearMonth: (popup.querySelector('#swal-scan-yearMonth') as HTMLInputElement | null)?.value || '',
          recivedDate: (popup.querySelector('#swal-scan-recivedDate') as HTMLInputElement | null)?.value || '',
          inspector: (popup.querySelector('#swal-scan-inspector') as HTMLInputElement | null)?.value || '',
          unloadBy: (popup.querySelector('#swal-scan-unloadBy') as HTMLInputElement | null)?.value || '',
          invoiceOne: (popup.querySelector('#swal-scan-invoiceOne') as HTMLInputElement | null)?.value || '',
          taxInvNo: (popup.querySelector('#swal-scan-taxInvNo') as HTMLInputElement | null)?.value || '',
          itemNo: (popup.querySelector('#swal-scan-itemNo') as HTMLInputElement | null)?.value || '',
          unitPrice: (popup.querySelector('#swal-scan-unitPrice') as HTMLInputElement | null)?.value || '',
          qtyOfPalletPack: (popup.querySelector('#swal-scan-qtyOfPalletPack') as HTMLInputElement | null)?.value || '',
          coil: (popup.querySelector('#swal-scan-coil') as HTMLInputElement | null)?.value || '',
          qtyKgsPcs: (popup.querySelector('#swal-scan-qtyKgsPcs') as HTMLInputElement | null)?.value || '',
          unit: (popup.querySelector('#swal-scan-unit') as HTMLInputElement | null)?.value || '',
          kgsCoil: (popup.querySelector('#swal-scan-kgsCoil') as HTMLInputElement | null)?.value || '',
          odCoil: (popup.querySelector('#swal-scan-odCoil') as HTMLInputElement | null)?.value || '',
          remark: (popup.querySelector('#swal-scan-remark') as HTMLInputElement | null)?.value || '',
          millSheet: (popup.querySelector('#swal-scan-millSheet') as HTMLInputElement | null)?.value || '',
          itemName: (popup.querySelector('#swal-scan-itemName') as HTMLInputElement | null)?.value || '',
          specDwg: (popup.querySelector('#swal-scan-specDwg') as HTMLInputElement | null)?.value || '',
          lotNo: (popup.querySelector('#swal-scan-lotNo') as HTMLInputElement | null)?.value || '',
          quantity: (popup.querySelector('#swal-scan-quantity') as HTMLInputElement | null)?.value || '',
          rosh: (popup.querySelector('#swal-scan-rosh') as HTMLInputElement | null)?.value || '',
          result: (popup.querySelector('#swal-scan-result') as HTMLInputElement | null)?.value || '',
          supplier: (popup.querySelector('#swal-scan-supplier') as HTMLInputElement | null)?.value || '',
          amount
        };
      }
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.submitStockOutByProduction(picked);
    });
  }


  confirmStockOut() {
    const selected = this.stockOutRows.filter(r => r.checked);
  
    if (!this.selectedTransactionJob?.id) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Job',
        text: 'ไม่พบ Job ที่ส่งมาจากหน้า Transaction'
      });
      return;
    }
  
    if (!this.stockOutRequestJobNo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Job No',
        text: 'ไม่พบ Request Job No'
      });
      return;
    }
  
    if (selected.length !== 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Select one item only',
        text: 'กรุณาเลือก Material Incoming ได้เพียง 1 รายการ'
      });
      return;
    }
  
    const picked = selected[0];
  
    Swal.fire({
      icon: 'question',
      title: 'Confirm Stock Out',
      html: `
        <div style="text-align:left; line-height:1.8;">
          <div><b>Request Job No:</b> ${this.escapeHtml(this.stockOutRequestJobNo)}</div>
          <div><b>Incoming Job No:</b> ${this.escapeHtml(picked.jobNo || '-')}</div>
          <div><b>Material No:</b> ${this.escapeHtml(this.stockOutForm.itemNo || '-')}</div>
          <div><b>Area:</b> ${this.escapeHtml(picked.area || '-')}</div>
          <div><b>Invoice:</b> ${this.escapeHtml(picked.invoice || '-')}</div>
           <div><b>Coil:</b> ${picked.coil || 0}</div>
          <div><b>Qty:</b> ${picked.qty || 0}</div>
          <div><b>Unit:</b> ${picked.unit || '-'}</div>

        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Next',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (!result.isConfirmed) return;
  
      this.openIncomingJobScanModal(picked);
    });
  }



  private submitReturnStockIn() {
    if (this.isSavingStock) return;
  
    const store = this.storeMasters.find(x => x.name === this.returnStockForm.storageArea);
  
    // if (!this.selectedTransactionJob?.incomingId || !this.selectedTransactionJob?.id) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Transaction data not found',
    //     text: 'ไม่พบ incomingId หรือ jobId ของรายการ Return'
    //   });
    //   return;
    // }
  
    if (!store?.id) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Storage Area',
        text: 'กรุณาเลือก Storage Area'
      });
      return;
    }
  
    const body = {
      jobNoIncoming: this.returnStockForm.jobNoIncoming,
      jobId: this.selectedTransactionJob?.id,
      storeId: store.id,
      userId: this.userId,
      inchargeTime: new Date().toISOString(),
      stockNote: this.returnStockForm.stockNote || '',
      coil: this.returnStockForm.coil,
      qty: this.returnStockForm.qtyKgsPcs
    };
  
    this.isSavingStock = true;
  
    this.http.post(config.apiServer + '/api/mc/stockInByProduction', body).subscribe({
      next: (res: any) => {
        this.isSavingStock = false;
  
        Swal.fire({
          icon: 'success',
          title: 'Return Stock In Success',
          text: res?.message || 'รับคืน Material สำเร็จ'
        }).then(() => {
          this.resetReturnStockForm();
          this.fetchStorageMap();
          this.panelMode = 'TABLE';
        });
      },
      error: (err) => {
        this.isSavingStock = false;
  
        Swal.fire({
          icon: 'error',
          title: 'Return Stock In Fail',
          text: err?.error?.message || err?.message || 'รับคืน Material ไม่สำเร็จ'
        });
      }
    });
  }


  confirmReturnStockAction() {
    if (this.panelMode !== 'RETURN_STOCK_IN') return;
  
    const requiredFields = [
      { key: 'requestJobNo', label: 'Request Job No.' },
      { key: 'jobNoIncoming', label: 'Job No. Incoming' },
      { key: 'coil', label: 'Coil' },
      { key: 'qtyKgsPcs', label: 'Qty Kgs/Pcs' },
      { key: 'storageArea', label: 'Storage Area' }
    ];
  
    const missing = requiredFields
      .filter(f => !(this.returnStockForm as any)[f.key]?.toString().trim())
      .map(f => f.label);
  
    if (missing.length) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลยังไม่ครบ',
        html: `
          <div style="text-align:left">
            กรุณาตรวจสอบข้อมูลต่อไปนี้:<br><br>
            <b>${missing.join('<br>')}</b>
          </div>
        `
      });
      return;
    }
  
    const expectedMaterialNo = (this.returnStockForm.itemNo || '').toString().trim().toUpperCase();
    const scannedMaterialNo = (this.returnStockForm.materialNoScan || '').toString().trim().toUpperCase();
  
    if (!scannedMaterialNo) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Material No',
        text: 'กรุณาสแกน Material No จากใบ Material Incoming'
      });
      return;
    }
  
    if (scannedMaterialNo !== expectedMaterialNo) {
      Swal.fire({
        icon: 'error',
        title: 'Material No ไม่ตรงกัน',
        html: `
          <div style="text-align:left; line-height:1.8;">
            <div><b>Expected:</b> ${this.escapeHtml(expectedMaterialNo || '-')}</div>
            <div><b>Scanned:</b> ${this.escapeHtml(scannedMaterialNo || '-')}</div>
          </div>
        `
      });
      return;
    }
  
    const store = this.storeMasters.find(x => x.name === this.returnStockForm.storageArea);
  
    const orderedPayload = {
      jobNoIncoming: this.returnStockForm.jobNoIncoming,
      jobId: this.selectedTransactionJob?.id ?? null,
      requestJobNo: this.returnStockForm.requestJobNo,
      itemNo: this.returnStockForm.itemNo,
      scannedMaterialNo: this.returnStockForm.materialNoScan,
      itemName: this.returnStockForm.itemName,
      itemSpec: this.returnStockForm.itemSpec,
      coil: this.returnStockForm.coil,
      qty: this.returnStockForm.qtyKgsPcs,
      storageArea: this.returnStockForm.storageArea,
      storeId: store?.id ?? null,
      stockNote: this.returnStockForm.stockNote
    };
  
    Swal.fire({
      title: 'Confirm Return Stock In Data',
      html: `
        <div style="text-align:left; max-height:420px; overflow:auto;">
          <pre style="
            margin:0;
            white-space:pre-wrap;
            word-break:break-word;
            font-size:13px;
            line-height:1.45;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:10px;
            padding:12px;
            color:#0f172a;
          ">${this.escapeHtml(JSON.stringify(orderedPayload, null, 2))}</pre>
        </div>
      `,
      width: '720px',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.submitReturnStockIn();
    });
  }



  resetReturnStockForm() {
    this.returnStockForm = {
      requestJobNo: this.selectedTransactionJob?.jobNo || '',
      itemNo: this.selectedTransactionJob?.materialNo || '',
      itemName: this.selectedTransactionJob?.materialName || '',
      itemSpec: this.selectedTransactionJob?.materialSpec || '',
  
      // scanner fields
      jobNoIncoming: '',
      yearMonth: '',
      recivedDate: '',
      inspector: '',
      unloadBy: '',
      invoiceOne: '',
      taxInvNo: '',
      materialNoScan: '',
      unitPrice: '',
      qtyOfPalletPack: '',
      scannerCoil: '',
      scannerQtyKgsPcs: '',
      unit: '',
      kgsCoil: '',
      odCoil: '',
      remark: '',
      millSheet: '',
      itemNameScan: '',
      specDwg: '',
      lotNo: '',
      quantity: '',
      rosh: '',
      result: '',
      supplier: '',
      amount: '',
  
      // return actual values
      coil: '',
      qtyKgsPcs: '',
  
      storageArea: '',
      stockNote: ''
    };
  
    setTimeout(() => this.focusEl(this.returnScanJobNo), 0);
  }








}