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
  destination: string;
  priority: 'Normal' | 'Urgent';
  requestBy: string;
  requestAt: string;
  status: 'Waiting' | 'Processing' | 'Completed';
  fifoHint?: string;
};

type MaterialRow = {
  id: number;
  materialNo: string;
  materialName: string;
  materialSpec: string;
};

@Component({
  selector: 'app-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issue.component.html',
  styleUrl: './issue.component.css'
})
export class IssueComponent {
  constructor(private http: HttpClient) {}

  // =========================
  // FORM
  // =========================
  materialNo = '';
  materialName = '';
  materialSpec = '';
  qty: number | null = null;
  destination = '';
  priority: 'Normal' | 'Urgent' = 'Normal';
  remark = '';

  selectedLine = '';
  selectedMachine = '';

  userId: number | null = null;
  isSubmitting = false;

  // =========================
  // MATERIAL (SEARCH)
  // =========================
  materials: MaterialRow[] = [];
  materialDropdown: MaterialRow[] = [];
  showMaterialDropdown = false;
  selectedMaterialId: number | null = null;

  // =========================
  // AREA (LINE → MACHINE)
  // =========================
  areas: { areaId: number; areaName: string }[] = [];
  machinesView: string[] = [];

  lines = ['A', 'B', 'C'];

  // =========================
  // UI LIST (queue เดิม)
  // =========================
  requestsAll: IssueRequestRow[] = [];
  requestsView: IssueRequestRow[] = [];

  q = '';
  statusFilter: 'all' | IssueRequestRow['status'] = 'all';

  // =========================
  // INIT
  // =========================
  ngOnInit() {
    this.userId = Number(localStorage.getItem('materialStore_userId')) || null;

    this.fetchMaterials();
    this.applyFilters();
  }

  // =========================
  // FETCH MATERIAL
  // =========================
  fetchMaterials() {
    this.http.get<any>(config.apiServer + '/api/material/list').subscribe({
      next: (res) => {
        this.materials = res?.results || [];
      },
      error: () => {
        Swal.fire('Error', 'โหลด Material ไม่สำเร็จ', 'error');
      }
    });
  }

  // =========================
  // SEARCH MATERIAL
  // =========================
  onSearchMaterial() {
    const keyword = (this.materialNo || '').toLowerCase();

    if (!keyword) {
      this.materialDropdown = [];
      this.showMaterialDropdown = false;
      return;
    }

    this.materialDropdown = this.materials
      .filter(m => m.materialNo.toLowerCase().includes(keyword))
      .slice(0, 10);

    this.showMaterialDropdown = true;
  }

  selectMaterial(m: MaterialRow) {
    this.materialNo = m.materialNo;
    this.materialName = m.materialName;
    this.materialSpec = m.materialSpec;
    this.selectedMaterialId = m.id;

    this.showMaterialDropdown = false;
  }

  // =========================
  // LINE → MACHINE
  // =========================
  onLineChange() {
    this.selectedMachine = '';
    this.machinesView = [];
    this.areas = [];

    if (!this.selectedLine) return;

    this.http.post<any>(config.apiServer + '/api/area/filterByLineArea', {
      lineName: this.selectedLine
    }).subscribe({
      next: (res) => {
        this.areas = res?.results || [];
        this.machinesView = this.areas.map(a => a.areaName);
      },
      error: () => {
        Swal.fire('Error', 'โหลด Machine ไม่สำเร็จ', 'error');
      }
    });
  }

  // =========================
  // SUBMIT ISSUE
  // =========================
  submitIssueRequest(): void {
    if (this.isSubmitting) return;

    const materialNo = (this.materialNo || '').trim().toUpperCase();
    const qty = Number(this.qty || 0);

    if (!materialNo) {
      Swal.fire('Error', 'กรุณากรอก Material No', 'error');
      return;
    }

    if (!this.selectedMaterialId) {
      Swal.fire('Error', 'กรุณาเลือก Material จากรายการ', 'error');
      return;
    }

    if (!this.selectedMachine) {
      Swal.fire('Error', 'กรุณาเลือก Machine', 'error');
      return;
    }

    if (!qty || qty <= 0) {
      Swal.fire('Error', 'กรุณากรอก Qty ให้ถูกต้อง', 'error');
      return;
    }

    if (!this.userId) {
      Swal.fire('Error', 'User not found', 'error');
      return;
    }

    const areaObj = this.areas.find(a => a.areaName === this.selectedMachine);
    const areaId = areaObj?.areaId;

    if (!areaId) {
      Swal.fire('Error', 'ไม่พบ Area', 'error');
      return;
    }

    const body = {
      areaId,
      requestByUserId: this.userId,
      materialId: this.selectedMaterialId,
      remark: this.remark || null,
      priority: this.priority
    };

    this.isSubmitting = true;

    this.http.post(config.apiServer + '/api/issue/create', body).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        const nextId = Math.max(0, ...this.requestsAll.map(x => x.id)) + 1;

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
            ? `Issue created : ${res.data.jobNo}`
            : 'Create success',
          timer: 1200,
          showConfirmButton: false
        });

        // reset form
        this.materialNo = '';
        this.materialName = '';
        this.materialSpec = '';
        this.qty = null;
        this.remark = '';
        this.selectedMaterialId = null;
      },
      error: (err) => {
        this.isSubmitting = false;

        Swal.fire(
          'Error',
          err?.error?.message || err?.message || 'Create issue fail',
          'error'
        );
      }
    });
  }

  // =========================
  // FILTER (queue เดิม)
  // =========================
  applyFilters() {
    const q = (this.q || '').toLowerCase();
    const s = this.statusFilter;

    this.requestsView = (this.requestsAll || []).filter(x => {
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

  async confirmProcess(row: IssueRequestRow) {
    const r = await Swal.fire({
      title: 'Process request?',
      html: `
        <div style="text-align:left">
          <div><b>Material:</b> ${row.materialNo}</div>
          <div><b>Qty:</b> ${row.qty}</div>
          <div><b>To:</b> ${row.destination}</div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Process'
    });

    if (!r.isConfirmed) return;

    row.status = 'Processing';
    this.applyFilters();
  }
}