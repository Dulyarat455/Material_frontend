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

  applyFilter() {
    const key = (this.searchText || '').trim().toLowerCase();

    if (!key) {
      this.filteredRows = [...this.rows];
      return;
    }

    this.filteredRows = this.rows.filter((row) => {
      return [
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
    });
  }

  trackByRow(_index: number, row: UserRow) {
    return row.id;
  }

  openAddMemberModal() {
    const groupOptions = this.groups
      .map(g => `<option value="${g.id}">${g.name}</option>`)
      .join('');

    const sectionOptions = this.sections
      .map(s => `<option value="${s.id}">${s.name}</option>`)
      .join('');

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
      if (!result.isConfirmed) return;
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

    Swal.fire({
      icon: 'info',
      title: 'Edit Member',
      text: `ยังไม่ได้ทำต่อสำหรับ ${row.name}`
    });
  }

  confirmDeleteMember(row: UserRow) {
    if (row.hasPending) return;

    Swal.fire({
      icon: 'warning',
      title: 'Delete Member',
      text: `ยังไม่ได้ทำต่อสำหรับ ${row.name}`
    });
  }
}