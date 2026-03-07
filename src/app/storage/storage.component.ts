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
};

type SlotRow = {
  id: string;
  zone: 'A' | 'B' | 'C' | 'D';
  row: 'TOP' | 'BTM';
  status: SlotStatus;
  usedQty?: number;
  materials: MaterialItem[];
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

  pendingItems: MaterialItem[] = [
    { matCode:'MATS5', description:'Bolt M10', qty:2000, uom:'pcs', invNo:'INV-010', receivedAt:'2025-12-25', fifoRank:1 },
    { matCode:'MATS1', description:'SteelRod12mm', qty:600,  uom:'pcs', invNo:'INV-011', receivedAt:'2025-12-26', fifoRank:2, urgent:true },
    { matCode:'MATS6', description:'Paint Can Blue', qty:50,  uom:'pcs', invNo:'INV-012', receivedAt:'2025-12-27', fifoRank:1 },
  ];

  slots: SlotRow[] = [
    { id:'3201', zone:'A', row:'BTM', status:'OCCUPIED', usedQty:500,  materials:[ { matCode:'MATS5', description:'Bolt M10', qty:500, uom:'pcs', invNo:'INV-010', receivedAt:'2025-12-25', fifoRank:1 } ] },
    { id:'3202', zone:'A', row:'BTM', status:'OCCUPIED', usedQty:1500, materials:[ { matCode:'MATS1', description:'SteelRod12mm', qty:1500, uom:'pcs', invNo:'INV-010', receivedAt:'2025-12-25', fifoRank:1 } ] },
    { id:'3203', zone:'A', row:'BTM', status:'OCCUPIED', usedQty:1200, materials:[ { matCode:'MATS1', description:'SteelRod12mm', qty:1200, uom:'pcs', invNo:'INV-011', receivedAt:'2025-12-27', fifoRank:2 } ] },
    { id:'3204', zone:'A', row:'BTM', status:'EMPTY', materials:[] },
    { id:'3205', zone:'A', row:'BTM', status:'EMPTY', materials:[] },
    { id:'3206', zone:'A', row:'BTM', status:'EMPTY', materials:[] },

    { id:'3101', zone:'B', row:'TOP', status:'EMPTY', materials:[] },
    { id:'3102', zone:'B', row:'TOP', status:'EMPTY', materials:[] },
    { id:'3103', zone:'B', row:'TOP', status:'EMPTY', materials:[] },
    { id:'3104', zone:'B', row:'TOP', status:'OCCUPIED', usedQty:800, materials:[ { matCode:'MATS2', description:'Rubber Pad', qty:800, uom:'pcs', invNo:'INV-009', receivedAt:'2025-12-20', fifoRank:1 } ] },
    { id:'3105', zone:'B', row:'TOP', status:'EMPTY', materials:[] },
    { id:'3106', zone:'B', row:'TOP', status:'EMPTY', materials:[] },

    { id:'2101', zone:'C', row:'TOP', status:'PARTIAL', usedQty:300, materials:[ { matCode:'MATS9', description:'Washer', qty:300, uom:'pcs', invNo:'INV-007', receivedAt:'2025-12-18', fifoRank:1 } ] },
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

  slotClass(s: SlotRow) {
    return {
      'slot-card': true,
      'st-occupied': s.status === 'OCCUPIED',
      'st-partial': s.status === 'PARTIAL',
      'st-empty': s.status === 'EMPTY',
      'st-rejected': s.status === 'REJECTED',
      'is-selected': this.selectedSlot?.id === s.id
    };
  }

  onClickSlot(s: SlotRow) {
    this.viewMode = 'SLOT';
    this.selectedSlot = s;
  }

  onClickPendingArea() {
    this.viewMode = 'PENDING';
    this.selectedSlot = null;
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