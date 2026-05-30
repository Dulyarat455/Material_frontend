import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { CallSocketService } from '../services/call-socket.service';

import Swal from 'sweetalert2';
import config from '../../config';

type storeMasterRow = {
  id: number | null;
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


type PbassLastSyncResult = {
  id: number;
  remark: string;
  userId?: number | null;
  timeStmp: string;
  status: string;
  user?: {
    id: number;
    empNo: string;
    name: string;
    role?: string;
  } | null;
  group?: {
    id: number;
    name: string;
  } | null;
  section?: {
    id: number;
    name: string;
  } | null;
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




  type MoveAreaScanField =
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
  | 'amount'
  | 'storeCode';


@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.css'
})
export class StorageComponent {
   wsSub?: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
     private callSocket: CallSocketService,
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

@ViewChild('returnScanStorageArea') returnScanStorageArea?: ElementRef<HTMLInputElement>;



//moveAreaScan
@ViewChild('moveAreaScanYearMonth') moveAreaScanYearMonth?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanRecivedDate') moveAreaScanRecivedDate?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanInspector') moveAreaScanInspector?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanUnloadBy') moveAreaScanUnloadBy?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanInvoiceOne') moveAreaScanInvoiceOne?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanTaxInvNo') moveAreaScanTaxInvNo?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanItemNo') moveAreaScanItemNo?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanUnitPrice') moveAreaScanUnitPrice?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanQtyOfPalletPack') moveAreaScanQtyOfPalletPack?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanCoil') moveAreaScanCoil?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanQtyKgsPcs') moveAreaScanQtyKgsPcs?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanUnit') moveAreaScanUnit?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanKgsCoil') moveAreaScanKgsCoil?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanOdCoil') moveAreaScanOdCoil?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanRemark') moveAreaScanRemark?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanMillSheet') moveAreaScanMillSheet?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanItemName') moveAreaScanItemName?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanSpecDwg') moveAreaScanSpecDwg?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanLotNo') moveAreaScanLotNo?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanQuantity') moveAreaScanQuantity?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanRosh') moveAreaScanRosh?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanResult') moveAreaScanResult?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanSupplier') moveAreaScanSupplier?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanAmount') moveAreaScanAmount?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanJobNo') moveAreaScanJobNo?: ElementRef<HTMLInputElement>;
@ViewChild('moveAreaScanStoreCode') moveAreaScanStoreCode?: ElementRef<HTMLInputElement>;


  viewMode: 'NONE' | 'SLOT' | 'PENDING' | 'CHEMICAL' = 'NONE';
  panelMode: 'TABLE' | 'STOCK_IN' | 'STOCK_OUT' | 'MOVE_AREA'  | 'MOVE_AREA_SCAN' | 'RETURN_STOCK_IN' = 'TABLE';

  showMobileAreaStore = false;

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
      stockNote: '',
      mcRemark: ''
  };


  returnStorageAreaScan = '';
  returnStorageAreaScanStatus: 'idle' | 'found' | 'not-found' = 'idle';
  returnStorageAreaScanMessage = '';







 // state for moveAreaScan
 moveAreaScanForm = {
  // scanner input
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

  // destination scan
  storeCode: '',

  // found result
  foundJobNo: '',
  foundItemNo: '',
  foundItemName: '',
  foundItemSpec: '',
  foundArea: '',
  incomingId: null as number | null,
  sourceStoreId: null as number | null,
  targetStoreId: null as number | null,
  targetStoreCode: '',
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
  role: string = '';


  
  stockOutRequestJobNo = '';
  stockOutSearchItemNo = '';
  stockOutRows: StockOutRow[] = [];
  stockOutForm = {
    itemNo: '',
    itemName: '',
    itemSpec: '',
    mcRemark: ''
  };

  stockOutDenial = false;

  selectedTransactionJob: {
    id: number;
    jobNo: string;
    materialNo: string;
    materialName: string;
    materialSpec: string;
    incomingId?: number | null;
  } | null = null;

  


  //part move area scan panel  

  isMoveAreaScanReady = false;
  isMoveAreaScanScanning = false;

  //use push button clear for move Area scan 
  isClearingMoveAreaScan = false;


  // ใช้ข้อมูลจริงจาก API
  pendingItems: MaterialItem[] = [];
  chemicalItems: MaterialItem[] = [];

  // ใช้ API แทน mock
  slots: SlotRow[] = [];

  selectedSlot: SlotRow | null = null;


  // panel stockIn
  stockInMode: 'MANUAL' | 'SYNC_PBASS' = 'SYNC_PBASS';

  pbassSyncForm = {
    fromDate: '',
    toDate: ''
  };
  
  pbassLastSync: PbassLastSyncResult | null = null;

  pbassSyncSummary = {
    lastSyncTime: '',
    pendingCount: 0,
    successCount: 0,
    failCount: 0
  };

  isSyncingPbass = false;
  isPreviewingPbass = false;


  pbassPreviewRows: Array<{
    index?: number;
    jobNo: string;
    recivedDate: string;
    itemNo: string;
    itemName: string;
    itemSpec: string;
    lotNo: string;
    coil?: number;
    qtyKgsPcs: number;
    supplier: string;
    unit?: string;
    invoiceNo?: string;
    taxInvoiceNo?: string;
    amount?: number;
    seq?: string;
    unloadBy?: string;
    remark?: string;
    accountCode?: string;
    materialKind?: string;

  }> = [];


  pbassSubmitRows: Array<{
    index?: number;
    jobNo: string;
    recivedDate: string;
    itemNo: string;
    itemName: string;
    itemSpec: string;
    lotNo: string;
    coil?: number;
    qtyKgsPcs: number;
    supplier: string;
    unit?: string;
    invoiceNo?: string;
    taxInvoiceNo?: string;
    amount?: number;
    seq?: string;
    unloadBy?: string;
    remark?: string;
  
    reason?: string;
    syncStatus: 'success' | 'skipped';
    incomingId?: number;
    storeId?: number;
    accountCode?: string;
    materialKind?: string;
  }> = [];

  pbassSubmitStatusFilter: 'all' | 'success' | 'skipped' = 'all';
  pbassSubmitReasonFilter = 'all';
  pbassSubmitKindFilter: 'all' | 'Material' | 'Chemical' | 'Not Found' = 'all';
  
  pbassSyncLogs: string[] = [];


  

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

  
  get isStockManualScanning(): boolean {
    return (
      this.panelMode === 'STOCK_IN' &&
      this.stockInMode === 'MANUAL' &&
      !!this.stockForm.jobNo?.toString().trim() &&
      !this.stockForm.amount?.toString().trim()
    );
  }

  get isStockManualScanComplete(): boolean {
    return (
      this.panelMode === 'STOCK_IN' &&
      this.stockInMode === 'MANUAL' &&
      !!this.stockForm.jobNo?.toString().trim() &&
      !!this.stockForm.amount?.toString().trim()
    );
  }


  get isReturnStockScanning(): boolean {
    return (
      this.panelMode === 'RETURN_STOCK_IN' &&
      !!this.returnStockForm.jobNoIncoming?.toString().trim() &&
      !this.returnStockForm.amount?.toString().trim()
    );
  }
  
  get isReturnStockScanComplete(): boolean {
    return (
      this.panelMode === 'RETURN_STOCK_IN' &&
      !!this.returnStockForm.jobNoIncoming?.toString().trim() &&
      !!this.returnStockForm.amount?.toString().trim()
    );
  }


  get shouldHideAreaStoreOnMobile(): boolean {
    if (this.panelMode === 'MOVE_AREA_SCAN') return true;
  
    return !this.showMobileAreaStore;
  }


  ngOnInit() {
    this.userId = Number(localStorage.getItem('materialStore_userId')) || null;
    this.role = localStorage.getItem('materialStore_role')!;


    this.fetchStoreMaster();
    this.fetchStorageMap();

    this.applyTransactionState();
    this.applyDefaultPanelForMobile();
    this.setDefaultPbassDateRange();
    this.fetchPbassLastSyncTime();

     // ✅ ฟัง event จาก websocket
     this.wsSub = this.callSocket.onStoreChange().subscribe((payload: any) => {
      console.log('materialStore:changed  payload =', payload);
      const type = payload?.type as 'materialStoreMove' | undefined;
      console.log("type = ",type )

      if(type === 'materialStoreMove'){
        this.fetchStoreMaster();
        this.fetchStorageMap();
      }

    })
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
        stockNote: '',
        mcRemark: ''
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
        itemSpec: job.materialSpec || '',
        mcRemark:''
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

  



oldestStockOutReceivedDate = '';
oldestReturnReceivedDate = '';
oldestMoveReceivedDate = '';



private toSortableTime(value?: string): number {
  const v = (value || '').trim();
  if (!v) return Number.MAX_SAFE_INTEGER;

  // ✅ ต้อง parse format dd/mm/yyyy หรือ dd-mm-yyyy ก่อน Date.parse()
  // เพราะ Date.parse('09/03/2026') อาจถูกตีความเป็น Sep 03, 2026
  const dmy = v.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
  }

  // ✅ รองรับ yyyy-mm-dd ถ้ามีจาก backend
  const ymd = v.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (ymd) {
    const [, yyyy, mm, dd] = ymd;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
  }

  const direct = Date.parse(v);
  if (!Number.isNaN(direct)) return direct;

  return Number.MAX_SAFE_INTEGER;
}

private buildMaterialRowsByItemNo(itemNo: string): StockOutRow[] {
  const key = (itemNo || '').trim().toLowerCase();
  if (!key) return [];

  const rows: StockOutRow[] = [];

  this.slots.forEach((slot) => {
    (slot.materials || []).forEach((m, index) => {
      const materialNo = (m.materialNo || m.itemNo || '').trim().toLowerCase();
      if (materialNo !== key) return;

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
    });
  });

  this.pendingItems.forEach((m, index) => {
    const materialNo = (m.materialNo || m.itemNo || '').trim().toLowerCase();
    if (materialNo !== key) return;

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
  });

  this.chemicalItems.forEach((m, index) => {
    const materialNo = (m.materialNo || m.itemNo || '').trim().toLowerCase();
    if (materialNo !== key) return;

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
  });

  rows.sort((a, b) => this.toSortableTime(a.receivedDate) - this.toSortableTime(b.receivedDate));
  return rows;
}




private buildMaterialRowsByJobNo(jobNo: string): StockOutRow[] {
  const key = (jobNo || '').trim().toLowerCase();
  if (!key) return [];

  const rows: StockOutRow[] = [];

  this.slots.forEach((slot) => {
    (slot.materials || []).forEach((m, index) => {
      const sourceJobNo = (m.jobNo || '').trim().toLowerCase();
      if (sourceJobNo !== key) return;

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
    });
  });

  this.pendingItems.forEach((m, index) => {
    const sourceJobNo = (m.jobNo || '').trim().toLowerCase();
    if (sourceJobNo !== key) return;

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
  });

  this.chemicalItems.forEach((m, index) => {
    const sourceJobNo = (m.jobNo || '').trim().toLowerCase();
    if (sourceJobNo !== key) return;

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
  });

  rows.sort((a, b) => this.toSortableTime(a.receivedDate) - this.toSortableTime(b.receivedDate));
  return rows;
}





private findSlotByStoreCode(storeCode: string): SlotRow | null {
  const key = (storeCode || '').trim().toLowerCase();
  if (!key) return null;

  return this.slots.find(s =>
    String(s.storeCode || '').trim().toLowerCase() === key
  ) || null;
}



private findStoreMasterByCode(storeCode: string): storeMasterRow | null {
  const key = (storeCode || '').trim().toLowerCase();
  if (!key) return null;

  return this.storeMasters.find(x =>
    String(x.name || '').trim().toLowerCase() === key
  ) || null;
}



private normalizeSpecialStoreCode(value: string): 'Pending' | 'Chemical' | '' {
  const key = (value || '').trim().toLowerCase();

  if (key === 'pending') return 'Pending';
  if (key === 'chemical') return 'Chemical';

  return '';
}



private resetMoveAreaScanForm() {
  this.moveAreaScanForm = {
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
    storeCode: '',
    foundJobNo: '',
    foundItemNo: '',
    foundItemName: '',
    foundItemSpec: '',
    foundArea: '',
    incomingId: null,
    sourceStoreId: null,
    targetStoreId: null,
    targetStoreCode: '',
    stockNote: ''
  };
}


private showAppToast(
  icon: 'success' | 'error' | 'warning' | 'info',
  title: string
) {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    timer: 1800,
    showConfirmButton: false,
    timerProgressBar: true,

    customClass: {
      container: 'app-toast-container',
      popup: 'app-toast'
    },

    didOpen: (toast) => {
      toast.style.borderRadius = '14px';
      toast.style.padding = '10px 14px';
      toast.style.boxShadow = '0 12px 30px rgba(15, 23, 42, 0.18)';
      toast.style.fontSize = '13px';
      toast.style.fontWeight = '800';
      toast.style.background = '#ffffff';
      toast.style.color = '#0f172a';
      toast.style.border = '1px solid rgba(2, 6, 23, 0.08)';
    }
  });
}

