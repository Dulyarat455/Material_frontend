import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import config from '../../config';

type UserRow = {
  id: number;
  rfId: string;
  empNo: string;
  name: string;
  password: string;
  role: string;
  status: string;
  groupId: number | null;
  groupName: string;
  sectionId: number | null;
  sectionName: string;

  issueWaitCount: number;
  returnWaitCount: number;
  issueWaitJobNos: string[];
  returnWaitJobNos: string[];
  totalWaitCount: number;
  hasPending: boolean;
};

type GroupRow = {
  id: number;
  name: string;
};

type SectionRow = {
  id: number;
  name: string;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private http: HttpClient) {}

  isLoading = false;
  searchText = '';
  roleFilter = 'all';
  groupFilter = 'all';
  sectionFilter = 'all';

  rows: UserRow[] = [];
  filteredRows: UserRow[] = [];

  groups: GroupRow[] = [];
  sections: SectionRow[] = [];

  ngOnInit() {
    this.fetchUserList();
    this.fetchGroup();
    this.fetchSection();
  }

  fetchUserList() {
    this.isLoading = true;

    this.http.get<any>(`${config.apiServer}/api/user/list`).subscribe({
      next: (res) => {
        this.rows = Array.isArray(res?.results) ? res.results : [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: async (err) => {
        console.error('fetchUserList error:', err);
        this.rows = [];
        this.filteredRows = [];
        this.isLoading = false;

        await Swal.fire({
          icon: 'error',
          title: 'Load User Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถโหลดข้อมูล User ได้'
        });
      }
    });
  }

  fetchGroup() {
    this.http.get<any>(`${config.apiServer}/api/group/list`).subscribe({
      next: (res) => {
        this.groups = Array.isArray(res?.results) ? res.results : [];
      },
      error: async (err) => {
        console.error('fetchGroup error:', err);
        this.groups = [];

        await Swal.fire({
          icon: 'error',
          title: 'Load Group Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถโหลดข้อมูล Group ได้'
        });
      }
    });
  }

  fetchSection() {
    this.http.get<any>(`${config.apiServer}/api/section/list`).subscribe({
      next: (res) => {
        this.sections = Array.isArray(res?.results) ? res.results : [];
      },
      error: async (err) => {
        console.error('fetchSection error:', err);
        this.sections = [];

        await Swal.fire({
          icon: 'error',
          title: 'Load Section Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถโหลดข้อมูล Section ได้'
        });
      }
    });
  }

  onSearchChange() {
    this.applyFilter();
  }

  onDropdownFilterChange() {
    this.applyFilter();
  }



  clearFilters() {
    this.searchText = '';
    this.roleFilter = 'all';
    this.groupFilter = 'all';
    this.sectionFilter = 'all';
    this.applyFilter();
  }


  


  applyFilter() {
    const key = (this.searchText || '').trim().toLowerCase();
  
    this.filteredRows = this.rows.filter((row) => {
      const matchSearch = !key || [
        row.rfId,
        row.empNo,
        row.name,
        row.password,
        row.role,
        row.groupName,
        row.sectionName,
        ...(row.issueWaitJobNos || []),
        ...(row.returnWaitJobNos || [])
      ]
        .map(v => (v || '').toString().toLowerCase())
        .some(v => v.includes(key));
  
      const matchRole =
        this.roleFilter === 'all' ||
        (row.role || '').toLowerCase() === this.roleFilter.toLowerCase();
  
      const matchGroup =
        this.groupFilter === 'all' ||
        String(row.groupId || '') === String(this.groupFilter);
  
      const matchSection =
        this.sectionFilter === 'all' ||
        String(row.sectionId || '') === String(this.sectionFilter);
  
      return matchSearch && matchRole && matchGroup && matchSection;
    });
  }

  trackByRow(_index: number, row: UserRow) {
    return row.id;
  }

  private buildGroupOptions(selectedId?: number | null) {
    return this.groups
      .map(g => `<option value="${g.id}" ${Number(selectedId) === Number(g.id) ? 'selected' : ''}>${g.name}</option>`)
      .join('');
  }

  private buildSectionOptions(selectedId?: number | null) {
    return this.sections
      .map(s => `<option value="${s.id}" ${Number(selectedId) === Number(s.id) ? 'selected' : ''}>${s.name}</option>`)
      .join('');
  }

  openAddMemberModal() {
    const groupOptions = this.buildGroupOptions();
    const sectionOptions = this.buildSectionOptions();

    Swal.fire({
      title: 'Register Member',
      width: 720,
      html: `
        <style>
          .swal-user-grid {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 10px 12px;
            text-align: left;
            margin-top: 8px;
          }
          .swal-user-grid label {
            font-weight: 700;
            color: #334155;
            align-self: center;
          }
          .swal-user-grid input,
          .swal-user-grid select {
            width: 100%;
            min-height: 40px;
            border: 1px solid #dbe3ef;
            border-radius: 10px;
            padding: 8px 10px;
            outline: none;
          }
        </style>

        <div class="swal-user-grid">
          <label>RF ID</label>
          <input id="swal-rfId" type="text" />

          <label>Emp No</label>
          <input id="swal-empNo" type="text" />

          <label>Name</label>
          <input id="swal-name" type="text" />

          <label>Password</label>
          <input id="swal-password" type="password" />

          <label>Role</label>
          <select id="swal-role">
            <option value="">-- Select Role --</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>

          <label>Group</label>
          <select id="swal-groupId">
            <option value="">-- Select Group --</option>
            ${groupOptions}
          </select>

          <label>Section</label>
          <select id="swal-sectionId">
            <option value="">-- Select Section --</option>
            ${sectionOptions}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Register',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const rfId = (document.getElementById('swal-rfId') as HTMLInputElement)?.value?.trim();
        const empNo = (document.getElementById('swal-empNo') as HTMLInputElement)?.value?.trim();
        const name = (document.getElementById('swal-name') as HTMLInputElement)?.value?.trim();
        const password = (document.getElementById('swal-password') as HTMLInputElement)?.value?.trim();
        const role = (document.getElementById('swal-role') as HTMLSelectElement)?.value?.trim();
        const groupId = (document.getElementById('swal-groupId') as HTMLSelectElement)?.value?.trim();
        const sectionId = (document.getElementById('swal-sectionId') as HTMLSelectElement)?.value?.trim();

        if (!rfId || !empNo || !name || !password || !role || !groupId || !sectionId) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบ');
          return false;
        }

        return {
          rfId,
          empNo,
          name,
          password,
          role,
          groupId: Number(groupId),
          sectionId: Number(sectionId)
        };
      }
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;
      this.submitRegister(result.value);
    });
  }

  submitRegister(body: any) {
    this.http.post<any>(`${config.apiServer}/api/user/create`, body).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Register Success',
          text: 'เพิ่มสมาชิกเรียบร้อยแล้ว',
          timer: 1400,
          showConfirmButton: false
        });

        this.fetchUserList();
      },
      error: async (err) => {
        let message = err?.error?.message || err?.error?.error || 'เกิดข้อผิดพลาด';

        if (message === 'user_already_exists') {
          message = 'User นี้มีอยู่แล้วในระบบ';
        } else if (message === 'group_not_found') {
          message = 'ไม่พบ Group ที่เลือก';
        } else if (message === 'section_not_found') {
          message = 'ไม่พบ Section ที่เลือก';
        } else if (message === 'missing_required_fields') {
          message = 'ข้อมูลไม่ครบ';
        }

        await Swal.fire({
          icon: 'error',
          title: 'Register Failed',
          text: message
        });
      }
    });
  }

  openOnProcessSummary(row: UserRow) {
    if (!row.hasPending) return;

    const issueHtml = row.issueWaitJobNos.length
      ? row.issueWaitJobNos.map((jobNo, idx) => `<div><b>${idx + 1}.</b> ${jobNo}</div>`).join('')
      : '<div>-</div>';

    const returnHtml = row.returnWaitJobNos.length
      ? row.returnWaitJobNos.map((jobNo, idx) => `<div><b>${idx + 1}.</b> ${jobNo}</div>`).join('')
      : '<div>-</div>';

    Swal.fire({
      icon: 'info',
      title: `On-Process : ${row.name}`,
      width: 760,
      html: `
        <div style="text-align:left; line-height:1.8;">
          <div style="margin-bottom:14px;">
            <div style="font-weight:800; color:#2563eb; margin-bottom:6px;">
              Issue Waiting (${row.issueWaitCount})
            </div>
            ${issueHtml}
          </div>

          <div>
            <div style="font-weight:800; color:#16a34a; margin-bottom:6px;">
              Return Waiting (${row.returnWaitCount})
            </div>
            ${returnHtml}
          </div>
        </div>
      `
    });
  }

  openEditMember(row: UserRow) {
    if (row.hasPending) return;

    const groupOptions = this.buildGroupOptions(row.groupId);
    const sectionOptions = this.buildSectionOptions(row.sectionId);

    Swal.fire({
      title: `Edit Member : ${row.name}`,
      width: 720,
      html: `
        <style>
          .swal-user-grid {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 10px 12px;
            text-align: left;
            margin-top: 8px;
          }
          .swal-user-grid label {
            font-weight: 700;
            color: #334155;
            align-self: center;
          }
          .swal-user-grid input,
          .swal-user-grid select {
            width: 100%;
            min-height: 40px;
            border: 1px solid #dbe3ef;
            border-radius: 10px;
            padding: 8px 10px;
            outline: none;
          }
        </style>

        <div class="swal-user-grid">
          <label>RF ID</label>
          <input id="swal-rfId" type="text" value="${this.escapeHtml(row.rfId || '')}" />

          <label>Emp No</label>
          <input id="swal-empNo" type="text" value="${this.escapeHtml(row.empNo || '')}" />

          <label>Name</label>
          <input id="swal-name" type="text" value="${this.escapeHtml(row.name || '')}" />

          <label>Password</label>
          <input id="swal-password" type="text" value="${this.escapeHtml(row.password || '')}" />

          <label>Role</label>
          <select id="swal-role">
            <option value="">-- Select Role --</option>
            <option value="user" ${row.role === 'user' ? 'selected' : ''}>user</option>
            <option value="admin" ${row.role === 'admin' ? 'selected' : ''}>admin</option>
          </select>

          <label>Group</label>
          <select id="swal-groupId">
            <option value="">-- Select Group --</option>
            ${groupOptions}
          </select>

          <label>Section</label>
          <select id="swal-sectionId">
            <option value="">-- Select Section --</option>
            ${sectionOptions}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const rfId = (document.getElementById('swal-rfId') as HTMLInputElement)?.value?.trim();
        const empNo = (document.getElementById('swal-empNo') as HTMLInputElement)?.value?.trim();
        const name = (document.getElementById('swal-name') as HTMLInputElement)?.value?.trim();
        const password = (document.getElementById('swal-password') as HTMLInputElement)?.value?.trim();
        const role = (document.getElementById('swal-role') as HTMLSelectElement)?.value?.trim();
        const groupId = (document.getElementById('swal-groupId') as HTMLSelectElement)?.value?.trim();
        const sectionId = (document.getElementById('swal-sectionId') as HTMLSelectElement)?.value?.trim();

        if (!rfId || !empNo || !name || !password || !role || !groupId || !sectionId) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบ');
          return false;
        }

        return {
          userId: row.id,
          rfId,
          empNo,
          name,
          password,
          role,
          groupId: Number(groupId),
          sectionId: Number(sectionId)
        };
      }
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;
      this.submitEditMember(result.value);
    });
  }

  submitEditMember(body: any) {
    this.http.post<any>(`${config.apiServer}/api/user/edit`, body).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Edit Success',
          text: 'แก้ไขข้อมูลสมาชิกเรียบร้อยแล้ว',
          timer: 1400,
          showConfirmButton: false
        });

        this.fetchUserList();
      },
      error: async (err) => {
        let message = err?.error?.message || err?.error?.error || 'เกิดข้อผิดพลาด';

        if (message === 'user_already_exists') {
          message = 'ข้อมูลซ้ำกับ user อื่นในระบบ';
        } else if (message === 'group_not_found') {
          message = 'ไม่พบ Group ที่เลือก';
        } else if (message === 'section_not_found') {
          message = 'ไม่พบ Section ที่เลือก';
        } else if (message === 'missing_required_fields') {
          message = 'ข้อมูลไม่ครบ';
        } else if (message === 'user_not_found') {
          message = 'ไม่พบผู้ใช้งานนี้ในระบบ';
        }

        await Swal.fire({
          icon: 'error',
          title: 'Edit Failed',
          text: message
        });
      }
    });
  }

  confirmDeleteMember(row: UserRow) {
    if (row.hasPending) return;

    Swal.fire({
      icon: 'warning',
      title: 'Delete Member',
      html: `
        <div style="text-align:left; line-height:1.8;">
          <div><b>Name:</b> ${this.escapeHtml(row.name || '-')}</div>
          <div><b>Emp No:</b> ${this.escapeHtml(row.empNo || '-')}</div>
          <div><b>RF ID:</b> ${this.escapeHtml(row.rfId || '-')}</div>
          <br>
          <div>ยืนยันการลบสมาชิกคนนี้หรือไม่</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.submitDeleteMember(row.id);
    });
  }

  submitDeleteMember(userId: number) {
    this.http.post<any>(`${config.apiServer}/api/user/delete`, { userId }).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Delete Success',
          text: 'ลบสมาชิกเรียบร้อยแล้ว',
          timer: 1400,
          showConfirmButton: false
        });

        this.fetchUserList();
      },
      error: async (err) => {
        let message = err?.error?.message || err?.error?.error || 'เกิดข้อผิดพลาด';

        if (message === 'user_not_found') {
          message = 'ไม่พบผู้ใช้งานนี้ในระบบ';
        } else if (message === 'user_has_been_delete') {
          message = 'ผู้ใช้งานนี้ถูกลบไปแล้ว';
        } else if (message === 'missing_required_fields') {
          message = 'ข้อมูลไม่ครบ';
        }

        await Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: message
        });
      }
    });
  }


  exportExcel() {
    const body = {
      searchText: this.searchText || '',
      roleFilter: this.roleFilter || 'all',
      groupFilter: this.groupFilter || 'all',
      sectionFilter: this.sectionFilter || 'all'
    };
  
    this.http.post(`${config.apiServer}/api/user/exportExcel`, body, {
      responseType: 'blob'
    }).subscribe({
      next: async (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user-master-report.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
  
        await Swal.fire({
          icon: 'success',
          title: 'Export Success',
          text: 'Export Excel เรียบร้อยแล้ว',
          timer: 1400,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        await Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: err?.error?.message || err?.error?.error || 'ไม่สามารถ export excel ได้'
        });
      }
    });
  }





  openImportExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
  
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.submitImportExcel(file);
    };
  
    input.click();
  }
  
  submitImportExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
  
    this.isLoading = true;
  
    this.http.post<any>(`${config.apiServer}/api/user/importExcel`, formData).subscribe({
      next: async (res) => {
        this.isLoading = false;
  
        const completeCount = Number(res?.completeCount || 0);
        const skipCount = Number(res?.skipCount || 0);
        const skipped = Array.isArray(res?.skipped) ? res.skipped : [];
  
        const skippedHtml = skipped.length
          ? skipped.map((x: any, idx: number) => {
              return `
                <tr>
                  <td style="padding:6px 8px; border:1px solid #dbe3ef;">${idx + 1}</td>
                  <td style="padding:6px 8px; border:1px solid #dbe3ef;">${this.escapeHtml(x.empNo || '-')}</td>
                  <td style="padding:6px 8px; border:1px solid #dbe3ef;">${this.escapeHtml(x.name || '-')}</td>
                  <td style="padding:6px 8px; border:1px solid #dbe3ef;">${this.escapeHtml(x.reason || '-')}</td>
                </tr>
              `;
            }).join('')
          : `
            <tr>
              <td colspan="4" style="padding:8px; border:1px solid #dbe3ef; text-align:center;">
                No skipped rows
              </td>
            </tr>
          `;
  
        await Swal.fire({
          icon: 'success',
          title: 'Import Complete',
          width: 900,
          html: `
            <div style="text-align:left; line-height:1.8;">
              <div><b>Complete:</b> ${completeCount} คน</div>
              <div><b>Skipped:</b> ${skipCount} คน</div>
  
              <div style="margin-top:14px; font-weight:800;">Skipped List</div>
              <div style="margin-top:8px; max-height:320px; overflow:auto; border:1px solid #dbe3ef; border-radius:10px;">
                <table style="width:100%; border-collapse:collapse; font-size:13px;">
                  <thead style="position:sticky; top:0; background:#eff6ff;">
                    <tr>
                      <th style="padding:6px 8px; border:1px solid #dbe3ef;">#</th>
                      <th style="padding:6px 8px; border:1px solid #dbe3ef;">Emp No</th>
                      <th style="padding:6px 8px; border:1px solid #dbe3ef;">Name</th>
                      <th style="padding:6px 8px; border:1px solid #dbe3ef;">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${skippedHtml}
                  </tbody>
                </table>
              </div>
            </div>
          `
        });
  
        this.fetchUserList();
      },
      error: async (err) => {
        this.isLoading = false;
  
        let message = err?.error?.message || err?.error?.error || 'ไม่สามารถ import excel ได้';
  
        if (message === 'file_not_found') {
          message = 'ไม่พบไฟล์ที่อัปโหลด';
        } else if (message === 'sheet_not_found') {
          message = 'ไม่พบ worksheet ในไฟล์ Excel';
        } else if (message === 'excel_no_data') {
          message = 'ไม่พบข้อมูลในไฟล์ Excel';
        }
  
        await Swal.fire({
          icon: 'error',
          title: 'Import Failed',
          text: message
        });
      }
    });
  }







  private escapeHtml(value: string) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}