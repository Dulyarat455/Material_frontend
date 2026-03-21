import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import config from '../../config';

type ReturnRequestRow = {
  id: number;
  jobNo: string;
  materialNo: string;
  materialName: string;
  materialSpec: string;
  qty: number; // backend ตอนนี้ยังไม่มี qty -> จะ map เป็น 0 ไปก่อน
  fromArea: string;
  backToArea: string;
  priority: 'Normal' | 'Urgent';
  requestBy: string;
  requestAt: string;
  status: 'Waiting' | 'Processing' | 'Completed';
  remark?: string;
};

type MaterialRow = {
  id: number;
  materialNo: string;
  materialName: string;
  materialSpec: string;
};

type AreaRow = {
  areaId: number;
  areaName: string;
};

@Component({
  selector: 'app-return',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return.component.html',
  styleUrl: './return.component.css'
})
export class ReturnComponent {
  constructor(private http: HttpClient) {}

  // =========================
  // FORM
  // =========================
  materialNo = '';
  materialName = '';
  materialSpec = '';
  qty: number | null = null; // UI only for now
  fromArea = '';
  backToArea = ''; // UI only for now
  remark = '';
  priority: 'Normal' | 'Urgent' = 'Normal';

  selectedLine = '';
  selectedMachine = '';

  userId: number | null = null;
  isSubmitting = false;
  isLoadingQueue = false;
  isLoadingMachine = false;

  // =========================
  // MATERIAL SEARCH
  // =========================
  materials: MaterialRow[] = [];
  materialDropdown: MaterialRow[] = [];
  showMaterialDropdown = false;
  selectedMaterialId: number | null = null;

  // =========================
  // LINE -> MACHINE
  // =========================
  areas: AreaRow[] = [];
  machinesView: string[] = [];
  lines = ['A', 'B', 'C'];

  // =========================
  // QUEUE
  // =========================
  requestsAll: ReturnRequestRow[] = [];
  requestsView: ReturnRequestRow[] = [];

  q = '';
  statusFilter: 'all' | ReturnRequestRow['status'] = 'all';

  ngOnInit() {
    this.userId = Number(localStorage.getItem('materialStore_userId')) || null;
    this.fetchMaterials();
    this.fetchReturnQueueByUserId();
  }

  // =========================
  // MATERIAL
  // =========================
  fetchMaterials() {
    this.http.get<any>(config.apiServer + '/api/material/list').subscribe({
      next: (res) => {
        this.materials = Array.isArray(res?.results) ? res.results : [];
      },
      error: (err) => {
        Swal.fire(
          'Error',
          err?.error?.message || err?.message || 'โหลด Material ไม่สำเร็จ',
          'error'
        );
      }
    });
  }

  onSearchMaterial() {
    const keyword = (this.materialNo || '').trim().toLowerCase();

    if (!keyword) {
      this.materialDropdown = [];
      this.showMaterialDropdown = false;
      this.selectedMaterialId = null;
      this.materialName = '';
      this.materialSpec = '';
      return;
    }

    this.selectedMaterialId = null;

    this.materialDropdown = this.materials
      .filter(m =>
        m.materialNo.toLowerCase().includes(keyword) ||
        m.materialName.toLowerCase().includes(keyword)
      )
      .slice(0, 10);

    this.showMaterialDropdown = this.materialDropdown.length > 0;
  }

  selectMaterial(m: MaterialRow) {
    this.materialNo = m.materialNo;
    this.materialName = m.materialName;
    this.materialSpec = m.materialSpec;
    this.selectedMaterialId = m.id;
    this.showMaterialDropdown = false;
  }

  hideMaterialDropdown() {
    setTimeout(() => {
      this.showMaterialDropdown = false;
    }, 150);
  }

  // =========================
  // LINE -> MACHINE
  // =========================
  onLineChange() {
    this.selectedMachine = '';
    this.fromArea = '';
    this.machinesView = [];
    this.areas = [];

    if (!this.selectedLine) return;

    this.isLoadingMachine = true;

    this.http.post<any>(config.apiServer + '/api/area/filterByLineArea', {
      lineName: this.selectedLine
    }).subscribe({
      next: (res) => {
        this.areas = (res?.results || []).map((x: any) => ({
          areaId: Number(x.areaId),
          areaName: x.areaName
        }));

        this.machinesView = this.areas.map(a => a.areaName);
        this.isLoadingMachine = false;
      },
      error: (err) => {
        this.isLoadingMachine = false;
        Swal.fire(
          'Error',
          err?.error?.message || err?.message || 'โหลด Machine ไม่สำเร็จ',
          'error'
        );
      }
    });
  }

  onMachineChange() {
    this.fromArea = this.selectedMachine || '';
  }

