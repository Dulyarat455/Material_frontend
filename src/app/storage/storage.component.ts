import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

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

@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.css'
})
export class StorageComponent {
  viewMode: 'NONE' | 'SLOT' | 'PENDING' = 'NONE';
  panelMode: 'TABLE' | 'STOCK_IN' | 'STOCK_OUT' | 'MOVE_AREA' = 'TABLE';

  stockForm = {
    itemNo: '',
    itemName: '',
    specDwg: '',
    lotNo: '',
    quantity: '',
    storageArea: '',
    stockNote: ''
  };

  moveSearchItemNo = '';
  moveRows: MoveRow[] = [];
  moveForm = {
    itemNo: '',
    itemName: '',
    itemSpec: ''
  };

  pendingItems: MaterialItem[] = [
    {
      matCode:'MATS5',
      description:'Bolt M10',
      qty:2000,
      uom:'pcs',
      invNo:'INV-010',
      receivedAt:'2025-12-25',
      fifoRank:1,
      itemNo:'MATS5',
      itemName:'Bolt M10',
      itemSpec:'M10'
    },
    {
      matCode:'MATS1',
      description:'SteelRod12mm',
      qty:600,
      uom:'pcs',
      invNo:'INV-011',
      receivedAt:'2025-12-26',
      fifoRank:2,
      urgent:true,
      itemNo:'MATS1',
      itemName:'Steel Rod',
      itemSpec:'12mm'
    },
    {
      matCode:'MATS6',
      description:'Paint Can Blue',
      qty:50,
      uom:'pcs',
      invNo:'INV-012',
      receivedAt:'2025-12-27',
      fifoRank:1,
      itemNo:'MATS6',
      itemName:'Paint Can',
      itemSpec:'Blue'
    },
  ];

