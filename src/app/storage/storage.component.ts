import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

type SlotStatus = 'OCCUPIED' | 'PARTIAL' | 'EMPTY' | 'REJECTED';

type MaterialItem = {
  matCode: string;        // MATS1
  description: string;    // SteelRod12mm
  qty: number;
  uom: string;            // pcs
  invNo: string;          // INV-011
  receivedAt: string;     // 2025-12-25
  fifoRank: number;       // 1 = oldest
  urgent?: boolean;
};

type SlotRow = {
  id: string;             // 3201
  zone: 'A' | 'B' | 'C' | 'D';
  row: 'TOP' | 'MID' | 'BTM' | 'OVERFLOW';
  status: SlotStatus;
  usedQty?: number;       // badge number ในช่อง
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
  

     // ====== mock: pending items (ยังไม่จัดเก็บ) ======
  pendingItems: MaterialItem[] = [
    { matCode:'MATS5', description:'Bolt M10', qty:2000, uom:'pcs', invNo:'INV-010', receivedAt:'2025-12-25', fifoRank:1 },
    { matCode:'MATS1', description:'SteelRod12mm', qty:600,  uom:'pcs', invNo:'INV-011', receivedAt:'2025-12-26', fifoRank:2, urgent:true },
    { matCode:'MATS6', description:'Paint Can Blue', qty:50,  uom:'pcs', invNo:'INV-012', receivedAt:'2025-12-27', fifoRank:1 },
  ];

  // ====== mock: storage slots ======
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

    { id:'2101', zone:'C', row:'MID', status:'PARTIAL', usedQty:300, materials:[ { matCode:'MATS9', description:'Washer', qty:300, uom:'pcs', invNo:'INV-007', receivedAt:'2025-12-18', fifoRank:1 } ] },
    { id:'2102', zone:'C', row:'MID', status:'EMPTY', materials:[] },
    { id:'2103', zone:'C', row:'MID', status:'EMPTY', materials:[] },
    { id:'2104', zone:'C', row:'MID', status:'EMPTY', materials:[] },
    { id:'2105', zone:'C', row:'MID', status:'EMPTY', materials:[] },
    { id:'2106', zone:'C', row:'MID', status:'EMPTY', materials:[] },
  ];

  // ====== UI state ======
  selectedSlot: SlotRow | null = null;
  hoveredSlot: SlotRow | null = null;

  // ====== summary cards ======
  get totalSlots() { return this.slots.length; }
  get occupiedCount() { return this.slots.filter(s => s.status === 'OCCUPIED').length; }
  get pendingCount() { return this.pendingItems.length; }
  get rejectedCount() { return this.slots.filter(s => s.status === 'REJECTED').length; }

  // group rows (ตามภาพ)
  zoneRows = [
    { title: 'ZONE A - BTM ROW', zone:'A', row:'BTM' as const },
    { title: 'ZONE B - TOP ROW', zone:'B', row:'TOP' as const },
    { title: 'ZONE C - MIDDLE',  zone:'C', row:'MID' as const },
  ];

  slotsBy(zone: any, row: any) {
    return this.slots.filter(s => s.zone === zone && s.row === row);
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
    this.selectedSlot = s;
  }

  onHoverSlot(s: SlotRow | null) {
    this.hoveredSlot = s;
  }

  // demo: assign pending → slot (mock)
  assignPendingToSlot(p: MaterialItem, slot: SlotRow) {
    if (!slot) return;

    if (slot.status === 'REJECTED') {
      Swal.fire({ icon:'warning', title:'Slot rejected', text:'ช่องนี้ถูก Reject ไม่สามารถจัดเก็บได้' });
      return;
    }

    // remove from pending
    this.pendingItems = this.pendingItems.filter(x => x !== p);

    // push to slot
    slot.materials = [...(slot.materials || []), { ...p }];
    slot.usedQty = (slot.usedQty || 0) + p.qty;
    slot.status = slot.usedQty > 0 ? 'OCCUPIED' : 'EMPTY';

    this.selectedSlot = slot;

    Swal.fire({ icon:'success', title:'Stored', text:`จัดเก็บ ${p.matCode} เข้าช่อง ${slot.id} แล้ว`, timer: 900, showConfirmButton:false });
  }

  openQuickStoreSwal(p: MaterialItem) {
    // เลือก slot ว่างตัวอย่าง (EMPTY ก่อน)
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
