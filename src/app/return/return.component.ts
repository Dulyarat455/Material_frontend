import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


type ReturnRequestRow = {
  id: number;
  materialNo: string;
  qty: number;
  fromArea: string;   // PD/machine
  backToArea: string; // storage area (optional)
  priority: 'Normal' | 'Urgent';
  requestBy: string;
  requestAt: string;
  status: 'Waiting' | 'Processing' | 'Completed';
  remark?: string;      // e.g. "Returning FIFO batch B001"
};



@Component({
  selector: 'app-return',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return.component.html',
  styleUrl: './return.component.css'
})
export class ReturnComponent {

  materialNo = 'MATS1';
  qty: number | null = 80;
  fromArea = 'MC-02';
  backToArea = ''; // optional
  remark = '';
  materialName = ''
  materialSpec = ''
  priority = 'Normal'

  selectedLine = 'Line A'
  selectedMachine = ''

  requestsAll: ReturnRequestRow[] = [
    {
      id: 11,
      materialNo: 'MATS1',
      qty: 80,
      fromArea: 'MC-02',
      backToArea: '',
      requestBy: 'PD-001',
      requestAt: '2025-12-25 14:00',
      status: 'Waiting',
      remark: 'Returning FIFO batch B001',
      priority: 'Normal'
    },
  ];




  lines = [
    'Line A',
    'Line B',
    'Line C'
  ]
  
  machinesByLine: Record<string,string[]> = {
  
    'Line A': [
      'A1',
      'A2',
      'A3'
    ],
  
    'Line B': [
      'B1',
      'B2',
      'B3'
    ],
  
    'Line C': [
      'C1',
      'C2'
    ]
  
  }

  q = '';
  statusFilter: 'all' | ReturnRequestRow['status'] = 'all';
  requestsView: ReturnRequestRow[] = [];
  machinesView: string[] = []

  ngOnInit() {
    this.onLineChange();
    this.applyFilters();
  }

  applyFilters() {
    const q = (this.q || '').trim().toLowerCase();
    const s = this.statusFilter;

    this.requestsView = (this.requestsAll || []).filter((x) => {
      if (q) {
        const hit =
          x.materialNo.toLowerCase().includes(q) ||
          x.fromArea.toLowerCase().includes(q) ||
          x.requestBy.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (s !== 'all' && x.status !== s) return false;
      return true;
    });
  }

  resetFilters() {
    this.q = '';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  submitReturnRequest(): void  {
    const materialNo = (this.materialNo || '').trim().toUpperCase();
    const fromArea = (this.fromArea || '').trim().toUpperCase();
    const qty = Number(this.qty || 0);

    if (!materialNo)  {
      Swal.fire('Error', 'กรุณากรอก Material No', 'error');
      return;
    }
    if (!fromArea) {
      Swal.fire('Error', 'กรุณากรอก From Area', 'error');
      return;
      
    }
    if (!qty || qty <= 0){
       Swal.fire('Error', 'กรุณากรอก Qty ให้ถูกต้อง', 'error');
      return;
    }

    const nextId = Math.max(0, ...this.requestsAll.map((x) => x.id)) + 1;

    this.requestsAll.unshift({
      id: nextId,
      materialNo,
      qty,
      fromArea,
      backToArea: (this.backToArea || '').trim().toUpperCase(),
      requestBy: 'PD-001',
      requestAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: 'Waiting',
      remark: (this.remark || '').trim(),
      priority: 'Normal'
    });

    this.applyFilters();

    Swal.fire({
      icon: 'success',
      title: 'Created',
      text: `Return request ${materialNo} (${qty}) ส่งเรียบร้อย`,
      timer: 1200,
      showConfirmButton: false,
    });

    this.remark = '';
  }

  async confirmReceive(row: ReturnRequestRow) {
    const r = await Swal.fire({
      title: 'Receive return?',
      html: `<div style="text-align:left">
        <div><b>Material:</b> ${row.materialNo}</div>
        <div><b>Qty:</b> ${row.qty}</div>
        <div><b>From:</b> ${row.fromArea}</div>
      </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Receive',
    });

    if (!r.isConfirmed) return;

    row.status = 'Processing';
    this.applyFilters();
  }


  onLineChange(){

    this.machinesView =
      this.machinesByLine[this.selectedLine] || []
  
    this.selectedMachine =
      this.machinesView[0] || ''
  
  }





}
