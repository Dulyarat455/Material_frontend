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
  qty: number;
  fromArea: string;
  backToArea: string;
  priority: 'Normal' | 'Urgent';
  requestBy: string;
  requestAt: string;
  status: 'Waiting' | 'Complete' | 'Denial';
  remark?: string;
  groupId?: number | null;
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

  materialNo = '';
  materialName = '';
  materialSpec = '';
  qty: number | null = null;
  fromArea = '';
  backToArea = '';
  remark = '';
  priority: 'Normal' | 'Urgent' = 'Normal';

  selectedLine = '';
  selectedMachine = '';

  userId: number | null = null;
  groupId: number | null = null;
  sectionId: number | null = null;
  groupName: string = '';

  isSubmitting = false;
  isLoadingQueue = false;
  isLoadingMachine = false;

  materials: MaterialRow[] = [];
  materialDropdown: MaterialRow[] = [];
  showMaterialDropdown = false;
  selectedMaterialId: number | null = null;

  areas: AreaRow[] = [];
  machinesView: string[] = [];
  lines = ['A', 'B', 'C'];

  requestsAll: ReturnRequestRow[] = [];
  requestsView: ReturnRequestRow[] = [];

  q = '';
  statusFilter: ReturnRequestRow['status'] = 'Waiting';

  ngOnInit() {
    this.userId = this.toNumber(localStorage.getItem('materialStore_userId'));
    this.groupId = this.toNumber(localStorage.getItem('materialStore_groupId'));
    this.sectionId = this.toNumber(localStorage.getItem('materialStore_sectionId'));
    this.groupName = localStorage.getItem('materialStore_groupName')!;

    this.fetchMaterials();
    this.fetchReturnQueueFollowFilter();
  }

  private toNumber(value: any): number | null {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

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
      groupId: this.groupId,
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
        this.fetchReturnQueueFollowFilter();
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

  onStatusFilterChange() {
    this.fetchReturnQueueFollowFilter();
  }

  fetchReturnQueueFollowFilter() {
    this.isLoadingQueue = true;

    let stateJob = 'wait';

    if (this.statusFilter === 'Waiting') {
      stateJob = 'wait';
    } else if (this.statusFilter === 'Complete') {
      stateJob = 'complete';
    } else if (this.statusFilter === 'Denial') {
      stateJob = 'denial';
    } 

    this.http.post<any>(config.apiServer + '/api/reurn/fetchReturnFollowStateJob', {
      stateJob
    }).subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.results) ? res.results : [];

        let filteredRows = rows;

        if (this.groupId != null) {
          const hasGroupField = rows.some((r: any) => r?.groupId != null);

          if (hasGroupField) {
            filteredRows = rows.filter((r: any) => Number(r?.groupId) === Number(this.groupId));
          }
        }

        this.requestsAll = filteredRows.map((r: any) => {
          const rawState = String(r?.state || '').trim().toLowerCase();

          let status: ReturnRequestRow['status'] = 'Waiting';
          if (rawState === 'wait') status = 'Waiting';
          else if (rawState === 'complete') status = 'Complete';
          else if (rawState === 'denial') status = 'Denial';

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
            qty: Number(r?.qty || 0),
            fromArea: r?.areaName || '-',
            backToArea: '',
            priority: String(r?.priority || '').trim().toLowerCase() === 'urgent' ? 'Urgent' : 'Normal',
            requestBy: requestByText,
            requestAt: this.formatDateTime(r?.requestTime),
            status,
            remark: r?.remark || '',
            groupId: r?.groupId ?? null
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

  applyFilters() {
    const q = (this.q || '').trim().toLowerCase();

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

      return true;
    });
  }

  resetFilters() {
    this.q = '';
    this.statusFilter = 'Waiting';
    this.fetchReturnQueueFollowFilter();
  }

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

    row.status = 'Waiting';
    this.applyFilters();
  }

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

  showRemark(row: ReturnRequestRow) {
    const remarkText = (row.remark || '').trim();
    if (!remarkText) return;

    Swal.fire({
      icon: 'info',
      title: 'Return Remark',
      html: `
        <div style="text-align:left; line-height:1.7;">
          <div style="margin-bottom:8px;">
            <b>Job:</b> ${row.jobNo || '-'}
          </div>
          <div style="margin-bottom:8px;">
            <b>Material:</b> ${row.materialNo}
          </div>
          <div style="
            padding:12px;
            border-radius:10px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            color:#0f172a;
            white-space:pre-wrap;
          ">
            ${remarkText}
          </div>
        </div>
      `,
      confirmButtonText: 'Close',
      confirmButtonColor: '#2563eb'
    });
  }
}