  slots: SlotRow[] = [
    {
      id:'3201', zone:'A', row:'BTM', status:'OCCUPIED', usedQty:500,
      materials:[{
        matCode:'MATS5', description:'Bolt M10', qty:500, uom:'pcs',
        invNo:'INV-010', receivedAt:'2025-12-25', fifoRank:1,
        itemNo:'MATS5', itemName:'Bolt M10', itemSpec:'M10'
      }]
    },
    {
      id:'3202', zone:'A', row:'BTM', status:'OCCUPIED', usedQty:1500,
      materials:[{
        matCode:'MATS1', description:'SteelRod12mm', qty:1500, uom:'pcs',
        invNo:'INV-010', receivedAt:'2025-12-25', fifoRank:1,
        itemNo:'MATS1', itemName:'Steel Rod', itemSpec:'12mm'
      }]
    },
    {
      id:'3203', zone:'A', row:'BTM', status:'OCCUPIED', usedQty:1200,
      materials:[{
        matCode:'MATS1', description:'SteelRod12mm', qty:1200, uom:'pcs',
        invNo:'INV-011', receivedAt:'2025-12-27', fifoRank:2,
        itemNo:'MATS1', itemName:'Steel Rod', itemSpec:'12mm'
      }]
    },
    { id:'3204', zone:'A', row:'BTM', status:'EMPTY', materials:[] },
    { id:'3205', zone:'A', row:'BTM', status:'EMPTY', materials:[] },
    { id:'3206', zone:'A', row:'BTM', status:'EMPTY', materials:[] },

    { id:'3101', zone:'B', row:'TOP', status:'EMPTY', materials:[] },
    { id:'3102', zone:'B', row:'TOP', status:'EMPTY', materials:[] },
    { id:'3103', zone:'B', row:'TOP', status:'EMPTY', materials:[] },
    {
      id:'3104', zone:'B', row:'TOP', status:'OCCUPIED', usedQty:800,
      materials:[{
        matCode:'MATS2', description:'Rubber Pad', qty:800, uom:'pcs',
        invNo:'INV-009', receivedAt:'2025-12-20', fifoRank:1,
        itemNo:'MATS2', itemName:'Rubber Pad', itemSpec:'STD'
      }]
    },
    { id:'3105', zone:'B', row:'TOP', status:'EMPTY', materials:[] },
    { id:'3106', zone:'B', row:'TOP', status:'EMPTY', materials:[] },

    {
      id:'2101', zone:'C', row:'TOP', status:'PARTIAL', usedQty:300,
      materials:[{
        matCode:'MATS9', description:'Washer', qty:300, uom:'pcs',
        invNo:'INV-007', receivedAt:'2025-12-18', fifoRank:1,
        itemNo:'MATS9', itemName:'Washer', itemSpec:'STD'
      }]
    },
    { id:'2102', zone:'C', row:'TOP', status:'EMPTY', materials:[] },
    { id:'2103', zone:'C', row:'TOP', status:'EMPTY', materials:[] },
    { id:'2104', zone:'C', row:'TOP', status:'EMPTY', materials:[] },
    { id:'2105', zone:'C', row:'TOP', status:'EMPTY', materials:[] },
    { id:'2106', zone:'C', row:'TOP', status:'EMPTY', materials:[] },

    { id:'2201', zone:'C', row:'BTM', status:'REJECTED', materials:[] },
    { id:'2202', zone:'C', row:'BTM', status:'EMPTY', materials:[] },
    { id:'2203', zone:'C', row:'BTM', status:'EMPTY', materials:[] },
    { id:'2204', zone:'C', row:'BTM', status:'EMPTY', materials:[] },
    { id:'2205', zone:'C', row:'BTM', status:'EMPTY', materials:[] },
    { id:'2206', zone:'C', row:'BTM', status:'EMPTY', materials:[] },

    { id:'1101', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1102', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1103', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1104', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1105', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1106', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1107', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1108', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1109', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1110', zone:'D', row:'TOP', status:'EMPTY', materials:[] },
    { id:'1111', zone:'D', row:'TOP', status:'EMPTY', materials:[] },

    { id:'1201', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1202', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1203', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1204', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1205', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1206', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1207', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1208', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1209', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1210', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
    { id:'1211', zone:'D', row:'BTM', status:'EMPTY', materials:[] },
  ];

  selectedSlot: SlotRow | null = null;

  get totalSlots() { return this.slots.length; }
  get occupiedCount() { return this.slots.filter(s => s.status === 'OCCUPIED').length; }
  get pendingCount() { return this.pendingItems.length; }
  get rejectedCount() { return this.slots.filter(s => s.status === 'REJECTED').length; }

  slotsBy(zone: SlotRow['zone'], row: SlotRow['row']) {
    return this.slots.filter(s => s.zone === zone && s.row === row);
  }

  trackSlot(index: number, s: SlotRow) {
    return s.id;
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
  }

  resetStockForm() {
    this.stockForm = {
      itemNo: '',
      itemName: '',
      specDwg: '',
      lotNo: '',
      quantity: '',
      storageArea: this.selectedSlot?.id || '',
      stockNote: ''
    };
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
    }
  }

  onClickPendingArea() {
    this.viewMode = 'PENDING';
    this.selectedSlot = null;

    if (this.panelMode !== 'TABLE' && this.panelMode !== 'MOVE_AREA') {
      this.stockForm.storageArea = '';
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
            itemNo: m.itemNo || m.matCode,
            itemName: m.itemName || m.description,
            itemSpec: m.itemSpec || m.description,
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
      Swal.fire({ icon:'warning', title:'Slot rejected', text:'ช่องนี้ถูก Reject ไม่สามารถจัดเก็บได้' });
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
      icon:'success',
      title:'Stored',
      text:`จัดเก็บ ${p.matCode} เข้าช่อง ${slot.id} แล้ว`,
      timer: 900,
      showConfirmButton:false
    });
  }

  openQuickStoreSwal(p: MaterialItem) {
    const empty = this.slots.find(s => s.status === 'EMPTY');
    if (!empty) {
      Swal.fire({ icon:'info', title:'No empty slot', text:'ไม่มีช่องว่างใน mock ตอนนี้' });
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
}