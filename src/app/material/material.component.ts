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

  isLoading = false;
  isSyncing = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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

  applyFilter() {
    const key = (this.searchText || '').trim().toLowerCase();

    if (!key) {
      this.filteredMaterials = [...this.materials];
      return;
    }

    this.filteredMaterials = this.materials.filter((row) => {
      return (
        (row.materialNo || '').toLowerCase().includes(key) ||
        (row.materialName || '').toLowerCase().includes(key) ||
        (row.materialSpec || '').toLowerCase().includes(key)
      );
    });
  }

  onSearchChange() {
    this.applyFilter();
  }

  onClickAddMaterial() {
    Swal.fire({
      icon: 'info',
      title: 'Add Material',
      text: 'ตอนนี้หน้านี้เตรียมไว้สำหรับดูข้อมูลและ Sync Material ก่อน'
    });
  }

  syncMaterialFromPbass() {
    if (this.isSyncing) return;

    Swal.fire({
      title: 'Sync Material ?',
      html: `
        <div style="text-align:left">
          ระบบจะดึงข้อมูล Material จาก PBASS แล้วเพิ่มเฉพาะรายการที่ยังไม่มีในฐานข้อมูล
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
            กรุณารอสักครู่ ระบบกำลังดึงข้อมูลและตรวจสอบรายการซ้ำ
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
          const duplicateCount = Number(res?.duplicateCount || 0);
          const duplicateInPayloadCount = Number(res?.duplicateInPayloadCount || 0);
          const totalCreateChunks = Number(res?.totalCreateChunks || 0);
          const chunkSize = Number(res?.chunkSize || 0);

          const duplicateItems = Array.isArray(res?.duplicateItems) ? res.duplicateItems : [];
          const duplicatePreview = duplicateItems.slice(0, 10);

          Swal.fire({
            icon: 'success',
            title: 'Sync Completed',
            width: 760,
            html: `
              <div style="text-align:left">
                <div style="display:grid;grid-template-columns:180px 1fr;gap:8px 12px;margin-bottom:14px">
                  <div><b>Total From API</b></div><div>${totalFromApi}</div>
                  <div><b>Valid Rows</b></div><div>${validRows}</div>
                  <div><b>Created</b></div><div style="color:#16a34a;font-weight:700">${createdCount}</div>
                  <div><b>Duplicate In DB</b></div><div style="color:#dc2626;font-weight:700">${duplicateCount}</div>
                  <div><b>Duplicate In Payload</b></div><div>${duplicateInPayloadCount}</div>
                  <div><b>Total Chunks</b></div><div>${totalCreateChunks}</div>
                  <div><b>Chunk Size</b></div><div>${chunkSize}</div>
                </div>

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
                            </tr>
                          </thead>
                          <tbody>
                            ${duplicatePreview
                              .map(
                                (x: any) => `
                                  <tr>
                                    <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.materialNo || '-'}</td>
                                    <td style="padding:8px;border-bottom:1px solid #f1f5f9">${x.materialName || '-'}</td>
                                  </tr>
                                `
                              )
                              .join('')}
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
}