searchMoveAreaScanJob() {
  const key = (this.moveAreaScanForm.jobNo || '').trim();

  this.moveAreaScanForm.foundJobNo = '';
  this.moveAreaScanForm.foundItemNo = '';
  this.moveAreaScanForm.foundItemName = '';
  this.moveAreaScanForm.foundItemSpec = '';
  this.moveAreaScanForm.foundArea = '';
  this.moveAreaScanForm.incomingId = null;
  this.moveAreaScanForm.sourceStoreId = null;
  this.moveAreaScanForm.stockNote = '';

  if (!key) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Job No',
      text: 'กรุณา Scan Job No',
      returnFocus: false
    }).then(() => {
      setTimeout(() => {
        this.focusEl(this.moveAreaScanJobNo);
      }, 0);
    });
    return;
  }

  const rows = this.buildMaterialRowsByJobNo(key);

  if (!rows.length) {
    this.moveRows = [];
    this.resetMoveAreaScanForm();
    this.selectedSlot = null;
    this.viewMode = 'NONE';
  
    this.ignoreMoveAreaScanBlur = true;
  
    Swal.fire({
      icon: 'info',
      title: 'No item found',
      text: `ไม่พบ Incoming Job No : ${key}`,
      returnFocus: false
    }).then(() => {
      setTimeout(() => {
        this.focusEl(this.moveAreaScanJobNo);
  
        setTimeout(() => {
          this.ignoreMoveAreaScanBlur = false;
        }, 100);
      }, 0);
    });
  
    return;
  }

  if (rows.length > 1) {
  this.moveRows = [];
  this.selectedSlot = null;
  this.viewMode = 'NONE';
  this.ignoreMoveAreaScanBlur = true;

  Swal.fire({
    icon: 'warning',
    title: 'Found multiple items',
    text: `พบมากกว่า 1 รายการสำหรับ Job No : ${key} กรุณาตรวจสอบ data`,
    returnFocus: false
  }).then(() => {
    setTimeout(() => {
      this.focusEl(this.moveAreaScanJobNo);

      setTimeout(() => {
        this.ignoreMoveAreaScanBlur = false;
      }, 100);
    }, 0);
  });

  return;
}

  const picked = rows[0];

  this.moveAreaScanForm.foundJobNo = picked.jobNo || '';
  this.moveAreaScanForm.foundItemNo = picked.itemNo || '';
  this.moveAreaScanForm.foundItemName = picked.itemName || '';
  this.moveAreaScanForm.foundItemSpec = picked.itemSpec || '';
  this.moveAreaScanForm.foundArea = picked.sourceStoreCode || picked.area || '';
  this.moveAreaScanForm.incomingId = picked.incomingId || null;
  this.moveAreaScanForm.sourceStoreId = picked.storeId || null;
  this.moveAreaScanForm.stockNote = picked.stockNote || '';


  this.moveRows = [{
    uid: picked.uid,
    checked: true,
    area: picked.area,
    receivedDate: picked.receivedDate,
    invoice: picked.invoice,
    qty: picked.qty,
    remark: picked.remark,
    toArea: '',
    itemNo: picked.itemNo,
    itemName: picked.itemName,
    itemSpec: picked.itemSpec,
    coil: picked.coil,
    unit: picked.unit,
    sourceStoreCode: picked.sourceStoreCode,
    sourceInvNo: picked.invoice,
    jobNo: picked.jobNo,
    incomingId: picked.incomingId,
    storeId: picked.storeId,
    stockNote: picked.stockNote
  }];

  this.showAppToast(
    'success',
    `Search Incoming สำเร็จ : ${picked.jobNo || key}`
  );

  setTimeout(() => {
    this.focusEl(this.moveAreaScanStoreCode);
  }, 0);
}



private resetMoveAreaScanDestination() {
  this.moveAreaScanForm.storeCode = '';
  this.moveAreaScanForm.targetStoreId = null;
  this.moveAreaScanForm.targetStoreCode = '';
  
}




searchMoveAreaScanStoreCode() {
  const key = (this.moveAreaScanForm.storeCode || '').trim();

  this.moveAreaScanForm.targetStoreId = null;
  this.moveAreaScanForm.targetStoreCode = '';

  if (!key) {
    this.selectedSlot = null;
    if (this.viewMode === 'SLOT') this.viewMode = 'NONE';
    return;
  }

  const specialArea = this.normalizeSpecialStoreCode(key);
  const store = this.findStoreMasterByCode(specialArea || key);

  // =============================
  // CASE 1: Pending / Chemical
  // =============================
  if (specialArea) {
    if (!store?.id) {
      this.resetMoveAreaScanDestination();
      this.selectedSlot = null;

      this.ignoreMoveAreaScanBlur = true;

      Swal.fire({
        icon: 'warning',
        title: 'Invalid Store Code',
        text: `ไม่พบ Store Code : ${key} ใน Store Master`
      }).then(() => {
        setTimeout(() => {
          this.focusEl(this.moveAreaScanStoreCode);

          setTimeout(() => {
            this.ignoreMoveAreaScanBlur = false;
          }, 100);
        }, 0);
      });

      return;
    }

    this.selectedSlot = null;
    this.viewMode = specialArea === 'Pending' ? 'PENDING' : 'CHEMICAL';

    this.moveAreaScanForm.targetStoreId = Number(store.id || 0);
    this.moveAreaScanForm.targetStoreCode = store.name || specialArea;

     // ✅ Toast success
     this.showAppToast(
      'success',
      `Search Store Code สำเร็จ : ${this.moveAreaScanForm.targetStoreCode}`
    );

    return;
  }

  // =============================
  // CASE 2: Normal slot เช่น 1101, 1102, 2201
  // =============================
  const slot = this.findSlotByStoreCode(key);

  if (!slot || !store?.id) {
    this.resetMoveAreaScanDestination();
    this.selectedSlot = null;

    this.ignoreMoveAreaScanBlur = true;

    Swal.fire({
      icon: 'warning',
      title: 'Invalid Store Code',
      text: `ไม่พบ Store Code : ${key}`
    }).then(() => {
      setTimeout(() => {
        this.focusEl(this.moveAreaScanStoreCode);

        setTimeout(() => {
          this.ignoreMoveAreaScanBlur = false;
        }, 100);
      }, 0);
    });

    return;
  }

  this.selectedSlot = slot;
  this.viewMode = 'SLOT';
  this.moveAreaScanForm.targetStoreId = Number(store.id || 0);
  this.moveAreaScanForm.targetStoreCode = store.name || slot.storeCode;

    // ✅ Toast success
    this.showAppToast(
      'success',
      `Search Store Code สำเร็จ : ${this.moveAreaScanForm.targetStoreCode}`
    );
    
}


clearMoveAreaScanForm() {
  this.isClearingMoveAreaScan = true;
  this.moveAreaScanForm = {
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
    storeCode: '',
    foundJobNo: '',
    foundItemNo: '',
    foundItemName: '',
    foundItemSpec: '',
    foundArea: '',
    incomingId: null,
    sourceStoreId: null,
    targetStoreId: null,
    targetStoreCode: '',
    stockNote: ''
  };





  this.isMoveAreaScanReady = false;
  this.isMoveAreaScanScanning = false;

  this.moveRows = [];
  this.selectedSlot = null;
  this.viewMode = 'NONE';

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  
    setTimeout(() => {
      this.focusEl(this.moveAreaScanJobNo);
      this.isClearingMoveAreaScan = false;
    }, 250);
  }, 0);
}






private getOldestTimeFromRows(rows: { receivedDate?: string }[]): number {
  if (!rows.length) return Number.MAX_SAFE_INTEGER;
  return Math.min(...rows.map(r => this.toSortableTime(r.receivedDate)));
}

private getAreaSetFromRows(rows: { sourceStoreCode?: string; area?: string }[]): Set<string> {
  return new Set(rows.map(r => (r.sourceStoreCode || r.area || '').trim()).filter(Boolean));
}

private getOldestAreaSetFromRows(
  rows: { receivedDate?: string; sourceStoreCode?: string; area?: string }[]
): Set<string> {
  const oldestTime = this.getOldestTimeFromRows(rows);
  if (oldestTime === Number.MAX_SAFE_INTEGER) return new Set<string>();

  return new Set(
    rows
      .filter(r => this.toSortableTime(r.receivedDate) === oldestTime)
      .map(r => (r.sourceStoreCode || r.area || '').trim())
      .filter(Boolean)
  );
}

private hasAnyMaterialInSlot(s: SlotRow): boolean {
  return !!(s.materials && s.materials.length);
}

