import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  incomingId?: number;   // ✅ เพิ่ม
  storeId?: number;      // ✅ เพิ่ม

};

type SlotRow = {
  storeId?: number; // ✅ เพิ่ม
  storeCode: string;
  zone: 'A' | 'B' | 'C' | 'D';
  row: 'TOP' | 'BTM';
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

  sourceStoreCode: string;
  sourceInvNo: string;

  incomingId: number;   // ✅ เพิ่ม
  storeId: number;      // ✅ เพิ่ม
  stockNote?: string;   // ✅ เพิ่ม
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
    private router: Router
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

  viewMode: 'NONE' | 'SLOT' | 'PENDING' = 'NONE';
  panelMode: 'TABLE' | 'STOCK_IN' | 'STOCK_OUT' | 'MOVE_AREA' = 'TABLE';

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

  moveSearchItemNo = '';
  moveRows: MoveRow[] = [];
  moveForm = {
    itemNo: '',
    itemName: '',
    itemSpec: ''
  };

  storeMasters: storeMasterRow[] = [];
  isSavingStock = false;

  // pending area ยังไม่มี API ตอนนี้ ปล่อย mock ไว้ก่อน
  pendingItems: MaterialItem[] = [
    {
      jobNo: 'JOB-25001',
      materialNo: 'MATS5',
      description: 'Bolt M10',
      qty: 2000,
      uom: 'pcs',
      invNo: 'INV-010',
      receivedAt: '2025-12-25',
      fifoRank: 1,
      coil: 2,
      itemNo: 'MATS5',
      itemName: 'Bolt M10',
      itemSpec: 'M10',
  
      timestmp: '10',
      stockNote: '',
      userId: 1,
      userName: 'Mock User',
      userEmpNo: 'EMP001'
    },
    {
      jobNo: 'JOB-25002',
      materialNo: 'MATS1',
      description: 'SteelRod12mm',
      qty: 600,
      uom: 'pcs',
      invNo: 'INV-011',
      receivedAt: '2025-12-26',
      fifoRank: 2,
      urgent: true,
      coil: 1,
      itemNo: 'MATS1',
      itemName: 'Steel Rod',
      itemSpec: '12mm',
  
      timestmp: '11',
      stockNote: '',
      userId: 1,
      userName: 'Mock User',
      userEmpNo: 'EMP001'
    },
    {
      jobNo: 'JOB-25003',
      materialNo: 'MATS6',
      description: 'Paint Can Blue',
      qty: 50,
      uom: 'pcs',
      invNo: 'INV-012',
      receivedAt: '2025-12-27',
      fifoRank: 1,
      coil: 0,
      itemNo: 'MATS6',
      itemName: 'Paint Can',
      itemSpec: 'Blue',
  
      timestmp: '12',
      stockNote: '',
      userId: 1,
      userName: 'Mock User',
      userEmpNo: 'EMP001'
    }
  ];

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

  get rejectedCount() {
    return this.slots.filter(s => s.status === 'REJECTED').length;
  }

  ngOnInit() {
    this.fetchStoreMaster();
    this.fetchStorageMap();
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
    if (this.panelMode !== 'STOCK_IN' && this.panelMode !== 'STOCK_OUT') return;
    this.focusEl(this.scanJobNo);
  }

  onStockScanEnter(field: StockScanField, ev: any) {
    if (ev?.key === 'Enter') ev.preventDefault();

    if (this.panelMode !== 'STOCK_IN' && this.panelMode !== 'STOCK_OUT') return;

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

  setPanelMode(mode: 'TABLE' | 'STOCK_IN' | 'STOCK_OUT' | 'MOVE_AREA') {
    this.panelMode = mode;
    this.stockForm.storageArea = this.selectedSlot?.storeCode || '';

    if (mode !== 'MOVE_AREA') {
      this.moveRows = [];
      this.moveSearchItemNo = '';
      this.moveForm = {
        itemNo: '',
        itemName: '',
        itemSpec: ''
      };
    }

    if (mode === 'STOCK_IN' || mode === 'STOCK_OUT') {
      setTimeout(() => this.focusScanFirst(), 0);
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

  confirmStockAction() {
    const requiredFields = [
      { key: 'jobNo', label: 'Job No.' },
      { key: 'itemNo', label: 'Material No' },
      { key: 'coil', label: 'Coil' },
      { key: 'qtyKgsPcs', label: 'Qty Kgs/Pcs' },
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
      'is-selected': this.selectedSlot?.storeCode === s.storeCode,
      'is-move-highlight': this.isMoveHighlighted(s.storeCode)
    };
  }

  isMoveHighlighted(slotId: string): boolean {
    return this.panelMode === 'MOVE_AREA' &&
      this.moveRows.some(r => r.sourceStoreCode === slotId);
  }

  onClickSlot(s: SlotRow) {
    this.viewMode = 'SLOT';
    this.selectedSlot = s;

    if (this.panelMode !== 'TABLE' && this.panelMode !== 'MOVE_AREA') {
      this.stockForm.storageArea = s.storeCode;
      setTimeout(() => this.focusScanFirst(), 0);
    }
  }

  onClickPendingArea() {
    this.viewMode = 'PENDING';
    this.selectedSlot = null;

    if (this.panelMode !== 'TABLE' && this.panelMode !== 'MOVE_AREA') {
      this.stockForm.storageArea = '';
      setTimeout(() => this.focusScanFirst(), 0);
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
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#2563eb'
    });
  }

  // ใช้ในโหมด Move Area
  searchMoveItem() {
    // const key = this.moveSearchItemNo.trim().toLowerCase();

    // this.moveRows = [];
    // this.moveForm = {
    //   itemNo: '',
    //   itemName: '',
    //   itemSpec: ''
    // };

    // if (!key) return;

    // const rows: MoveRow[] = [];

    // this.slots.forEach(slot => {
    //   slot.materials.forEach((m, index) => {
    //     const itemNo = (m.itemNo || m.matCode || '').toLowerCase();

    //     if (itemNo.includes(key)) {
    //       rows.push({
    //         uid: `${slot.storeCode}_${index}_${m.invNo}`,
    //         checked: false,
    //         area: slot.storeCode,
    //         receivedDate: m.receivedAt,
    //         invoice: m.invNo,
    //         qty: m.qty,
    //         remark: m.remark || '',
    //         toArea: '',
    //         itemNo: m.itemNo || m.matCode || '',
    //         itemName: m.itemName || m.description || '',
    //         itemSpec: m.itemSpec || m.description || '',
    //         sourceStoreCode: slot.storeCode,
    //         sourceInvNo: m.invNo
    //       });
    //     }
    //   });
    // });

    // this.moveRows = rows;

    // if (rows.length) {
    //   this.moveForm = {
    //     itemNo: rows[0].itemNo,
    //     itemName: rows[0].itemName,
    //     itemSpec: rows[0].itemSpec
    //   };
    // }
  }

  // ใช้ในโหมด Move Area
  confirmMoveArea() {
    // const selected = this.moveRows.filter(r => r.checked && r.toArea);

    // if (!selected.length) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'No selection',
    //     text: 'กรุณาเลือกรายการและกำหนด To Area'
    //   });
    //   return;
    // }

    // selected.forEach(row => {
    //   const fromSlot = this.slots.find(s => s.storeCode === row.sourceStoreCode);
    //   const toSlot = this.slots.find(s => s.storeCode === row.toArea);

    //   if (!fromSlot || !toSlot) return;
    //   if (toSlot.status === 'REJECTED') return;

    //   const materialIndex = fromSlot.materials.findIndex(m =>
    //     (m.invNo === row.sourceInvNo) &&
    //     ((m.itemNo || m.matCode) === row.itemNo)
    //   );

    //   if (materialIndex < 0) return;

    //   const [material] = fromSlot.materials.splice(materialIndex, 1);
    //   if (!material) return;

    //   fromSlot.usedQty = Math.max(0, (fromSlot.usedQty || 0) - material.qty);
    //   fromSlot.status = fromSlot.materials.length ? 'OCCUPIED' : 'EMPTY';

    //   toSlot.materials = [...toSlot.materials, material];
    //   toSlot.usedQty = (toSlot.usedQty || 0) + material.qty;
    //   toSlot.status = 'OCCUPIED';
    // });

    // Swal.fire({
    //   icon: 'success',
    //   title: 'Move completed',
    //   text: 'ย้าย Area เรียบร้อยแล้ว'
    // });

    // this.searchMoveItem();
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

        this.slots = rows.map((r: any) => ({
          storeCode: r.storeCode || '',
          zone: (r.zone || '').toUpperCase() as 'A' | 'B' | 'C' | 'D',
          row: (r.row || '').toUpperCase() as 'TOP' | 'BTM',
          status: this.normalizeSlotStatus(r.status),
          usedQty: Number(r.usedQty || 0),
          materials: (r.materials || []).map((m: any) => ({
            jobNo: m.jobNo || '',
            materialNo: m.materialNo || m.matCode || '',
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
            stockNote: m.stockNote || ''
          }))
        }));

        // ถ้าเลือก slot ค้างอยู่ ให้ sync object ใหม่จาก API
        if (this.selectedSlot?.storeCode) {
          const freshSelected = this.slots.find(s => s.storeCode === this.selectedSlot?.storeCode);
          this.selectedSlot = freshSelected || null;

          if (!freshSelected && this.viewMode === 'SLOT') {
            this.viewMode = 'NONE';
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
    const area = (this.stockForm.storageArea || '').trim();

    if (!area) {
      this.selectedSlot = null;
      if (this.viewMode === 'SLOT') {
        this.viewMode = 'NONE';
      }
      return;
    }

    const slot = this.slots.find(s => s.storeCode === area);

    if (slot) {
      this.selectedSlot = slot;
      this.viewMode = 'SLOT';
    } else {
      this.selectedSlot = null;
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
      userId: 1,
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
}