import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

type IssueRequestRow = {
  id: number;
  materialNo: string;
  qty: number;
  destination: string; // machine/area
  priority: 'Normal' | 'Urgent';
  requestBy: string;   // PD-xxx
  requestAt: string;   // ISO string
  status: 'Waiting' | 'Processing' | 'Completed';
  fifoHint?: string;   // e.g. "FIFO#1"
};



@Component({
  selector: 'app-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issue.component.html',
  styleUrl: './issue.component.css'
})
export class IssueComponent {

     // ---- form (mock) ----
  materialNo = 'MATS1';
  qty: number | null = 200;
  destination = 'MC-01';
  priority: 'Normal' | 'Urgent' = 'Normal';
  remark = '';

  // ---- list (mock) ----
  requestsAll: IssueRequestRow[] = [
    {
      id: 1,
      materialNo: 'MATS1',
      qty: 200,
      destination: 'MC-01',
      priority: 'Normal',
      requestBy: 'PD-001',
      requestAt: '2025-12-25 08:00',
      status: 'Waiting',
      fifoHint: 'FIFO#1',
    },
    {
      id: 2,
      materialNo: 'MATS2',
      qty: 500,
      destination: 'MC-03',
      priority: 'Urgent',
      requestBy: 'PD-002',
      requestAt: '2025-12-25 09:30',
      status: 'Waiting',
      fifoHint: 'FIFO#3',
    },
  ];

  // view
  q = '';
  statusFilter: 'all' | IssueRequestRow['status'] = 'all';
  requestsView: IssueRequestRow[] = [];

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    const q = (this.q || '').trim().toLowerCase();
    const s = this.statusFilter;

    this.requestsView = (this.requestsAll || []).filter((x) => {
      if (q) {
        const hit =
          x.materialNo.toLowerCase().includes(q) ||
          x.destination.toLowerCase().includes(q) ||
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

  submitIssueRequest() : void{
    const materialNo = (this.materialNo || '').trim().toUpperCase();
    const destination = (this.destination || '').trim().toUpperCase();
    const qty = Number(this.qty || 0);

    if (!materialNo) {
      Swal.fire('Error', 'กรุณากรอก Material No', 'error');
      return;
    } 
    if (!destination){
      Swal.fire('Error', 'กรุณากรอก Destination', 'error');
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
      destination,
      priority: this.priority,
      requestBy: 'PD-001', // mock
      requestAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: 'Waiting',
      fifoHint: 'FIFO#?',
    });

    this.applyFilters();

    Swal.fire({
      icon: 'success',
      title: 'Created',
      text: `Issue request ${materialNo} (${qty}) ส่งเรียบร้อย`,
      timer: 1200,
      showConfirmButton: false,
    });

    // clear form
    this.remark = '';
  }

  async confirmProcess(row: IssueRequestRow) {
    const r = await Swal.fire({
      title: 'Process request?',
      html: `<div style="text-align:left">
        <div><b>Material:</b> ${row.materialNo}</div>
        <div><b>Qty:</b> ${row.qty}</div>
        <div><b>To:</b> ${row.destination}</div>
      </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Process',
    });

    if (!r.isConfirmed) return;

    row.status = 'Processing';
    this.applyFilters();
  }



}
