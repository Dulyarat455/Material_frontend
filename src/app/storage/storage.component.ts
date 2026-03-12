import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Router,RouterModule } from '@angular/router';

import Swal from 'sweetalert2';
import config from '../../config';


type storeMasterRow = {
  id: number;
  name: string;
};


type SlotStatus = 'OCCUPIED' | 'PARTIAL' | 'EMPTY' | 'REJECTED';

type MaterialItem = {
  matCode: string;
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
};

type SlotRow = {
  id: string;
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

  sourceSlotId: string;
  sourceInvNo: string;
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

  constructor(private http: HttpClient, private router: Router) {}


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


  storeMasters: storeMasterRow[] = []
  isSavingStock = false;



  pendingItems: MaterialItem[] = [
    {
      matCode: 'MATS5',
      description: 'Bolt M10',
      qty: 2000,
      uom: 'pcs',
      invNo: 'INV-010',
      receivedAt: '2025-12-25',
      fifoRank: 1,
      itemNo: 'MATS5',
      itemName: 'Bolt M10',
      itemSpec: 'M10'
    },
    {
      matCode: 'MATS1',
      description: 'SteelRod12mm',
      qty: 600,
      uom: 'pcs',
      invNo: 'INV-011',
      receivedAt: '2025-12-26',
      fifoRank: 2,
      urgent: true,
      itemNo: 'MATS1',
      itemName: 'Steel Rod',
      itemSpec: '12mm'
    },
    {
      matCode: 'MATS6',
      description: 'Paint Can Blue',
      qty: 50,
      uom: 'pcs',
      invNo: 'INV-012',
      receivedAt: '2025-12-27',
      fifoRank: 1,
      itemNo: 'MATS6',
      itemName: 'Paint Can',
      itemSpec: 'Blue'
    }
  ];

  slots: SlotRow[] = [
    {
      id: '3201', zone: 'A', row: 'BTM', status: 'OCCUPIED', usedQty: 500,
      materials: [{
        matCode: 'MATS5', description: 'Bolt M10', qty: 500, uom: 'pcs',
        invNo: 'INV-010', receivedAt: '2025-12-25', fifoRank: 1,
        itemNo: 'MATS5', itemName: 'Bolt M10', itemSpec: 'M10'
      }]
    },
    {
      id: '3202', zone: 'A', row: 'BTM', status: 'OCCUPIED', usedQty: 1500,
      materials: [{
        matCode: 'MATS1', description: 'SteelRod12mm', qty: 1500, uom: 'pcs',
        invNo: 'INV-010', receivedAt: '2025-12-25', fifoRank: 1,
        itemNo: 'MATS1', itemName: 'Steel Rod', itemSpec: '12mm'
      }]
    },
    {
      id: '3203', zone: 'A', row: 'BTM', status: 'OCCUPIED', usedQty: 1200,
      materials: [{
        matCode: 'MATS1', description: 'SteelRod12mm', qty: 1200, uom: 'pcs',
        invNo: 'INV-011', receivedAt: '2025-12-27', fifoRank: 2,
        itemNo: 'MATS1', itemName: 'Steel Rod', itemSpec: '12mm'
      }]
    },
    { id: '3204', zone: 'A', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '3205', zone: 'A', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '3206', zone: 'A', row: 'BTM', status: 'EMPTY', materials: [] },

    { id: '3101', zone: 'B', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '3102', zone: 'B', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '3103', zone: 'B', row: 'TOP', status: 'EMPTY', materials: [] },
    {
      id: '3104', zone: 'B', row: 'TOP', status: 'OCCUPIED', usedQty: 800,
      materials: [{
        matCode: 'MATS2', description: 'Rubber Pad', qty: 800, uom: 'pcs',
        invNo: 'INV-009', receivedAt: '2025-12-20', fifoRank: 1,
        itemNo: 'MATS2', itemName: 'Rubber Pad', itemSpec: 'STD'
      }]
    },
    { id: '3105', zone: 'B', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '3106', zone: 'B', row: 'TOP', status: 'EMPTY', materials: [] },

    {
      id: '2101', zone: 'C', row: 'TOP', status: 'PARTIAL', usedQty: 300,
      materials: [{
        matCode: 'MATS9', description: 'Washer', qty: 300, uom: 'pcs',
        invNo: 'INV-007', receivedAt: '2025-12-18', fifoRank: 1,
        itemNo: 'MATS9', itemName: 'Washer', itemSpec: 'STD'
      }]
    },
    { id: '2102', zone: 'C', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '2103', zone: 'C', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '2104', zone: 'C', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '2105', zone: 'C', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '2106', zone: 'C', row: 'TOP', status: 'EMPTY', materials: [] },

    { id: '2201', zone: 'C', row: 'BTM', status: 'REJECTED', materials: [] },
    { id: '2202', zone: 'C', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '2203', zone: 'C', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '2204', zone: 'C', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '2205', zone: 'C', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '2206', zone: 'C', row: 'BTM', status: 'EMPTY', materials: [] },

    { id: '1101', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1102', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1103', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1104', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1105', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1106', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1107', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1108', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1109', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1110', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },
    { id: '1111', zone: 'D', row: 'TOP', status: 'EMPTY', materials: [] },

    { id: '1201', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1202', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1203', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1204', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1205', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1206', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1207', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1208', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1209', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1210', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
    { id: '1211', zone: 'D', row: 'BTM', status: 'EMPTY', materials: [] },
  ];

  selectedSlot: SlotRow | null = null;

  get totalSlots() { return this.slots.length; }
  get occupiedCount() { return this.slots.filter(s => s.status === 'OCCUPIED').length; }
  get pendingCount() { return this.pendingItems.length; }
  get rejectedCount() { return this.slots.filter(s => s.status === 'REJECTED').length; }


  ngOnInit() {
    this.fetchStoreMaster();
 }




  slotsBy(zone: SlotRow['zone'], row: SlotRow['row']) {
    return this.slots.filter(s => s.zone === zone && s.row === row);
  }

  trackSlot(index: number, s: SlotRow) {
    return s.id;
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
        return ; //stop here 
    }
  }

  setPanelMode(mode: 'TABLE' | 'STOCK_IN' | 'STOCK_OUT' | 'MOVE_AREA') {
    this.panelMode = mode;
    this.stockForm.storageArea = this.selectedSlot?.id || '';

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



  private escapeHtml(value: string): string {
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

      storageArea:  '',
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
      'is-selected': this.selectedSlot?.id === s.id,
      'is-move-highlight': this.isMoveHighlighted(s.id)
    };
  }

  isMoveHighlighted(slotId: string): boolean {
    return this.panelMode === 'MOVE_AREA' &&
      this.moveRows.some(r => r.sourceSlotId === slotId);
  }

  onClickSlot(s: SlotRow) {
    this.viewMode = 'SLOT';
    this.selectedSlot = s;

    if (this.panelMode !== 'TABLE' && this.panelMode !== 'MOVE_AREA') {
      this.stockForm.storageArea = s.id;
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

  searchMoveItem() {
    const key = this.moveSearchItemNo.trim().toLowerCase();

    this.moveRows = [];
    this.moveForm = {
      itemNo: '',
      itemName: '',
      itemSpec: ''
    };

    if (!key) return;

    const rows: MoveRow[] = [];

    this.slots.forEach(slot => {
      slot.materials.forEach((m, index) => {
        const itemNo = (m.itemNo || m.matCode || '').toLowerCase();

        if (itemNo.includes(key)) {
          rows.push({
            uid: `${slot.id}_${index}_${m.invNo}`,
            checked: false,
            area: slot.id,
            receivedDate: m.receivedAt,
            invoice: m.invNo,
            qty: m.qty,
            remark: m.remark || '',
            toArea: '',
            itemNo: m.itemNo || m.matCode || '',
            itemName: m.itemName || m.description || '',
            itemSpec: m.itemSpec || m.description || '',
            sourceSlotId: slot.id,
            sourceInvNo: m.invNo
          });
        }
      });
    });

    this.moveRows = rows;

    if (rows.length) {
      this.moveForm = {
        itemNo: rows[0].itemNo,
        itemName: rows[0].itemName,
        itemSpec: rows[0].itemSpec
      };
    }
  }

  confirmMoveArea() {
    const selected = this.moveRows.filter(r => r.checked && r.toArea);

    if (!selected.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No selection',
        text: 'กรุณาเลือกรายการและกำหนด To Area'
      });
      return;
    }

    selected.forEach(row => {
      const fromSlot = this.slots.find(s => s.id === row.sourceSlotId);
      const toSlot = this.slots.find(s => s.id === row.toArea);

      if (!fromSlot || !toSlot) return;
      if (toSlot.status === 'REJECTED') return;

      const materialIndex = fromSlot.materials.findIndex(m =>
        (m.invNo === row.sourceInvNo) &&
        ((m.itemNo || m.matCode) === row.itemNo)
      );

      if (materialIndex < 0) return;

      const [material] = fromSlot.materials.splice(materialIndex, 1);
      if (!material) return;

      fromSlot.usedQty = Math.max(0, (fromSlot.usedQty || 0) - material.qty);
      fromSlot.status = fromSlot.materials.length ? 'OCCUPIED' : 'EMPTY';

      toSlot.materials = [...toSlot.materials, material];
      toSlot.usedQty = (toSlot.usedQty || 0) + material.qty;
      toSlot.status = 'OCCUPIED';
    });

    Swal.fire({
      icon: 'success',
      title: 'Move completed',
      text: 'ย้าย Area เรียบร้อยแล้ว'
    });

    this.searchMoveItem();
  }

  assignPendingToSlot(p: MaterialItem, slot: SlotRow) {
    if (!slot) return;

    if (slot.status === 'REJECTED') {
      Swal.fire({
        icon: 'warning',
        title: 'Slot rejected',
        text: 'ช่องนี้ถูก Reject ไม่สามารถจัดเก็บได้'
      });
      return;
    }

    this.pendingItems = this.pendingItems.filter(x => x !== p);

    slot.materials = [...(slot.materials || []), { ...p }];
    slot.usedQty = (slot.usedQty || 0) + p.qty;
    slot.status = slot.usedQty > 0 ? 'OCCUPIED' : 'EMPTY';

    this.selectedSlot = slot;
    this.viewMode = 'SLOT';

    if (this.panelMode !== 'TABLE' && this.panelMode !== 'MOVE_AREA') {
      this.stockForm.storageArea = slot.id;
    }

    Swal.fire({
      icon: 'success',
      title: 'Stored',
      text: `จัดเก็บ ${p.matCode} เข้าช่อง ${slot.id} แล้ว`,
      timer: 900,
      showConfirmButton: false
    });
  }

  openQuickStoreSwal(p: MaterialItem) {
    const empty = this.slots.find(s => s.status === 'EMPTY');
    if (!empty) {
      Swal.fire({
        icon: 'info',
        title: 'No empty slot',
        text: 'ไม่มีช่องว่างใน mock ตอนนี้'
      });
      return;
    }

    Swal.fire({
      title: 'Store material',
      icon: 'question',
      html: `<div style="text-align:left">
        <div><b>Material:</b> ${p.matCode}</div>
        <div><b>Qty:</b> ${p.qty} ${p.uom}</div>
        <div><b>Suggested Slot:</b> ${empty.id}</div>
        <div style="color:#64748b; font-size:12px; margin-top:8px;">(mock) กด Confirm เพื่อย้ายจาก Pending → Slot</div>
      </div>`,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
    }).then(r => {
      if (!r.isConfirmed) return;
      this.assignPendingToSlot(p, empty);
    });
  }


  //**********fetch Data ***************************************

  fetchStoreMaster(){

    this.http.get(config.apiServer + '/api/storeMaster/list').subscribe({
      next: (res: any) => {
    this.storeMasters = (res.results || []).map((r: any) => ({
          id: r.id,
          name: r.name,
        }))
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











  onChangeStorageArea() {
    const area = (this.stockForm.storageArea || '').trim();
  
    if (!area) {
      this.selectedSlot = null;
      if (this.viewMode === 'SLOT') {
        this.viewMode = 'NONE';
      }
      return;
    }
  
    const slot = this.slots.find(s => s.id === area);
  
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