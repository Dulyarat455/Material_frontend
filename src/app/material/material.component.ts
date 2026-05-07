import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import config from '../../config';

type MaterialRow = {
  id: number;
  materialNo: string;
  materialName: string;
  materialSpec: string;
  accountCode?: string;
  timeStamp?: string;
  status?: string;
};

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material.component.html',
  styleUrl: './material.component.css'
})
export class MaterialComponent implements OnInit {
  materials: MaterialRow[] = [];
  filteredMaterials: MaterialRow[] = [];

  searchText = '';
  fromDate = '';
  toDate = '';

  isLoading = false;
  isSyncing = false;

  role: string = '';
  isAddingMaterial = false;
  isDeletingMaterial = false;
  isExporting = false;



  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('materialStore_role') || '';
    this.fetchMaterialList();
  }

  fetchMaterialList() {
    this.isLoading = true;

    this.http.get<any>(`${config.apiServer}/api/material/list`).subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.results) ? res.results : [];

        this.materials = rows.map((item: any) => ({
          id: Number(item.id),
          materialNo: item.materialNo || '',
          materialName: item.materialName || '',
          materialSpec: item.materialSpec || '',
          accountCode: item.accountCode || '',
          timeStamp: item.timeStamp || '',
          status: item.status || ''
        }));

        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('fetchMaterialList error:', err);
        this.isLoading = false;

        Swal.fire({
          icon: 'error',
          title: 'Load Failed',
          text: err?.error?.message || err?.error?.error || err?.message || 'ไม่สามารถโหลดข้อมูล Material ได้'
        });
      }
    });
  }



  private toDateOnly(value?: string): Date | null {
    if (!value) return null;
  
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
  
    d.setHours(0, 0, 0, 0);
    return d;
  }


  applyFilter() {
    const key = (this.searchText || '').trim().toLowerCase();
  
    const start = this.fromDate ? this.toDateOnly(this.fromDate) : null;
    const end = this.toDate ? this.toDateOnly(this.toDate) : null;
  
    this.filteredMaterials = this.materials.filter((row) => {
      const matchSearch =
        !key ||
        (row.materialNo || '').toLowerCase().includes(key) ||
        (row.materialName || '').toLowerCase().includes(key) ||
        (row.materialSpec || '').toLowerCase().includes(key) ||
        (row.accountCode || '').toLowerCase().includes(key);
  
      const rowDate = this.toDateOnly(row.timeStamp);
  
      const matchFrom =
        !start || (!!rowDate && rowDate >= start);
  
      const matchTo =
        !end || (!!rowDate && rowDate <= end);
  
      return matchSearch && matchFrom && matchTo;
    });
  }

  onSearchChange() {
    this.applyFilter();
  }

  async onClickAddMaterial() {
    if (this.isAddingMaterial) return;
  
    const result = await Swal.fire({
      title: 'Add Material',
      width: 720,
      html: `
        <div class="add-material-swal">
          <div class="add-material-row">
            <label>Material No <span>*</span></label>
            <input id="swalMaterialNo" class="swal2-input add-material-input" placeholder="กรอก Material No" />
          </div>
  
          <div class="add-material-row">
            <label>Material Name <span>*</span></label>
            <input id="swalMaterialName" class="swal2-input add-material-input" placeholder="กรอก Material Name" />
          </div>
  
          <div class="add-material-row">
            <label>Material Spec <span>*</span></label>
            <input id="swalMaterialSpec" class="swal2-input add-material-input" placeholder="กรอก Spec" />
          </div>
  
          <div class="add-material-row">
            <label>Account Code</label>
            <input id="swalAccountCode" class="swal2-input add-material-input" placeholder="เช่น 4520" />
            <div class="add-material-help">
              accountCode = 4520 จะแสดงเป็น Material, ค่าอื่นจะแสดงเป็น Chemical
            </div>
          </div>
        </div>
  
        <style>
          .add-material-swal {
            display: flex;
            flex-direction: column;
            gap: 14px;
            text-align: left;
            padding: 4px 2px;
          }
  
          .add-material-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
  
          .add-material-row label {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            margin: 0;
          }
  
          .add-material-row label span {
            color: #dc2626;
          }
  
          .add-material-input {
            width: 100% !important;
            margin: 0 !important;
            min-height: 42px;
            border-radius: 12px !important;
            border: 1px solid #dbe3ef !important;
            font-size: 14px !important;
            font-weight: 700;
            color: #0f172a;
            box-shadow: none !important;
          }
  
          .add-material-input:focus {
            border-color: #93c5fd !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
          }
  
          .add-material-help {
            color: #64748b;
            font-size: 12px;
            font-weight: 700;
          }
        </style>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Save Material',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      focusConfirm: false,
      didOpen: () => {
        const input = document.getElementById('swalMaterialNo') as HTMLInputElement | null;
        input?.focus();
      },
      preConfirm: () => {
        const materialNo = (document.getElementById('swalMaterialNo') as HTMLInputElement)?.value?.trim() || '';
        const materialName = (document.getElementById('swalMaterialName') as HTMLInputElement)?.value?.trim() || '';
        const materialSpec = (document.getElementById('swalMaterialSpec') as HTMLInputElement)?.value?.trim() || '';
        const accountCode = (document.getElementById('swalAccountCode') as HTMLInputElement)?.value?.trim() || '';
  
        const missing: string[] = [];
  
        if (!materialNo) missing.push('Material No');
        if (!materialName) missing.push('Material Name');
        if (!materialSpec) missing.push('Material Spec');
  
        if (missing.length) {
          Swal.showValidationMessage(`กรุณากรอกข้อมูล: ${missing.join(', ')}`);
          return false;
        }
  
        return {
          materialNo,
          materialName,
          materialSpec,
          accountCode
        };
      }
    });
  
    if (!result.isConfirmed || !result.value) return;
  
    this.isAddingMaterial = true;
  
    const body = {
      materialNo: result.value.materialNo,
      materialName: result.value.materialName,
      materialSpec: result.value.materialSpec,
      accountCode: result.value.accountCode
    };
  
    this.http.post<any>(`${config.apiServer}/api/material/create`, body).subscribe({
      next: async () => {
        this.isAddingMaterial = false;
  
        await Swal.fire({
          icon: 'success',
          title: 'Add Material Success',
          text: 'เพิ่ม Material เรียบร้อยแล้ว',
          timer: 1200,
          showConfirmButton: false
        });
  
        this.fetchMaterialList();
      },
      error: async (err) => {
        this.isAddingMaterial = false;
  
        const message = err?.error?.message || err?.error?.error || err?.message || '';
  
        let text = 'ไม่สามารถเพิ่ม Material ได้';
  
        if (message === 'missing_required_fields') {
          text = 'กรุณากรอก Material No, Material Name และ Material Spec';
        } else if (message === 'Material_already') {
          text = 'Material นี้มีอยู่ในระบบแล้ว';
        } else if (message) {
          text = message;
        }
  
        await Swal.fire({
          icon: 'error',
          title: 'Add Material Failed',
          text
        });
      }
    });
  }

  syncMaterialFromPbass() {
    if (this.isSyncing) return;
  
    Swal.fire({
      title: 'Sync Material ?',
      html: `
        <div style="text-align:left">
          ระบบจะดึงข้อมูล Material จาก PBASS
          <br>• ถ้ายังไม่มีในฐานข้อมูล จะทำการเพิ่มข้อมูล
          <br>• ถ้า Material No เดิม แต่ชื่อหรือ Spec เปลี่ยน จะทำการอัปเดตข้อมูล
          <br>• ถ้าซ้ำครบทั้ง 3 ค่า จะข้ามรายการนั้น
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sync Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (!result.isConfirmed) return;
  
      this.isSyncing = true;
  
      Swal.fire({
        title: 'Syncing Material...',
        html: `
          <div style="font-size:14px;color:#475569">
            กรุณารอสักครู่ ระบบกำลังดึงข้อมูล ตรวจสอบข้อมูลซ้ำ และอัปเดตฐานข้อมูล
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      this.http.get<any>(`${config.apiServer}/api/material/getMaterialByPbass`).subscribe({
        next: (res) => {
          this.isSyncing = false;
  
          const totalFromApi = Number(res?.totalFromApi || 0);
          const validRows = Number(res?.validRows || 0);
          const createdCount = Number(res?.createdCount || 0);
          const updatedCount = Number(res?.updatedCount || 0);
          const duplicateCount = Number(res?.duplicateCount || 0);
          const duplicateInPayloadCount = Number(res?.duplicateInPayloadCount || 0);
          const totalCreateChunks = Number(res?.totalCreateChunks || 0);
          const chunkSize = Number(res?.chunkSize || 0);
  
          const duplicateItems = Array.isArray(res?.duplicateItems) ? res.duplicateItems : [];
          const duplicatePreview = duplicateItems.slice(0, 10);
  
          const updateItems = Array.isArray(res?.updateItems) ? res.updateItems : [];
          const updatePreview = updateItems.slice(0, 10);
  
          Swal.fire({
            icon: 'success',
            title: 'Sync Completed',
            width: 900,
            html: `
              <div style="text-align:left">
                <div style="display:grid;grid-template-columns:180px 1fr;gap:8px 12px;margin-bottom:14px">
                  <div><b>Total From API</b></div><div>${totalFromApi}</div>
                  <div><b>Valid Rows</b></div><div>${validRows}</div>
                  <div><b>Created</b></div><div style="color:#16a34a;font-weight:700">${createdCount}</div>
                  <div><b>Updated</b></div><div style="color:#d97706;font-weight:700">${updatedCount}</div>
                  <div><b>Duplicate In DB</b></div><div style="color:#dc2626;font-weight:700">${duplicateCount}</div>
                </div>
  
                ${
                  updatePreview.length
                    ? `
                      <div style="margin-top:12px">
                        <div style="font-weight:700;margin-bottom:6px">ตัวอย่าง Material ที่ถูกอัปเดต</div>
                        <div style="max-height:220px;overflow:auto;border:1px solid #e2e8f0;border-radius:10px">
                          <table style="width:100%;border-collapse:collapse;font-size:13px">
                            <thead style="background:#fff7ed">
                              <tr>
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0">Material No</th>
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0">Old Name</th>
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0">New Name</th>
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0">Old Spec</th>
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0">New Spec</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${updatePreview.map((x: any) => `
                                <tr>
                                  <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.materialNo || '-'}</td>
                                  <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.oldMaterialName || '-'}</td>
                                  <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.newMaterialName || '-'}</td>
                                  <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.oldMaterialSpec || '-'}</td>
                                  <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.newMaterialSpec || '-'}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                        </div>
                        ${
                          updateItems.length > 10
                            ? `<div style="margin-top:6px;color:#64748b;font-size:12px">แสดง 10 รายการแรกจากทั้งหมด ${updateItems.length} รายการ</div>`
                            : ''
                        }
                      </div>
                    `
                    : ''
                }
  
                ${
                  duplicatePreview.length
                    ? `
                      <div style="margin-top:12px">
                        <div style="font-weight:700;margin-bottom:6px">ตัวอย่าง Material ที่ซ้ำในฐานข้อมูล</div>
                        <div style="max-height:220px;overflow:auto;border:1px solid #e2e8f0;border-radius:10px">
                          <table style="width:100%;border-collapse:collapse;font-size:13px">
                            <thead style="background:#f8fafc">
                              <tr>
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0">Material No</th>
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0">Material Name</th>
                                <th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0">Spec</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${duplicatePreview.map((x: any) => `
                                <tr>
                                  <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.materialNo || '-'}</td>
                                  <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.materialName || '-'}</td>
                                  <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.materialSpec || '-'}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                        </div>
                        ${
                          duplicateItems.length > 10
                            ? `<div style="margin-top:6px;color:#64748b;font-size:12px">แสดง 10 รายการแรกจากทั้งหมด ${duplicateItems.length} รายการ</div>`
                            : ''
                        }
                      </div>
                    `
                    : `
                      <div style="padding:10px 12px;background:#f8fafc;border-radius:10px;color:#475569">
                        ไม่พบรายการซ้ำในฐานข้อมูล
                      </div>
                    `
                }
              </div>
            `
          }).then(() => {
            this.fetchMaterialList();
          });
        },
        error: (err) => {
          this.isSyncing = false;
  
          Swal.fire({
            icon: 'error',
            title: 'Sync Failed',
            html: `
              <div style="text-align:left">
                ${err?.error?.error || err?.error?.message || err?.message || 'เกิดข้อผิดพลาดระหว่าง Sync Material'}
              </div>
            `
          });
        }
      });
    });
  }





  async deleteMaterial(row: MaterialRow) {
    if (this.isDeletingMaterial) return;
  
    if (this.role !== 'admin') {
      Swal.fire({
        icon: 'warning',
        title: 'Permission denied',
        text: 'เฉพาะ Admin เท่านั้นที่สามารถลบ Material ได้'
      });
      return;
    }
  
    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'Delete Material?',
      html: `
        <div style="text-align:left; line-height:1.8;">
          <div>ต้องการลบ Material นี้หรือไม่?</div>
          <hr>
          <div><b>Material No:</b> ${row.materialNo || '-'}</div>
          <div><b>Name:</b> ${row.materialName || '-'}</div>
          <div><b>Spec:</b> ${row.materialSpec || '-'}</div>
          <div><b>Account Code:</b> ${row.accountCode || '-'}</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626'
    });
  
    if (!confirm.isConfirmed) return;
  
    this.isDeletingMaterial = true;
  
    const body = {
      materialId: row.id
    };
  
    this.http.post<any>(`${config.apiServer}/api/material/delete`, body).subscribe({
      next: async () => {
        this.isDeletingMaterial = false;
  
        await Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'ลบ Material เรียบร้อยแล้ว',
          timer: 1000,
          showConfirmButton: false
        });
  
        this.fetchMaterialList();
      },
      error: async (err) => {
        this.isDeletingMaterial = false;
  
        const message = err?.error?.message || err?.error?.error || err?.message || '';
  
        let text = 'ไม่สามารถลบ Material ได้';
  
        if (message === 'missing_required_fields') {
          text = 'ไม่พบ materialId';
        } else if (message === 'Material_not_found') {
          text = 'ไม่พบ Material นี้ หรือถูกลบไปแล้ว';
        } else if (message) {
          text = message;
        }
  
        await Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text
        });
      }
    });
  }



  private getExportPayload() {
    return {
      searchText: this.searchText || '',
      fromDate: this.fromDate || '',
      toDate: this.toDate || ''
    };
  }
  
  exportExcel() {
    if (this.isExporting) return;
  
    this.isExporting = true;
  
    this.http.post(
      `${config.apiServer}/api/material/exportExcel`,
      this.getExportPayload(),
      { responseType: 'blob' }
    ).subscribe({
      next: (blob: Blob) => {
        const file = new Blob([blob], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
  
        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
  
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
  
        const filename =
          `material_master_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;
  
        a.href = url;
        a.download = filename;
        a.click();
  
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: async (err) => {
        console.error('exportExcel error:', err);
        this.isExporting = false;
  
        await Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถ export excel ได้'
        });
      }
    });
  }





  formatDateTime(value?: string): string {
    if (!value) return '-';

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');

    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }

  trackByMaterial(index: number, row: MaterialRow) {
    return row.id || index;
  }




  onDateFilterChange() {
    if (this.fromDate && this.toDate && this.fromDate > this.toDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Date Range',
        text: 'From Date ต้องน้อยกว่าหรือเท่ากับ To Date'
      });
  
      this.toDate = '';
      this.applyFilter();
      return;
    }
  
    this.applyFilter();
  }


  clearMaterialFilters() {
    this.searchText = '';
    this.fromDate = '';
    this.toDate = '';
    this.applyFilter();
  }


}