  // =========================
  // CREATE RETURN
  // =========================
  submitReturnRequest(): void {
    if (this.isSubmitting) return;

    const materialNo = (this.materialNo || '').trim().toUpperCase();

    if (!materialNo) {
      Swal.fire('Error', 'กรุณากรอก Material No', 'error');
      return;
    }

    if (!this.selectedMaterialId) {
      Swal.fire('Error', 'กรุณาเลือก Material จากรายการ', 'error');
      return;
    }

    if (!this.selectedLine) {
      Swal.fire('Error', 'กรุณาเลือก Production Line', 'error');
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

    this.http.post<any>(config.apiServer + '/api/return/create', body).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        Swal.fire({
          icon: 'success',
          title: 'Created',
          text: res?.data?.jobNo
            ? `Return created : ${res.data.jobNo}`
            : 'Create success',
          timer: 1200,
          showConfirmButton: false
        });

        this.resetForm();
        this.fetchReturnQueueByUserId();
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire(
          'Error',
          err?.error?.message || err?.message || 'Create return fail',
          'error'
        );
      }
    });
  }

  // =========================
  // FETCH QUEUE
  // =========================
  fetchReturnQueueByUserId() {
    if (!this.userId) {
      this.requestsAll = [];
      this.applyFilters();
      return;
    }

    this.isLoadingQueue = true;

    this.http.post<any>(config.apiServer + '/api/return/fetchReturnByUserId', {
      userId: this.userId
    }).subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.results) ? res.results : [];

        this.requestsAll = rows.map((r: any) => {
          const rawState = String(r?.state || '').toLowerCase();

          let status: ReturnRequestRow['status'] = 'Waiting';
          if (rawState === 'wait') status = 'Waiting';
          else if (rawState === 'processing') status = 'Processing';
          else if (rawState === 'done' || rawState === 'completed') status = 'Completed';

          const requestByText =
            r?.requestUserEmpNo && r?.requestUserName
              ? `${r.requestUserEmpNo} - ${r.requestUserName}`
              : r?.requestUserEmpNo || r?.requestUserName || '-';

          return {
            id: Number(r?.id || 0),
            jobNo: r?.jobNo || '',
            materialNo: r?.materialNo || '-',
            materialName: r?.materialName || '-',
            materialSpec: r?.materialSpec || '-',
            qty: Number(r?.qty || 0), // backend ยังไม่มี qty
            fromArea: r?.areaName || '-',
            backToArea: '',
            priority: String(r?.priority || '').trim().toLowerCase() === 'urgent' ? 'Urgent' : 'Normal',
            requestBy: requestByText,
            requestAt: this.formatDateTime(r?.requestTime),
            status,
            remark: r?.remark || ''
          };
        });

        this.applyFilters();
        this.isLoadingQueue = false;
      },
      error: (err) => {
        this.isLoadingQueue = false;
        Swal.fire(
          'Error',
          err?.error?.message || err?.message || 'โหลด Return Queue ไม่สำเร็จ',
          'error'
        );
      }
    });
  }

  // =========================
  // FILTER
  // =========================
  applyFilters() {
    const q = (this.q || '').trim().toLowerCase();
    const s = this.statusFilter;

    this.requestsView = (this.requestsAll || []).filter((x) => {
      if (q) {
        const hit =
          x.materialNo.toLowerCase().includes(q) ||
          x.materialName.toLowerCase().includes(q) ||
          x.materialSpec.toLowerCase().includes(q) ||
          x.fromArea.toLowerCase().includes(q) ||
          x.requestBy.toLowerCase().includes(q) ||
          x.jobNo.toLowerCase().includes(q);

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

  // =========================
  // ACTION
  // =========================
  async confirmReceive(row: ReturnRequestRow) {
    const r = await Swal.fire({
      title: 'Receive return?',
      html: `
        <div style="text-align:left">
          <div><b>Job:</b> ${row.jobNo || '-'}</div>
          <div><b>Material:</b> ${row.materialNo}</div>
          <div><b>Material Name:</b> ${row.materialName}</div>
          <div><b>From:</b> ${row.fromArea}</div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Receive'
    });

    if (!r.isConfirmed) return;

    row.status = 'Processing';
    this.applyFilters();
  }

  // =========================
  // HELPERS
  // =========================
  resetForm() {
    this.materialNo = '';
    this.materialName = '';
    this.materialSpec = '';
    this.qty = null;
    this.fromArea = '';
    this.backToArea = '';
    this.remark = '';
    this.priority = 'Normal';
    this.selectedLine = '';
    this.selectedMachine = '';
    this.selectedMaterialId = null;
    this.showMaterialDropdown = false;
    this.materialDropdown = [];
    this.areas = [];
    this.machinesView = [];
  }

  formatDateTime(value: any): string {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}