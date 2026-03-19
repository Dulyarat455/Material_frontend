import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import config from '../../config';

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


type MaterialRow = {
  id: number;
  materialNo: string;
  materialName: string;
  materialSpec: string;
}





@Component({
  selector: 'app-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issue.component.html',
  styleUrl: './issue.component.css'
})
export class IssueComponent {
  constructor(private http: HttpClient) {}

  // ---- form ----
  materialNo = 'MATS1';
  qty: number | null = 200;
  destination = 'MC-01';
  priority: 'Normal' | 'Urgent' = 'Normal';
  remark = '';

  materialName = '';
  materialSpec = '';

  selectedLine = 'Line A';
  selectedMachine = '';

  userId: number | null = null;
  isSubmitting = false;

  // ---- mock map สำหรับยิง backend ----
  // ตอนนี้ยัง hardcode ไว้ก่อน เพื่อให้ใช้กับ HTML เดิมได้
  materialMap: Record<string, number> = {
    MATS1: 1,
    MATS2: 2,
    MATS3: 3,
    MATS4: 4,
    MATS5: 5,
    MATS6: 6
  };

  machineAreaMap: Record<string, number> = {
    A1: 1,
    A2: 2,
    A3: 3,
    B1: 4,
    B2: 5,
    B3: 6,
    C1: 7,
    C2: 8
  };

  // ---- list (mock/ui queue เดิม) ----
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

  lines = [
    'Line A',
    'Line B',
    'Line C'
  ];

  machinesByLine: Record<string, string[]> = {
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
  };

  // view
  q = '';
  statusFilter: 'all' | IssueRequestRow['status'] = 'all';
  requestsView: IssueRequestRow[] = [];
  machinesView: string[] = [];

  ngOnInit() {
    this.userId = Number(localStorage.getItem('materialStore_userId')) || null;
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

  submitIssueRequest(): void {
    if (this.isSubmitting) return;

    const materialNo = (this.materialNo || '').trim().toUpperCase();
    const destination = (this.destination || '').trim().toUpperCase();
    const qty = Number(this.qty || 0);

    if (!materialNo) {
      Swal.fire('Error', 'กรุณากรอก Material No', 'error');
      return;
    }

    if (!destination) {
      Swal.fire('Error', 'กรุณากรอก Destination', 'error');
      return;
    }

    if (!qty || qty <= 0) {
      Swal.fire('Error', 'กรุณากรอก Qty ให้ถูกต้อง', 'error');
      return;
    }

    if (!this.selectedMachine) {
      Swal.fire('Error', 'กรุณาเลือก Machine', 'error');
      return;
    }

    if (!this.userId) {
      Swal.fire('Error', 'User not found', 'error');
      return;
    }

    const materialId = this.materialMap[materialNo];
    const areaId = this.machineAreaMap[this.selectedMachine];

    if (!materialId) {
      Swal.fire('Error', `ไม่พบ Material No : ${materialNo} ในระบบ`, 'error');
      return;
    }

    if (!areaId) {
      Swal.fire('Error', `ไม่พบ Area ของ Machine : ${this.selectedMachine}`, 'error');
      return;
    }

    const body = {
      areaId,
      requestByUserId: this.userId,
      materialId,
      remark: this.remark || null,
      priority: this.priority
    };

    this.isSubmitting = true;

    this.http.post(config.apiServer + '/api/issue/create', body).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        const nextId = Math.max(0, ...this.requestsAll.map((x) => x.id)) + 1;

        this.requestsAll.unshift({
          id: res?.data?.id || nextId,
          materialNo,
          qty,
          destination: this.selectedMachine,
          priority: this.priority,
          requestBy: `USER-${this.userId}`,
          requestAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          status: 'Waiting',
          fifoHint: res?.data?.jobNo ? `JOB#${res.data.jobNo}` : 'FIFO#?'
        });

        this.applyFilters();

        Swal.fire({
          icon: 'success',
          title: 'Created',
          text: res?.data?.jobNo
            ? `Issue created success : ${res.data.jobNo}`
            : (res?.message || `Issue request ${materialNo} ส่งเรียบร้อย`),
          timer: 1400,
          showConfirmButton: false,
        });

        // clear form บางส่วน แต่ยังคง line/machine เดิมไว้
        this.remark = '';
      },
      error: (err) => {
        this.isSubmitting = false;

        Swal.fire(
          'Error',
          err?.error?.message || err?.error?.error || err?.message || 'Create issue fail',
          'error'
        );
      }
    });
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

  onLineChange() {
    this.machinesView = this.machinesByLine[this.selectedLine] || [];
    this.selectedMachine = this.machinesView[0] || '';
    this.destination = this.selectedMachine || '';
  }
}