private isTableOccupiedHighlight(s: SlotRow): boolean {
  return s.status !== 'REJECTED' && this.hasAnyMaterialInSlot(s);
}

 isMoveAreaGreen(slotId: string): boolean {
  if (this.panelMode !== 'MOVE_AREA' && this.panelMode !== 'MOVE_AREA_SCAN') {
    return false;
  }

  if (!this.moveRows.length) return false;

  const oldestAreas = this.getOldestAreaSetFromRows(
    this.moveRows.map(r => ({
      receivedDate: r.receivedDate,
      sourceStoreCode: r.sourceStoreCode,
      area: r.area
    }))
  );

  return oldestAreas.has(slotId);
}


 isMoveAreaOrange(slotId: string): boolean {
  if (this.panelMode !== 'MOVE_AREA' && this.panelMode !== 'MOVE_AREA_SCAN') {
    return false;
  }

  if (!this.moveRows.length) return false;

  const allAreas = this.getAreaSetFromRows(
    this.moveRows.map(r => ({
      sourceStoreCode: r.sourceStoreCode,
      area: r.area
    }))
  );

  const oldestAreas = this.getOldestAreaSetFromRows(
    this.moveRows.map(r => ({
      receivedDate: r.receivedDate,
      sourceStoreCode: r.sourceStoreCode,
      area: r.area
    }))
  );

  return allAreas.has(slotId) && !oldestAreas.has(slotId);
}

 isStockOutGreen(slotId: string): boolean {
  if (this.panelMode !== 'STOCK_OUT') return false;
  if (!this.stockOutRows.length) return false;

  const oldestAreas = this.getOldestAreaSetFromRows(this.stockOutRows);
  return oldestAreas.has(slotId);
}

 isStockOutOrange(slotId: string): boolean {
  if (this.panelMode !== 'STOCK_OUT') return false;
  if (!this.stockOutRows.length) return false;

  const allAreas = this.getAreaSetFromRows(this.stockOutRows);
  const oldestAreas = this.getOldestAreaSetFromRows(this.stockOutRows);

  return allAreas.has(slotId) && !oldestAreas.has(slotId);
}





  
isOldestStockOutRow(row: StockOutRow): boolean {
  if (!this.oldestStockOutReceivedDate) return false;

  return (
    this.toSortableTime(row.receivedDate) ===
    this.toSortableTime(this.oldestStockOutReceivedDate)
  );
}





isOldestMoveRow(row: MoveRow): boolean {
  if (!row || !this.oldestMoveReceivedDate) return false;
  return this.toSortableTime(row.receivedDate) === this.toSortableTime(this.oldestMoveReceivedDate);
}






searchStockOutItem() {
  const key = (this.stockOutSearchItemNo || '').trim();

  this.stockOutRows = [];
  this.oldestStockOutReceivedDate = '';
  this.stockOutForm = {
    itemNo: '',
    itemName: '',
    itemSpec: '',
    mcRemark: ''
  };

  if (!key) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Material No',
      text: 'กรุณากรอก Material No'
    });
    return;
  }

  const rows = this.buildMaterialRowsByItemNo(key);
  this.stockOutRows = rows;
  this.oldestStockOutReceivedDate = rows.length ? (rows[0].receivedDate || '') : '';

  if (rows.length) {
    this.stockOutForm = {
      itemNo: this.selectedTransactionJob?.materialNo || rows[0].itemNo,
      itemName: this.selectedTransactionJob?.materialName || rows[0].itemName,
      itemSpec: this.selectedTransactionJob?.materialSpec || rows[0].itemSpec,
      mcRemark: this.stockOutForm.mcRemark || ''
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

  setStockInMode(mode: 'MANUAL' | 'SYNC_PBASS') {
    this.stockInMode = mode;
  
    if (mode === 'MANUAL') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
  
      setTimeout(() => {
        this.focusScanFirst();
      }, 250);
    }
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

  //for break blur on modal alert
  ignoreMoveAreaScanBlur = false;


  onMoveAreaScanBlur(field: MoveAreaScanField, ev: FocusEvent) {
    if (this.ignoreMoveAreaScanBlur) return;
    this.onMoveAreaScanEnter(field, ev);
  }



  updateMoveAreaScanState() {
    const jobNo = (this.moveAreaScanForm.jobNo || '').toString().trim();
    const amount = (this.moveAreaScanForm.amount || '').toString().trim();
  
    this.isMoveAreaScanReady = !!amount;
    this.isMoveAreaScanScanning = !!jobNo && !amount;
  }

  onMoveAreaScanInputChange() {
    this.updateMoveAreaScanState();
  }

  

  onMoveAreaScanEnter(field: MoveAreaScanField, ev: any) {
    if (this.isClearingMoveAreaScan) return;
    if (ev?.key === 'Enter') ev.preventDefault();
    if (this.panelMode !== 'MOVE_AREA_SCAN') return;

    this.updateMoveAreaScanState();
  
    switch (field) {
      case 'jobNo':
        if (!this.moveAreaScanForm.jobNo) return;
        return this.focusEl(this.moveAreaScanYearMonth);
  
      case 'yearMonth':
        if (!this.moveAreaScanForm.yearMonth) return;
        return this.focusEl(this.moveAreaScanRecivedDate);
  
      case 'recivedDate':
        if (!this.moveAreaScanForm.recivedDate) return;
        return this.focusEl(this.moveAreaScanInspector);
  
      case 'inspector':
        if (!this.moveAreaScanForm.inspector) return;
        return this.focusEl(this.moveAreaScanUnloadBy);
  
      case 'unloadBy':
        if (!this.moveAreaScanForm.unloadBy) return;
        return this.focusEl(this.moveAreaScanInvoiceOne);
  
      case 'invoiceOne':
        if (!this.moveAreaScanForm.invoiceOne) return;
        return this.focusEl(this.moveAreaScanTaxInvNo);
  
      case 'taxInvNo':
        if (!this.moveAreaScanForm.taxInvNo) return;
        return this.focusEl(this.moveAreaScanItemNo);
  
      case 'itemNo':
        if (!this.moveAreaScanForm.itemNo) return;
        return this.focusEl(this.moveAreaScanUnitPrice);
  
      case 'unitPrice':
        if (!this.moveAreaScanForm.unitPrice) return;
        return this.focusEl(this.moveAreaScanQtyOfPalletPack);
  
      case 'qtyOfPalletPack':
        if (!this.moveAreaScanForm.qtyOfPalletPack) return;
        return this.focusEl(this.moveAreaScanCoil);
  
      case 'coil':
        if (!this.moveAreaScanForm.coil) return;
        return this.focusEl(this.moveAreaScanQtyKgsPcs);
  
      case 'qtyKgsPcs':
        if (!this.moveAreaScanForm.qtyKgsPcs) return;
        return this.focusEl(this.moveAreaScanUnit);
  
      case 'unit':
        if (!this.moveAreaScanForm.unit) return;
        return this.focusEl(this.moveAreaScanKgsCoil);
  
      case 'kgsCoil':
        if (!this.moveAreaScanForm.kgsCoil) return;
        return this.focusEl(this.moveAreaScanOdCoil);
  
      case 'odCoil':
        if (!this.moveAreaScanForm.odCoil) return;
        return this.focusEl(this.moveAreaScanRemark);
  
      case 'remark':
        if (!this.moveAreaScanForm.remark) return;
        return this.focusEl(this.moveAreaScanMillSheet);
  
      case 'millSheet':
        if (!this.moveAreaScanForm.millSheet) return;
        return this.focusEl(this.moveAreaScanItemName);
  
      case 'itemName':
        if (!this.moveAreaScanForm.itemName) return;
        return this.focusEl(this.moveAreaScanSpecDwg);
  
      case 'specDwg':
        if (!this.moveAreaScanForm.specDwg) return;
        return this.focusEl(this.moveAreaScanLotNo);
  
      case 'lotNo':
        if (!this.moveAreaScanForm.lotNo) return;
        return this.focusEl(this.moveAreaScanQuantity);
  
      case 'quantity':
        if (!this.moveAreaScanForm.quantity) return;
        return this.focusEl(this.moveAreaScanRosh);
  
      case 'rosh':
        if (!this.moveAreaScanForm.rosh) return;
        return this.focusEl(this.moveAreaScanResult);
  
      case 'result':
        if (!this.moveAreaScanForm.result) return;
        return this.focusEl(this.moveAreaScanSupplier);
  
      case 'supplier':
        if (!this.moveAreaScanForm.supplier) return;
        return this.focusEl(this.moveAreaScanAmount);
  
      case 'amount':
        if (!this.moveAreaScanForm.amount) return;
        this.searchMoveAreaScanJob();
        return 
  
      case 'storeCode':
        if (!this.moveAreaScanForm.storeCode) return;
        this.searchMoveAreaScanStoreCode();
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
        if (this.returnStockForm.jobNoIncoming?.trim()) {
          this.fetchIncomingStockNote(this.returnStockForm.jobNoIncoming);
        }

        return this.focusEl(this.returnActualCoil);
  
      case 'coil':
        if (!this.returnStockForm.coil) return;
        return this.focusEl(this.returnActualQtyKgsPcs);
  
      case 'qtyKgsPcs':
        if (!this.returnStockForm.qtyKgsPcs) return;
        return this.focusEl(this.returnScanStorageArea);
    }
  }




  setPanelMode(mode: 'TABLE' | 'STOCK_IN' | 'STOCK_OUT' | 'MOVE_AREA'  | 'MOVE_AREA_SCAN' | 'RETURN_STOCK_IN') {
    this.panelMode = mode;

     // ✅ mobile default ให้ปิด Area Store ทุกครั้งที่เปลี่ยน panel
    this.showMobileAreaStore = false;
  
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
        itemSpec: '',
        mcRemark: ''
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
        stockNote: '',
        mcRemark: ''
      };

      this.returnStorageAreaScan = '';
      this.returnStorageAreaScanStatus = 'idle';
      this.returnStorageAreaScanMessage = '';
    }


    if (mode !== 'MOVE_AREA_SCAN') {
      this.moveAreaScanForm = {
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
        storeCode: '',
        foundJobNo: '',
        foundItemNo: '',
        foundItemName: '',
        foundItemSpec: '',
        foundArea: '',
        incomingId: null,
        sourceStoreId: null,
        targetStoreId: null,
        targetStoreCode: '',
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


    if (mode === 'MOVE_AREA_SCAN') {
      setTimeout(() => this.focusEl(this.moveAreaScanJobNo), 0);
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
      const formRows = [
        { label: 'Job No', value: orderedPayload.jobNo, tone: 'warn' },
        { label: 'Year / Month', value: orderedPayload.yearMonth },
        { label: 'Received Date', value: orderedPayload.recivedDate },
        { label: 'Inspector', value: orderedPayload.inspector },
        { label: 'Unload By', value: orderedPayload.unloadBy },
        { label: 'Invoice One', value: orderedPayload.invoiceOne },
        { label: 'Tax Invoice No', value: orderedPayload.taxInvNo },
    
        { label: 'Material No', value: orderedPayload.itemNo, tone: 'warn' },
        { label: 'Unit Price', value: orderedPayload.unitPrice },
        { label: 'Qty Of Pallet / Pack', value: orderedPayload.qtyOfPalletPack },
        { label: 'Coil', value: orderedPayload.coil, tone: 'warn' },
        { label: 'Qty Kgs/Pcs', value: orderedPayload.qtyKgsPcs, tone: 'warn' },
        { label: 'Unit', value: orderedPayload.unit },
        { label: 'Kgs / Coil', value: orderedPayload.kgsCoil },
        { label: 'OD Coil', value: orderedPayload.odCoil },
        { label: 'Remark', value: orderedPayload.remark },
        { label: 'Mill Sheet', value: orderedPayload.millSheet },
    
        { label: 'Item Name', value: orderedPayload.itemName, tone: 'warn' },
        { label: 'Spec / Dwg', value: orderedPayload.specDwg, tone: 'warn' },
        { label: 'Lot No', value: orderedPayload.lotNo },
        { label: 'Quantity', value: orderedPayload.quantity },
        { label: 'ROSH', value: orderedPayload.rosh },
        { label: 'Result', value: orderedPayload.result },
        { label: 'Supplier', value: orderedPayload.supplier },
        { label: 'Amount', value: orderedPayload.amount },
    
        { label: 'Storage Area', value: orderedPayload.storageArea, tone: 'primary' },
        { label: 'Stock Note', value: orderedPayload.stockNote, multiline: true }
       
      ];
    
      const htmlRows = formRows.map((row) => {
        const safeValue = this.escapeHtml((row.value ?? '').toString().trim() || '-');
    
        let valueStyle = `
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:10px;
          padding:10px 12px;
          color:#0f172a;
        `;
    
        if (row.tone === 'warn') {
          valueStyle = `
            background:#fefce8;
            border:1px solid #fde68a;
            border-radius:10px;
            padding:10px 12px;
            color:#854d0e;
            font-weight:700;
          `;
        }
    
        if (row.tone === 'primary') {
          valueStyle = `
            background:#eff6ff;
            border:1px solid #bfdbfe;
            border-radius:10px;
            padding:10px 12px;
            color:#1d4ed8;
            font-weight:700;
          `;
        }
    
        if (row.multiline) {
          valueStyle += `
            min-height:44px;
            white-space:pre-wrap;
            word-break:break-word;
          `;
        }
    
        return `
          <div style="font-weight:800; color:#334155;">${this.escapeHtml(row.label)}</div>
          <div style="${valueStyle}">${safeValue}</div>
        `;
      }).join('');
    
      Swal.fire({
        title: 'Confirm Stock In Data',
        html: `
          <div style="text-align:left;">
            <div style="
              display:grid;
              grid-template-columns: 180px 1fr;
              gap:10px 12px;
              align-items:start;
              max-height:420px;
              overflow:auto;
              padding:4px 2px;
            ">
              ${htmlRows}
            </div>
          </div>
        `,
        width: '780px',
        showCancelButton: true,
        confirmButtonText: 'Confirm Stock In',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#94a3b8'
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

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      this.focusScanFirst();
    }, 250);
  }

  slotClass(s: SlotRow) {
    const slotId = s.storeCode;
  
    return {
      'slot-card': true,
  
      // base
      'st-rejected': s.status === 'REJECTED',
      'st-empty': s.status !== 'REJECTED' && !this.shouldOrangeHighlight(s),
      'st-occupied': s.status !== 'REJECTED' && this.shouldOrangeHighlight(s),
  
      // selected
      'is-selected': this.selectedSlot?.storeCode === s.storeCode && this.viewMode === 'SLOT',
  
      // special highlight
      'is-move-green': this.isMoveAreaGreen(slotId),
      'is-stockout-green': this.isStockOutGreen(slotId),
      'is-stockout-orange': this.isStockOutOrange(slotId),
    };
  }
  
  private shouldOrangeHighlight(s: SlotRow): boolean {
    if (this.panelMode === 'MOVE_AREA') {
      if (!this.moveSearchItemNo?.trim()) {
        return this.hasAnyMaterialInSlot(s);
      }
      return this.isMoveAreaOrange(s.storeCode);
    }
  
    if (this.panelMode === 'MOVE_AREA_SCAN') {
      if (!this.moveRows.length) {
        return this.hasAnyMaterialInSlot(s);
      }
      return this.isMoveAreaOrange(s.storeCode);
    }
  
    if (this.panelMode === 'STOCK_OUT') {
      return this.isStockOutOrange(s.storeCode);
    }
  
    if (this.panelMode === 'RETURN_STOCK_IN') {
      return this.hasAnyMaterialInSlot(s);
    }
  
    return this.hasAnyMaterialInSlot(s);
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
      ...this.pendingItems.map(m => (m.materialNo || m.itemNo || '').trim()),
      ...this.chemicalItems.map(m => (m.materialNo || m.itemNo || '').trim())
    ].filter(Boolean);

    const uniqueMaterialNos = Array.from(new Set(allMaterialNos));

    this.materialSuggestions = uniqueMaterialNos
      .filter(x => x.toLowerCase().includes(key))
      .slice(0, 8);

    this.showMaterialSuggestions = this.materialSuggestions.length > 0;
  }

  clearMoveAreaPanel() {
    this.moveSearchItemNo = '';
    this.moveRows = [];
    this.moveDestinationArea = '';
    this.oldestMoveReceivedDate = '';
    this.moveForm = {
      itemNo: '',
      itemName: '',
      itemSpec: ''
    };
  
    this.selectedSlot = null;
    this.viewMode = 'NONE';
  
    this.materialSuggestions = [];
    this.showMaterialSuggestions = false;
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
          <div><b>Remark:</b> ${item.remark || '-'}</div>
           <div><b>StockNote:</b> ${item.stockNote || '-'}</div>
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
  this.oldestMoveReceivedDate = '';
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
          itemName: m.itemName || '',
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

  rows.sort((a, b) => this.toSortableTime(a.receivedDate) - this.toSortableTime(b.receivedDate));

  this.moveRows = rows;

  if (rows.length) {
    this.moveForm = {
      itemNo: rows[0].itemNo,
      itemName: rows[0].itemName,
      itemSpec: rows[0].itemSpec
    };

    this.oldestMoveReceivedDate = rows[0].receivedDate || '';
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
          this.fetchStorageMap();
          this.resetStockForm();
        });
      },
      error: (err) => {
        this.isSavingStock = false;

        const rawMessage = err?.error?.message || err?.message || '';

        let displayMessage = 'บันทึก Stock In ไม่สำเร็จ';
      
        if (rawMessage === 'incoming_already') {
          displayMessage = 'มี Incoming นี้อยู่ในระบบแล้ว';
        } else if(rawMessage === 'not_found_this_Material_in_Master'){
          displayMessage = 'ยังไม่มี Material No นี้ใน Material Master';
        } 
        else if (rawMessage) {
          displayMessage = rawMessage;
        } 


        Swal.fire({
          icon: 'error',
          title: 'Stock In Fail',
          text: displayMessage
        });
      }
    });
  }




  // toggleAllStockOutRows(ev: Event) {
  //   const checked = (ev.target as HTMLInputElement)?.checked === true;
  //   this.stockOutRows = this.stockOutRows.map(r => ({ ...r, checked }));
  // }
  




  
  private submitStockOutByProduction(picked?: StockOutRow, denial: boolean = false) {
    // update value for push Denial button
    this.stockOutDenial = denial;

    const body: any = {
      jobId: this.selectedTransactionJob!.id,
      userId: this.userId,
      inchargeTime: new Date().toISOString(),
      mcRemark: (this.stockOutForm.mcRemark || '').trim(),
      denial: this.stockOutDenial
    };
  
    // ส่ง incomingId เฉพาะกรณี stock out ปกติ
    if (!denial) {
      if (!picked?.incomingId) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Incoming',
          text: 'ไม่พบ Incoming ที่เลือกสำหรับทำ Stock Out'
        });
        return;
      }
  
      body.incomingId = picked.incomingId;
    }

  
    this.isSavingStock = true;

    console.log("bodyStockOutByProduction = ", body);
    
    this.http.post(config.apiServer + '/api/mc/stockOutByProduction', body).subscribe({
      next: (res: any) => {
        this.isSavingStock = false;
  
        Swal.fire({
          icon: 'success',
          title: denial ? 'Deny Issue Material Success' : 'Stock Out Success',
          text:  denial
          ? ( 'ยกเลิก การ Issue Material สำเร็จ')
          : ( 'ทำรายการ Stock Out สำเร็จ')
        }).then(() => {
          this.stockOutRows = [];
          
          this.selectedTransactionJob = null;
          this.stockOutRequestJobNo = '';
          this.stockOutSearchItemNo = '';
          this.stockOutForm = {
            itemNo: '',
            itemName: '',
            itemSpec: '',
            mcRemark:  ''
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



  private openIncomingJobScanModal(picked: StockOutRow, denial: boolean = false) {
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


          .swal2-popup .stock-row-hidden {
            position: absolute;
            left: -99999px;
            top: auto;
            width: 1px;
            height: 1px;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
          }




          .swal-scan-status {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 10px 0 12px;
            padding: 9px 12px;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.25);
            background: #f8fafc;
            text-align: left;
          }

          .swal-scan-status.scanning {
            background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
            border-color: rgba(37, 99, 235, 0.28);
          }

          .swal-scan-status.complete {
            background: linear-gradient(180deg, #ecfdf5 0%, #dcfce7 100%);
            border-color: rgba(22, 163, 74, 0.28);
          }

          .swal-scan-status-icon {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 15px;
            background: rgba(100, 116, 139, 0.12);
            color: #64748b;
          }

          .swal-scan-status.scanning .swal-scan-status-icon {
            background: rgba(37, 99, 235, 0.12);
            color: #1d4ed8;
          }

          .swal-scan-status.scanning .swal-scan-status-icon i {
            animation: incomingScanSpin 1s linear infinite;
          }

          .swal-scan-status.complete .swal-scan-status-icon {
            background: rgba(22, 163, 74, 0.14);
            color: #15803d;
          }

          .swal-scan-status-title {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.2;
          }

          .swal-scan-status-subtitle {
            margin-top: 2px;
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            line-height: 1.3;
          }

          @keyframes incomingScanSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

        </style>
  
        <div class="stock-panel">
          <div style="text-align:left; margin-bottom:12px;">
            กรุณาสแกนใบ <b>Material Incoming</b><br>
            ระบบจะตรวจสอบ <b>Job No.</b> ว่าตรงกับรายการที่เลือกหรือไม่
          </div>
  
          <div style="text-align:left; margin-bottom:12px;">
            <b>Selected Incoming Job No:</b> ${this.escapeHtml(picked.jobNo || '-')}
          </div>

          <div id="incomingScanStatus" class="swal-scan-status">
          <div class="swal-scan-status-icon">
            <i id="incomingScanStatusIcon" class="fas fa-qrcode"></i>
          </div>

          <div>
            <div id="incomingScanStatusTitle" class="swal-scan-status-title">
              Ready to scan
            </div>
            <div id="incomingScanStatusSubtitle" class="swal-scan-status-subtitle">
              Please scan Job No. to start incoming verification.
            </div>
          </div>
        </div>
  
          <div class="stock-row">
            <label>Job No.</label>
            <input id="swal-scan-jobno" type="text" autocomplete="off"  placeholder="⌁ Scan QR / Job No." />
          </div>
  
          <div class="stock-row stock-row-hidden"><label>yearMonth</label><input id="swal-scan-yearMonth" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>recivedDate</label><input id="swal-scan-recivedDate" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>inspector</label><input id="swal-scan-inspector" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>UnloadBy</label><input id="swal-scan-unloadBy" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>invoiceOne</label><input id="swal-scan-invoiceOne" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>taxInvNo</label><input id="swal-scan-taxInvNo" type="text" /></div>
          <div class="stock-row"><label>materialNo</label><input id="swal-scan-itemNo" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>unitPrice</label><input id="swal-scan-unitPrice" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>qtyOfPalletPack</label><input id="swal-scan-qtyOfPalletPack" type="text" /></div>
          <div class="stock-row"><label>coil</label><input id="swal-scan-coil" type="text" /></div>
          <div class="stock-row"><label>qtyKgsPcs</label><input id="swal-scan-qtyKgsPcs" type="text" /></div>
          <div class="stock-row"><label>unit</label><input id="swal-scan-unit" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>kgsCoil</label><input id="swal-scan-kgsCoil" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>odCoil</label><input id="swal-scan-odCoil" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>remark</label><input id="swal-scan-remark" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>millSheet</label><input id="swal-scan-millSheet" type="text" /></div>
          <div class="stock-row"><label>Item Name.</label><input id="swal-scan-itemName" type="text" /></div>
          <div class="stock-row"><label>Spec/Dwg</label><input id="swal-scan-specDwg" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>Lot No.</label><input id="swal-scan-lotNo" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>packing</label><input id="swal-scan-quantity" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>rosh</label><input id="swal-scan-rosh" type="text" /></div>
          <div class="stock-row stock-row-hidden"><label>result</label><input id="swal-scan-result" type="text" /></div>
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

        const statusBox = popup.querySelector('#incomingScanStatus') as HTMLElement | null;
        const statusIcon = popup.querySelector('#incomingScanStatusIcon') as HTMLElement | null;
        const statusTitle = popup.querySelector('#incomingScanStatusTitle') as HTMLElement | null;
        const statusSubtitle = popup.querySelector('#incomingScanStatusSubtitle') as HTMLElement | null;


        const updateScanStatus = () => {
          const hasJobNo = !!(jobNoInput?.value || '').trim();
          const hasAmount = !!(amountInput?.value || '').trim();
        
          if (!statusBox || !statusIcon || !statusTitle || !statusSubtitle) return;
        
          statusBox.classList.remove('scanning', 'complete');
        
          if (!hasJobNo) {
            statusIcon.className = 'fas fa-qrcode';
            statusTitle.textContent = 'Ready to scan';
            statusSubtitle.textContent = 'Please scan Job No. to start incoming verification.';
            return;
          }
        
          if (hasJobNo && !hasAmount) {
            statusBox.classList.add('scanning');
            statusIcon.className = 'fas fa-sync-alt';
            statusTitle.textContent = 'Incoming scan in progress...';
            statusSubtitle.textContent = 'Please continue scanning tags until Amount is completed.';
            return;
          }
        
          statusBox.classList.add('complete');
          statusIcon.className = 'fas fa-check-circle';
          statusTitle.textContent = 'Incoming scan complete';
          statusSubtitle.textContent = 'All scan tags have been completed. You can verify now.';
        };
  
        if (confirmBtn) {
          confirmBtn.disabled = true;
        }
  
       
        const toggleVerifyButton = () => {
          if (!confirmBtn || !amountInput) return;

          const hasAmount = !!(amountInput.value || '').trim();
          confirmBtn.disabled = !hasAmount;

          updateScanStatus();
        };
  
        if (jobNoInput) {
          setTimeout(() => {
            jobNoInput.focus();
            jobNoInput.select();
          }, 0);
        
          jobNoInput.addEventListener('input', toggleVerifyButton);
          jobNoInput.addEventListener('change', toggleVerifyButton);
          jobNoInput.addEventListener('keyup', toggleVerifyButton);
        
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
      this.submitStockOutByProduction(picked, denial);
    });
  }







  private confirmStockOutDenial() {
    if (!this.selectedTransactionJob) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Job',
        text: 'ไม่พบข้อมูล Job สำหรับการ Deny'
      });
      return;
    }
  
    Swal.fire({
      icon: 'warning',
      title: 'Confirm Deny',
      html: `
        <div style="text-align:left; line-height:1.9;">
          <div style="margin-bottom:10px;">
            คุณต้องการ <b style="color:#dc2626;">Deny / ยกเลิก Job</b> นี้ใช่หรือไม่
          </div>
  
          <div><b>Request Job No:</b> ${this.escapeHtml(this.selectedTransactionJob.jobNo || '-')}</div>
          <div><b>Material No:</b> ${this.escapeHtml(this.selectedTransactionJob.materialNo || '-')}</div>
          <div><b>Material Name:</b> ${this.escapeHtml(this.selectedTransactionJob.materialName || '-')}</div>
          <div><b>Material Spec:</b> ${this.escapeHtml(this.selectedTransactionJob.materialSpec || '-')}</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Deny',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (!result.isConfirmed) return;
  
      this.submitStockOutByProduction(undefined, true);
    });
  }




  private confirmReturnStockIn() {
    if (!this.selectedTransactionJob) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Job',
        text: 'ไม่พบข้อมูล Job สำหรับการ Deny'
      });
      return;
    }
  
    Swal.fire({
      icon: 'warning',
      title: 'Confirm Deny',
      html: `
        <div style="text-align:left; line-height:1.9;">
          <div style="margin-bottom:10px;">
            คุณต้องการ <b style="color:#dc2626;">Deny / ยกเลิก Job</b> นี้ใช่หรือไม่
          </div>
  
          <div><b>Request Job No:</b> ${this.escapeHtml(this.selectedTransactionJob.jobNo || '-')}</div>
          <div><b>Material No:</b> ${this.escapeHtml(this.selectedTransactionJob.materialNo || '-')}</div>
          <div><b>Material Name:</b> ${this.escapeHtml(this.selectedTransactionJob.materialName || '-')}</div>
          <div><b>Material Spec:</b> ${this.escapeHtml(this.selectedTransactionJob.materialSpec || '-')}</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Deny',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (!result.isConfirmed) return;
  
      this.submitReturnStockIn(true);
    });
  }






  confirmStockOut(denial: boolean = false) {
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
  
    // กรณี Denial: ไม่ต้องเลือก incoming
    if (denial) {
      this.confirmStockOutDenial();
      return;
    }
  
    const selected = this.stockOutRows.filter(r => r.checked);
  
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
  
      this.openIncomingJobScanModal(picked, false);
    });
  }



  private submitReturnStockIn(denial: boolean = false) {
    if (this.isSavingStock) return;
    
    let store: storeMasterRow = {
      id: null,
      name: ''
    };
    if (!denial) {
       store = this.storeMasters.find(x => x.name === this.returnStockForm.storageArea) || { id: null, name: '' }; ;
    
      if (!store?.id) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Storage Area',
          text: 'กรุณาเลือก Storage Area'
        });
        return;
      }

    }

    
    const body = {
      jobNoIncoming: this.returnStockForm.jobNoIncoming,
      jobId: this.selectedTransactionJob?.id,
      storeId: store.id,
      userId: this.userId,
      inchargeTime: new Date().toISOString(),
      stockNote: this.returnStockForm.stockNote || '',
      coil: this.returnStockForm.coil,
      qty: this.returnStockForm.qtyKgsPcs,
      mcRemark: this.returnStockForm.mcRemark,
      denial: denial
    };


    

  
    this.isSavingStock = true;
  
    this.http.post(config.apiServer + '/api/mc/stockInByProduction', body).subscribe({
      next: (res: any) => {
        this.isSavingStock = false;
  
        Swal.fire({
          icon: 'success',
          title: denial ? 'Deny Return Material Success' : 'Return Stock In Success',
          text:  denial  ? ('ยกเลิก การรับคืน Material สำเร็จ') 
          : ('รับคืน Material สำเร็จ')
        }).then(() => {
          this.resetReturnStockForm();
          this.fetchStorageMap();
          this.panelMode = 'TABLE';
        });
      },
      error: (err) => {
        this.isSavingStock = false;
      
        const rawMessage = String(err?.error?.message || err?.message || '').trim();
      
        let displayMessage = denial
          ? 'ยกเลิก การรับคืน Material ไม่สำเร็จ'
          : 'รับคืน Material ไม่สำเร็จ';
      
        if (rawMessage === 'incoming_notFound_inSystem') {
          displayMessage = 'ไม่มี Incoming นี้ในระบบ';
        } else if (rawMessage === 'canNot_returnStockIn_have_material_inStock') {
          displayMessage = 'ไม่สามารถส่งคืน Material ได้ เนื่องจากมี Material นี้ใน Stock';
        } else if (rawMessage === 'this_job_notFound') {
          displayMessage = 'ไม่พบ Job นี้ในระบบ';
        } else if (rawMessage) {
          displayMessage = rawMessage;
        }
      
        Swal.fire({
          icon: 'error',
          title: 'Return Stock In Fail',
          text: displayMessage
        });
      }
    });
  }


  confirmReturnStockAction(denial: boolean = false) {
    if (this.panelMode !== 'RETURN_STOCK_IN') return;


    if(denial){
      this.confirmReturnStockIn()
      return;
    }
  
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
      title: 'Confirm Return Stock In',
      html: `
        <div style="text-align:left;">
          <div style="
            display:grid;
            grid-template-columns: 180px 1fr;
            gap:10px 12px;
            align-items:start;
            max-height: 420px;
            overflow:auto;
            padding: 4px 2px;
          ">
            <div style="font-weight:800; color:#334155;">Request Job No</div>
            <div style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              padding:10px 12px;
              color:#0f172a;
            ">${this.escapeHtml(orderedPayload.requestJobNo || '-')}</div>
    
    
            <div style="font-weight:800; color:#334155;">Request Material No</div>
            <div style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              padding:10px 12px;
              color:#0f172a;
            ">${this.escapeHtml(orderedPayload.itemNo || '-')}</div>

            <div style="font-weight:800; color:#334155;">Job No Incoming</div>
            <div style="
              background:#fefce8;
              border:1px solid #fde68a;
              border-radius:10px;
              padding:10px 12px;
              color:#854d0e;
              font-weight:700;
            ">${this.escapeHtml(orderedPayload.jobNoIncoming || '-')}</div>
    
            <div style="font-weight:800; color:#334155;">Material No</div>
            <div style="
              background:#fefce8;
              border:1px solid #fde68a;
              border-radius:10px;
              padding:10px 12px;
              color:#854d0e;
              font-weight:700;
            ">${this.escapeHtml(orderedPayload.scannedMaterialNo || '-')}</div>
    
            <div style="font-weight:800; color:#334155;">Material Name</div>
            <div style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              padding:10px 12px;
              color:#0f172a;
            ">${this.escapeHtml(orderedPayload.itemName || '-')}</div>
    
            <div style="font-weight:800; color:#334155;">Material Spec</div>
            <div style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              padding:10px 12px;
              color:#0f172a;
            ">${this.escapeHtml(orderedPayload.itemSpec || '-')}</div>
    
            <div style="font-weight:800; color:#334155;">Return Coil</div>
            <div style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              padding:10px 12px;
              color:#0f172a;
            ">${this.escapeHtml((orderedPayload.coil ?? '').toString() || '-')}</div>
    
            <div style="font-weight:800; color:#334155;">Return Qty</div>
            <div style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              padding:10px 12px;
              color:#0f172a;
            ">${this.escapeHtml((orderedPayload.qty ?? '').toString() || '-')}</div>
    
            <div style="font-weight:800; color:#334155;">Storage Area</div>
            <div style="
              background:#eff6ff;
              border:1px solid #bfdbfe;
              border-radius:10px;
              padding:10px 12px;
              color:#1d4ed8;
              font-weight:700;
            ">${this.escapeHtml(orderedPayload.storageArea || '-')}</div>
    
            <div style="font-weight:800; color:#334155;">Stock Note</div>
            <div style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              padding:10px 12px;
              color:#0f172a;
              min-height:44px;
              white-space:pre-wrap;
              word-break:break-word;
            ">${this.escapeHtml(orderedPayload.stockNote || '-')}</div>
          </div>
        </div>
      `,
      width: '760px',
      showCancelButton: true,
      confirmButtonText: 'Confirm Return Stock In',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#94a3b8'
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.submitReturnStockIn(false);
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
      stockNote: '',
      mcRemark: ''
    };


    this.returnStorageAreaScan = '';
    this.returnStorageAreaScanStatus = 'idle';
    this.returnStorageAreaScanMessage = '';

    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      this.focusEl(this.returnScanJobNo);
    }, 250);
  }





  async submitMoveAreaScan() {
    if (!this.moveAreaScanForm.incomingId) {
      this.ignoreMoveAreaScanBlur = true;
    
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Incoming',
        text: 'กรุณา Scan Job No ก่อน',
        returnFocus: false
      });
    
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        active?.blur?.();
    
        const el = this.moveAreaScanJobNo?.nativeElement;
        if (el) {
          el.focus();
          el.select?.();
        }
    
        setTimeout(() => {
          this.ignoreMoveAreaScanBlur = false;
        }, 200);
      }, 120);
    
      return;
    }
    
   
    if (!this.moveAreaScanForm.sourceStoreId) {
      this.ignoreMoveAreaScanBlur = true;
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Source Store',
        text: 'ไม่พบ Source Store ของ Material นี้'
      });

        setTimeout(() => {
          const active = document.activeElement as HTMLElement | null;
          active?.blur?.();
      
          const el = this.moveAreaScanJobNo?.nativeElement;
          if (el) {
            el.focus();
            el.select?.();
          }
      
          setTimeout(() => {
            this.ignoreMoveAreaScanBlur = false;
          }, 200);
        }, 120);
      return;
    }
  
   
    if (!this.moveAreaScanForm.targetStoreId) {
      this.ignoreMoveAreaScanBlur = true;
    
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Destination Store',
        text: 'กรุณา Scan Store Code ปลายทางก่อน',
        returnFocus: false
      });
    
      const trigger = document.activeElement as HTMLElement | null;
      trigger?.blur?.();
    
      setTimeout(() => {
        const el = this.moveAreaScanStoreCode?.nativeElement;
        if (el) {
          el.focus();
          el.select?.();
        }
    
        setTimeout(() => {
          this.ignoreMoveAreaScanBlur = false;
        }, 250);
      }, 200);
    
      return;
    }




  
    if (
      (this.moveAreaScanForm.foundArea || '').trim() ===
      (this.moveAreaScanForm.targetStoreCode || '').trim()
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'Invalid Destination',
        text: 'ปลายทางต้องไม่ใช่ Area เดียวกับต้นทาง'
      });
      return;
    }
  
    if (!this.userId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing User',
        text: 'ไม่พบ userId ของผู้ใช้งาน'
      });
      return;
    }
  
    const body = {
      incomingId: this.moveAreaScanForm.incomingId,
      storeId: this.moveAreaScanForm.sourceStoreId,
      userId: this.userId,
      storeCodeDestination: this.moveAreaScanForm.targetStoreCode,
      stockNote: this.moveAreaScanForm.stockNote || ''
    };
  
    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Confirm Move Area',
      html: `
        <div style="text-align:left; line-height:1.9;">
          <div><b>Job No:</b> ${this.escapeHtml(this.moveAreaScanForm.foundJobNo || '-')}</div>
          <div><b>Source Area:</b> ${this.escapeHtml(this.moveAreaScanForm.foundArea || '-')}</div>
          <div><b>Destination Area:</b> ${this.escapeHtml(this.moveAreaScanForm.targetStoreCode || '-')}</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Move',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    });
  
    if (!confirm.isConfirmed) return;
  
    this.isMovingArea = true;
  
    this.http.post(`${config.apiServer}/api/mc/moveArea`, body).subscribe({
      next: async (res: any) => {
        this.isMovingArea = false;
  
        await Swal.fire({
          icon: 'success',
          title: 'Move Area Success',
          text: 'ย้าย Area เรียบร้อยแล้ว',
          timer: 1400,
          showConfirmButton: false
        });
  
        this.moveAreaScanForm = {
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
          storeCode: '',
          foundJobNo: '',
          foundItemNo: '',
          foundItemName: '',
          foundItemSpec: '',
          foundArea: '',
          incomingId: null,
          sourceStoreId: null,
          targetStoreId: null,
          targetStoreCode: '',
          stockNote: ''
        };
  
        this.moveRows = [];
        this.selectedSlot = null;
        this.viewMode = 'NONE';
  
        this.fetchStorageMap();

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
        setTimeout(() => {
          this.focusEl(this.moveAreaScanJobNo);
        }, 250);
      },
      error: async (err) => {
        this.isMovingArea = false;
  
        let message = 'เกิดข้อผิดพลาดในการย้าย Area';
  
        if (err?.error?.message === 'store_not_found') {
          message = 'ไม่พบ Store ปลายทาง';
        } else if (err?.error?.message === 'old_transaction_not_found') {
          message = 'ไม่พบตำแหน่งเดิมของ Material นี้';
        } else if (err?.error?.message === 'incoming_not_found') {
          message = 'ไม่พบ Incoming นี้ในระบบ';
        } else if (err?.error?.message === 'missing_required_fields') {
          message = 'ข้อมูลส่งไปไม่ครบ';
        } else if (err?.error?.error) {
          message = err.error.error;
        }
  
        await Swal.fire({
          icon: 'error',
          title: 'Move Area Failed',
          text: message
        });
      }
    });
  }




  // ============
  //  outStock
  // ============


  private normalizeValue(value: any): string {
    return (value || '').toString().trim().toLowerCase();
  }



  openTableOutRemarkModal(item: MaterialItem) {
    Swal.fire({
      icon: 'question',
      title: 'Stock Out Remark',
      input: 'textarea',
      inputLabel: 'Remark / Reason',
      inputPlaceholder: 'กรอกเหตุผลสำหรับการ Stock Out Material',
      inputAttributes: {
        'aria-label': 'Remark / Reason'
      },
      showCancelButton: true,
      confirmButtonText: 'Next',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!(value || '').trim()) {
          return 'กรุณากรอก Remark';
        }
        return null;
      }
    }).then((result) => {
      if (!result.isConfirmed) return;
      const remark = (result.value || '').toString().trim();
      this.openTableOutScanModal(item, remark);
    });
  }



  openTableOutScanModal(item: MaterialItem, remark: string) {
    const expectedJobNo = this.normalizeValue(item.jobNo);
  
    Swal.fire({
      title: 'Scan Incoming Material',
      width: 760,
      html: `
        <style>
          .table-out-panel {
            padding-top: 6px;
            max-height: 65vh;
            overflow-y: auto;
          }
          .table-out-row {
            display: grid;
            grid-template-columns: 130px 1fr;
            gap: 10px;
            align-items: center;
            margin-bottom: 8px;
          }
          .table-out-row label {
            font-size: 14px;
            font-weight: 700;
            text-align: left;
          }
          .table-out-row input {
            width: 100%;
            min-height: 38px;
            border-radius: 10px;
            border: 1px solid rgba(2, 6, 23, 0.12);
            padding: 8px 10px;
            outline: none;
          }
          .table-out-row-hidden {
            position: absolute;
            left: -99999px;
            top: auto;
            width: 1px;
            height: 1px;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
          }
          .table-out-note {
            text-align: left;
            font-size: 13px;
            color: #475569;
            margin-bottom: 12px;
            line-height: 1.7;
          }



          .table-out-scan-status {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 10px 0 12px;
            padding: 9px 12px;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.25);
            background: #f8fafc;
            text-align: left;
          }

          .table-out-scan-status.scanning {
            background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
            border-color: rgba(37, 99, 235, 0.28);
          }

          .table-out-scan-status.complete {
            background: linear-gradient(180deg, #ecfdf5 0%, #dcfce7 100%);
            border-color: rgba(22, 163, 74, 0.28);
          }

          .table-out-status-icon {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 15px;
            background: rgba(100, 116, 139, 0.12);
            color: #64748b;
          }

          .table-out-scan-status.scanning .table-out-status-icon {
            background: rgba(37, 99, 235, 0.12);
            color: #1d4ed8;
          }

          .table-out-scan-status.scanning .table-out-status-icon i {
            animation: tableOutScanSpin 1s linear infinite;
          }

          .table-out-scan-status.complete .table-out-status-icon {
            background: rgba(22, 163, 74, 0.14);
            color: #15803d;
          }

          .table-out-status-title {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.2;
          }

          .table-out-status-subtitle {
            margin-top: 2px;
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            line-height: 1.3;
          }

          @keyframes tableOutScanSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        </style>
  
        <div class="table-out-note">
          <div><b>Expected Job No:</b> ${this.escapeHtml(item.jobNo || '-')}</div>
          <div><b>Material No:</b> ${this.escapeHtml(item.materialNo || item.itemNo || '-')}</div>
          <div><b>Item Name:</b> ${this.escapeHtml(item.itemName || item.description || '-')}</div>
          <div><b>Remark:</b> ${this.escapeHtml(remark || '-')}</div>
        </div>


        <div id="tblOutScanStatus" class="table-out-scan-status">
          <div class="table-out-status-icon">
            <i id="tblOutStatusIcon" class="fas fa-qrcode"></i>
          </div>

          <div>
            <div id="tblOutStatusTitle" class="table-out-status-title">
              Ready to scan
            </div>
            <div id="tblOutStatusSubtitle" class="table-out-status-subtitle">
              Please scan Job No. to start the stock out verification.
            </div>
          </div>
        </div>
  
        <div class="table-out-panel">
          <div class="table-out-row">
            <label>Job No.</label>
            <input id="tblOutJobNo" type="text" placeholder="⌁ Scan QR / Job No." />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>yearMonth</label>
            <input id="tblOutYearMonth" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>recivedDate</label>
            <input id="tblOutRecivedDate" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>inspector</label>
            <input id="tblOutInspector" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>UnloadBy</label>
            <input id="tblOutUnloadBy" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>invoiceOne</label>
            <input id="tblOutInvoiceOne" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>taxInvNo</label>
            <input id="tblOutTaxInvNo" type="text" />
          </div>
  
          <div class="table-out-row">
            <label>materialNo</label>
            <input id="tblOutItemNo" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>unitPrice</label>
            <input id="tblOutUnitPrice" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>qtyOfPalletPack</label>
            <input id="tblOutQtyOfPalletPack" type="text" />
          </div>
  
          <div class="table-out-row">
            <label>coil</label>
            <input id="tblOutCoil" type="text" />
          </div>
  
          <div class="table-out-row">
            <label>qtyKgsPcs</label>
            <input id="tblOutQtyKgsPcs" type="text" />
          </div>
  
          <div class="table-out-row">
            <label>Unit</label>
            <input id="tblOutUnit" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>kgsCoil</label>
            <input id="tblOutKgsCoil" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>odCoil</label>
            <input id="tblOutOdCoil" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>remark</label>
            <input id="tblOutRemark" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>millSheet</label>
            <input id="tblOutMillSheet" type="text" />
          </div>
  
          <div class="table-out-row">
            <label>Item Name.</label>
            <input id="tblOutItemName" type="text" />
          </div>
  
          <div class="table-out-row">
            <label>Spec/Dwg</label>
            <input id="tblOutSpecDwg" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>Lot No.</label>
            <input id="tblOutLotNo" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>quantity</label>
            <input id="tblOutQuantity" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>rosh</label>
            <input id="tblOutRosh" type="text" />
          </div>
  
          <div class="table-out-row table-out-row-hidden">
            <label>result</label>
            <input id="tblOutResult" type="text" />
          </div>
  
          <div class="table-out-row">
            <label>supplier</label>
            <input id="tblOutSupplier" type="text" />
          </div>
  
          <div class="table-out-row">
            <label>amount</label>
            <input id="tblOutAmount" type="text" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Verify & Out',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      didOpen: () => {
        const popup = Swal.getPopup();
        if (!popup) return;
  
        const fieldOrder = [
          'tblOutJobNo',
          'tblOutYearMonth',
          'tblOutRecivedDate',
          'tblOutInspector',
          'tblOutUnloadBy',
          'tblOutInvoiceOne',
          'tblOutTaxInvNo',
          'tblOutItemNo',
          'tblOutUnitPrice',
          'tblOutQtyOfPalletPack',
          'tblOutCoil',
          'tblOutQtyKgsPcs',
          'tblOutUnit',
          'tblOutKgsCoil',
          'tblOutOdCoil',
          'tblOutRemark',
          'tblOutMillSheet',
          'tblOutItemName',
          'tblOutSpecDwg',
          'tblOutLotNo',
          'tblOutQuantity',
          'tblOutRosh',
          'tblOutResult',
          'tblOutSupplier',
          'tblOutAmount'
        ];
  
        const focusField = (id: string) => {
          const el = popup.querySelector(`#${id}`) as HTMLInputElement | null;
          if (!el) return;
          el.focus();
          el.select?.();
        };
  
        const jobNoInput = popup.querySelector('#tblOutJobNo') as HTMLInputElement | null;
        const amountInput = popup.querySelector('#tblOutAmount') as HTMLInputElement | null;
        const confirmBtn = Swal.getConfirmButton();
        const statusBox = popup.querySelector('#tblOutScanStatus') as HTMLElement | null;
        const statusIcon = popup.querySelector('#tblOutStatusIcon') as HTMLElement | null;
        const statusTitle = popup.querySelector('#tblOutStatusTitle') as HTMLElement | null;
        const statusSubtitle = popup.querySelector('#tblOutStatusSubtitle') as HTMLElement | null;
  
        const toggleVerifyButton = () => {
          if (!confirmBtn) return;
          const hasJobNo = !!(jobNoInput?.value || '').trim();
          const hasAmount = !!(amountInput?.value || '').trim();
          confirmBtn.disabled = !(hasJobNo && hasAmount);
          updateScanStatus();
        };



        const updateScanStatus = () => {
          const hasJobNo = !!(jobNoInput?.value || '').trim();
          const hasAmount = !!(amountInput?.value || '').trim();
        
          if (!statusBox || !statusIcon || !statusTitle || !statusSubtitle) return;
        
          statusBox.classList.remove('scanning', 'complete');
        
          if (!hasJobNo) {
            statusIcon.className = 'fas fa-qrcode';
            statusTitle.textContent = 'Ready to scan';
            statusSubtitle.textContent = 'Please scan Job No. to start the stock out verification.';
            return;
          }
        
          if (hasJobNo && !hasAmount) {
            statusBox.classList.add('scanning');
            statusIcon.className = 'fas fa-sync-alt';
            statusTitle.textContent = 'Stock out scan in progress...';
            statusSubtitle.textContent = 'Please continue scanning tags until Amount is completed.';
            return;
          }
        
          statusBox.classList.add('complete');
          statusIcon.className = 'fas fa-check-circle';
          statusTitle.textContent = 'Stock out scan complete';
          statusSubtitle.textContent = 'All scan tags have been completed. You can verify now.';
        };
  
        if (confirmBtn) {
          confirmBtn.disabled = true;
        }
  
        fieldOrder.forEach((id, index) => {
          const el = popup.querySelector(`#${id}`) as HTMLInputElement | null;
          if (!el) return;
  
          el.addEventListener('input', toggleVerifyButton);
          el.addEventListener('change', toggleVerifyButton);
          el.addEventListener('keyup', toggleVerifyButton);
  
          el.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (ev.key !== 'Enter') return;
            ev.preventDefault();
  
            const nextId = fieldOrder[index + 1];
            if (nextId) {
              focusField(nextId);
            }
          });
        });
  
        toggleVerifyButton();
        focusField('tblOutJobNo');
      },
      preConfirm: () => {
        const scanJobNo = (document.getElementById('tblOutJobNo') as HTMLInputElement | null)?.value || '';
        const amount = (document.getElementById('tblOutAmount') as HTMLInputElement | null)?.value || '';
  
        if (!scanJobNo.trim() || !amount.trim()) {
          Swal.showValidationMessage('กรุณา รอข้อมูล จากการ Scan');
          return false;
        }
  
        if (this.normalizeValue(scanJobNo) !== expectedJobNo) {
          Swal.showValidationMessage('Job No ที่ scan ไม่ตรงกับ Material ที่เลือก');
          return false;
        }
  
        return {
          jobNo: scanJobNo.trim(),
          amount: amount.trim()
        };
      }
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.submitTableOut(item, remark);
    });
  }



  submitTableOut(item: MaterialItem, remark: string) {
    if (!item?.incomingId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Incoming ID',
        text: 'ไม่พบ incomingId ของ Material นี้'
      });
      return;
    }
  
    if (!this.userId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing User',
        text: 'ไม่พบ userId ของผู้ใช้งาน'
      });
      return;
    }
  
    const body = {
      incomingId: Number(item.incomingId),
      inchargeByUserId: Number(this.userId),
      remark: (remark || '').trim()
    };
  
    this.http.post(`${config.apiServer}/api/mc/stockOutMaterial`, body).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Stock Out Success',
          text: `Material Job No ${item.jobNo || '-'} ถูกนำออกจากระบบแล้ว`,
          timer: 1400,
          showConfirmButton: false
        });
  
        this.fetchStorageMap();
  
        if (this.viewMode === 'SLOT' && this.selectedSlot?.storeCode) {
          const code = this.selectedSlot.storeCode;
          setTimeout(() => {
            const slot = this.slots.find(s => s.storeCode === code) || null;
            this.selectedSlot = slot;
          }, 250);
        }
      },
      error: async (err) => {
        let message = 'เกิดข้อผิดพลาดในการ Stock Out';
  
        if (err?.error?.message === 'missing_required_fields') {
          message = 'ข้อมูลส่งไม่ครบ';
        } else if (err?.error?.message === 'incoming_notFound') {
          message = 'ไม่พบ Incoming นี้ในระบบ';
        } else if (err?.error?.message === 'incoming_in_stockOut_already') {
          message = 'Material นี้ถูก Stock Out ไปแล้ว';
        } else if (err?.error?.message === 'do_not_have_this_incoming_inStore') {
          message = 'ไม่มี Material Incoming นี้ใน Store';
        } else if (err?.error?.error) {
          message = err.error.error;
        } else if (err?.error?.message) {
          message = err.error.message;
        }
  
        await Swal.fire({
          icon: 'error',
          title: 'Stock Out Failed',
          text: message
        });
      }
    });
  }





  private fetchIncomingStockNote(jobNo: string) {
    const normalizedJobNo = (jobNo || '').trim();
    if (!normalizedJobNo) {
      this.returnStockForm.stockNote = '';
      return;
    }
  
    this.http.post<any>(`${config.apiServer}/api/mc/fetchOneIncoming`, {
      jobNo: normalizedJobNo
    }).subscribe({
      next: (res) => {
        this.returnStockForm.stockNote = String(res?.results || '').trim();
      },
      error: async (err) => {
        console.error('fetchIncomingStockNote error:', err);
        this.returnStockForm.stockNote = '';
        await Swal.fire({
                 icon: 'error',
                 title: 'Load StockNote Failed',
                 text: err?.error?.message || err?.error?.error || 'ไม่สามารถโหลดข้อมูล StockNote จากIncoming เดิม ได้'
        });

      }
    });
  }


  toggleMobileAreaStore() {
    this.showMobileAreaStore = !this.showMobileAreaStore;
  }


  private applyDefaultPanelForMobile() {
    if (typeof window === 'undefined') return;
  
    const isMobile = window.innerWidth <= 991.98;
  
    // ถ้ายังเป็นค่า default เดิมค่อยเปลี่ยน
    if (isMobile && this.panelMode === 'TABLE' && !this.selectedTransactionJob) {
      this.panelMode = 'MOVE_AREA_SCAN';
  
      setTimeout(() => {
        this.focusEl(this.moveAreaScanJobNo);
      }, 0);
    }
  }


  previewPbassSync() {
    if (this.isPreviewingPbass || this.isSyncingPbass) return;
    if (!this.validatePbassPreviewDateRange()) return;
  
    this.isPreviewingPbass = true;
    this.pbassPreviewRows = [];
    this.pbassSubmitRows = [];
  
    const startDate = this.toPbassCompactDate(this.pbassSyncForm.fromDate);
    const toDate = this.toPbassCompactDate(this.pbassSyncForm.toDate);
  
    const body = {
      startDate,
      toDate
    };
  
    console.log('PBASS preview body =', body);
  
    this.http.post<any>(`${config.apiServer}/api/mc/stockInPbassPreview`, body).subscribe({
      next: (res) => {
        this.isPreviewingPbass = false;
        this.pbassPreviewRows = Array.isArray(res?.results) ? res.results : [];
  
        Swal.fire({
          icon: 'success',
          title: 'Preview Loaded',
          text: `โหลดข้อมูล Preview สำเร็จ ${this.pbassPreviewRows.length} รายการ`,
          timer: 1200,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.isPreviewingPbass = false;
  
        Swal.fire({
          icon: 'error',
          title: 'Preview Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถโหลดข้อมูล Preview จาก PBASS ได้'
        });
      }
    });
  }
  
  async submitPbassSync() {
    if (this.isSyncingPbass || this.isPreviewingPbass) return;
    if (!this.validatePbassPreviewDateRange()) return;

    this.pbassPreviewRows = [];
  
    if (!this.userId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing User',
        text: 'ไม่พบ userId กรุณา Login ใหม่'
      });
      return;
    }
  
    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Confirm Sync PBASS?',
      html: `
        <div style="text-align:left; line-height:1.8;">
          <div>ระบบจะดึงข้อมูลจาก PBASS และทำ Stock In อัตโนมัติ</div>
          <hr>
          <div><b>From:</b> ${this.escapeHtml(this.pbassSyncForm.fromDate || '-')}</div>
          <div><b>To:</b> ${this.escapeHtml(this.pbassSyncForm.toDate || '-')}</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sync Stock In',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb'
    });
  
    if (!confirm.isConfirmed) return;
  
    this.isSyncingPbass = true;
  
    // ✅ clear เฉพาะ Submit Result ไม่ไปยุ่ง Preview
    this.pbassSubmitRows = [];
  
    const startDate = this.toPbassCompactDate(this.pbassSyncForm.fromDate);
    const toDate = this.toPbassCompactDate(this.pbassSyncForm.toDate);
  
    const body = {
      startDate,
      toDate,
      userId: this.userId
    };
  
    this.http.post<any>(`${config.apiServer}/api/mc/stockInPbassSubmit`, body).subscribe({
      next: async (res) => {
        this.isSyncingPbass = false;
  
        const createdRows = Array.isArray(res?.createdRows) ? res.createdRows : [];
        const skippedRows = Array.isArray(res?.skippedRows) ? res.skippedRows : [];
  
        const successRows = createdRows.map((x: any, index: number) => ({
          ...x,
          index: x.index || (index + 1),
          syncStatus: 'success' as const,
          reason: x.reason || 'success'
        }));
  
        const failRows = skippedRows.map((x: any, index: number) => ({
          ...x,
          index: x.index || (successRows.length + index + 1),
          syncStatus: 'skipped' as const,
          reason: x.reason || 'skipped'
        }));
  
        // ✅ ผลหลัง Sync แยกจาก Preview
        this.pbassSubmitRows = [...successRows, ...failRows];
  
        this.pbassSyncSummary = {
          ...this.pbassSyncSummary,
          pendingCount: Number(res?.totalFromPbass || this.pbassSubmitRows.length || 0),
          successCount: Number(res?.successCount || successRows.length || 0),
          failCount: Number(res?.skippedCount || failRows.length || 0)
        };

        
        this.fetchStoreMaster();
        this.fetchStorageMap();
         // ✅ ดึง Last Sync จาก API หลัง submit สำเร็จ
        this.fetchPbassLastSyncTime();
  
        await Swal.fire({
          icon: 'success',
          title: 'PBASS Sync Completed',
          html: `
            <div style="text-align:left; line-height:1.9;">
              <div><b>Total From PBASS:</b> ${this.pbassSyncSummary.pendingCount}</div>
              <div style="color:#16a34a;"><b>Success:</b> ${this.pbassSyncSummary.successCount}</div>
              <div style="color:#dc2626;"><b>Skipped:</b> ${this.pbassSyncSummary.failCount}</div>
            </div>
          `
        });
      },
      error: async (err) => {
        this.isSyncingPbass = false;
  
        await Swal.fire({
          icon: 'error',
          title: 'PBASS Sync Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถ Sync Stock In จาก PBASS ได้'
        });
      }
    });
  }
  
  private formatDateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  
  private setDefaultPbassDateRange() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    this.pbassSyncForm.fromDate = this.formatDateInput(today);
    this.pbassSyncForm.toDate = this.formatDateInput(today);
  }
  
  private validatePbassPreviewDateRange(): boolean {
    const { fromDate, toDate } = this.pbassSyncForm;
  
    if (!fromDate || !toDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Date Range',
        text: 'กรุณาเลือก From Date และ To Date'
      });
      return false;
    }
  
    if (fromDate > toDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Date Range',
        text: 'From Date ต้องน้อยกว่าหรือเท่ากับ To Date'
      });
      return false;
    }
  
    return true;
  }
  
  clearPbassSyncState() {
    this.pbassPreviewRows = [];
    this.pbassSubmitRows = [];
    this.clearPbassSubmitFilters();
    
    this.pbassSyncSummary = {
      ...this.pbassSyncSummary,
      pendingCount: 0,
      successCount: 0,
      failCount: 0
    };
    this.fetchPbassLastSyncTime();
    this.setDefaultPbassDateRange();
  }
  
  private toPbassCompactDate(value: string): string {
    const raw = String(value || '').trim();
  
    // รองรับ input type="date" ปกติ เช่น 2026-04-08
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw.replace(/-/g, '');
    }
  
    // ถ้าเป็น 20260408 อยู่แล้วก็ส่งกลับตรง ๆ
    if (/^\d{8}$/.test(raw)) {
      return raw;
    }
  
    return raw.replace(/-/g, '').replace(/\s+/g, '');
  }



  private formatDateTimeDisplay(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
  
    return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
  }
  
  getPbassReasonText(reason?: string): string {
    switch ((reason || '').trim()) {
      case 'success':
        return 'Import Success';
  
      case 'incoming_already':
        return 'มี Incoming นี้อยู่แล้ว';
  
      case 'not_found_this_Material_in_Master':
        return 'ไม่พบ Material No ใน Master';
  
      case 'missing_jobNo':
        return 'ไม่มี Job No';
  
      case 'missing_materialNo':
        return 'ไม่มี Material No';
  
      case 'duplicate_jobNo_in_pbass_batch':
        return 'Job No ซ้ำในข้อมูล PBASS รอบนี้';
  
      case 'skipped':
        return 'Skipped';
  
      default:
        return reason || '-';
    }
  }



  fetchPbassLastSyncTime() {
    this.http.get<any>(`${config.apiServer}/api/mc/getSyncTimeStmp`).subscribe({
      next: (res) => {
        const data = res?.results || null;
        this.pbassLastSync = data;
  
        const lastSyncTime = data?.timeStmp
          ? this.formatDateTimeDisplay(new Date(data.timeStmp))
          : '';
  
        this.pbassSyncSummary = {
          ...this.pbassSyncSummary,
          lastSyncTime
        };
      },
      error: (err) => {
        console.error('fetchPbassLastSyncTime error:', err);
  
        this.pbassLastSync = null;
  
        this.pbassSyncSummary = {
          ...this.pbassSyncSummary,
          lastSyncTime: ''
        };
      }
    });
  }


  private getPbassRowKind(row: any): 'Material' | 'Chemical' | 'Not Found' {
    const materialKind = String(row?.materialKind || '').trim();
  
    if (materialKind === 'Material') return 'Material';
    if (materialKind === 'Chemical') return 'Chemical';
    if (materialKind === 'Not Found') return 'Not Found';
  
    if (row?.accountCode === '4520') return 'Material';
    if (row?.accountCode) return 'Chemical';
  
    return 'Not Found';
  }
  
  get pbassSubmitStatusOptions(): Array<'success' | 'skipped'> {
    const rows = this.pbassSubmitRows.filter(row => {
      const reasonOk =
        this.pbassSubmitReasonFilter === 'all' ||
        row.reason === this.pbassSubmitReasonFilter;
  
      const kindOk =
        this.pbassSubmitKindFilter === 'all' ||
        this.getPbassRowKind(row) === this.pbassSubmitKindFilter;
  
      return reasonOk && kindOk;
    });
  
    return Array.from(
      new Set(
        rows
          .map(row => row.syncStatus)
          .filter((x): x is 'success' | 'skipped' => x === 'success' || x === 'skipped')
      )
    );
  }
  
  get pbassSubmitReasonOptions(): string[] {
    const rows = this.pbassSubmitRows.filter(row => {
      const statusOk =
        this.pbassSubmitStatusFilter === 'all' ||
        row.syncStatus === this.pbassSubmitStatusFilter;
  
      const kindOk =
        this.pbassSubmitKindFilter === 'all' ||
        this.getPbassRowKind(row) === this.pbassSubmitKindFilter;
  
      return statusOk && kindOk;
    });
  
    return Array.from(
      new Set(
        rows
          .map(row => String(row.reason || '').trim())
          .filter(Boolean)
      )
    );
  }
  
  get pbassSubmitKindOptions(): Array<'Material' | 'Chemical' | 'Not Found'> {
    const rows = this.pbassSubmitRows.filter(row => {
      const statusOk =
        this.pbassSubmitStatusFilter === 'all' ||
        row.syncStatus === this.pbassSubmitStatusFilter;
  
      const reasonOk =
        this.pbassSubmitReasonFilter === 'all' ||
        row.reason === this.pbassSubmitReasonFilter;
  
      return statusOk && reasonOk;
    });
  
    return Array.from(
      new Set(
        rows.map(row => this.getPbassRowKind(row))
      )
    );
  }
  
  get pbassSubmitRowsView() {
    return this.pbassSubmitRows.filter(row => {
      const statusOk =
        this.pbassSubmitStatusFilter === 'all' ||
        row.syncStatus === this.pbassSubmitStatusFilter;
  
      const reasonOk =
        this.pbassSubmitReasonFilter === 'all' ||
        row.reason === this.pbassSubmitReasonFilter;
  
      const kindOk =
        this.pbassSubmitKindFilter === 'all' ||
        this.getPbassRowKind(row) === this.pbassSubmitKindFilter;
  
      return statusOk && reasonOk && kindOk;
    });
  }
  
  onPbassSubmitFilterChange() {
    if (
      this.pbassSubmitStatusFilter !== 'all' &&
      !this.pbassSubmitStatusOptions.includes(this.pbassSubmitStatusFilter)
    ) {
      this.pbassSubmitStatusFilter = 'all';
    }
  
    if (
      this.pbassSubmitReasonFilter !== 'all' &&
      !this.pbassSubmitReasonOptions.includes(this.pbassSubmitReasonFilter)
    ) {
      this.pbassSubmitReasonFilter = 'all';
    }
  
    if (
      this.pbassSubmitKindFilter !== 'all' &&
      !this.pbassSubmitKindOptions.includes(this.pbassSubmitKindFilter)
    ) {
      this.pbassSubmitKindFilter = 'all';
    }
  }
  
  clearPbassSubmitFilters() {
    this.pbassSubmitStatusFilter = 'all';
    this.pbassSubmitReasonFilter = 'all';
    this.pbassSubmitKindFilter = 'all';
  }





  searchReturnStorageAreaScan() {
    const code = (this.returnStorageAreaScan || '').trim();
  
    this.returnStorageAreaScanStatus = 'idle';
    this.returnStorageAreaScanMessage = '';
  
    if (!code) {
      this.returnStockForm.storageArea = '';
      this.returnStorageAreaScanStatus = 'not-found';
      this.returnStorageAreaScanMessage = 'Please scan or input Storage Area.';
      return;
    }
  
    const found = this.storeMasters.find(a =>
      String(a.name || '').trim().toLowerCase() === code.toLowerCase()
    );
  
    if (!found?.name) {
      this.returnStockForm.storageArea = '';
      this.returnStorageAreaScanStatus = 'not-found';
      this.returnStorageAreaScanMessage = `Area "${code}" not found in Store Master.`;
  
      Swal.fire({
        icon: 'warning',
        title: 'Area Not Found',
        text: `ไม่พบ Storage Area: ${code}`,
        timer: 1400,
        showConfirmButton: false
      });
  
      return;
    }
  
    this.returnStockForm.storageArea = found.name;
    this.returnStorageAreaScan = found.name;
    this.returnStorageAreaScanStatus = 'found';
    this.returnStorageAreaScanMessage = `Found area: ${found.name}`;
  
    this.onChangeStorageArea();
  
    Swal.fire({
      icon: 'success',
      title: 'Area Found',
      text: `เลือก Storage Area: ${found.name}`,
      timer: 1000,
      showConfirmButton: false
    });
  }



  onReturnStorageAreaScanInputChange() {
    this.returnStorageAreaScanStatus = 'idle';
    this.returnStorageAreaScanMessage = '';
  
    if (!this.returnStorageAreaScan?.trim()) {
      this.returnStockForm.storageArea = '';
    }
  }



}