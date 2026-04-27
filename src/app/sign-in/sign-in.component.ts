import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import config from '../../config';
import Swal from 'sweetalert2';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent implements OnInit, AfterViewInit {
  @ViewChild('rfidInput') rfidInput!: ElementRef<HTMLInputElement>;

  token: string | undefined = '';
  username: string = '';
  password: string = '';
  empNo: string = '';
  rfid: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (localStorage.getItem('materialStore_token')) {
      this.token = localStorage.getItem('materialStore_token')!;
      this.empNo = localStorage.getItem('materialStore_empNo')!;
    } else {
      this.token = undefined;
      this.empNo = '';
    }
  }

  ngAfterViewInit() {
    this.focusRFIDInput();
  }

  private focusRFIDInput() {
    setTimeout(() => {
      if (this.rfidInput?.nativeElement) {
        this.rfidInput.nativeElement.focus();
      }
    }, 0);
  }

  private clearRFIDInput() {
    this.rfid = '';
    if (this.rfidInput?.nativeElement) {
      this.rfidInput.nativeElement.value = '';
    }
  }

  private resetLoginState() {
    this.isLoading = false;
    this.clearRFIDInput();
    this.focusRFIDInput();
  }

  onRFIDInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = (input?.value || '').trim();

    this.rfid = value;

    if (this.isLoading) return;

    // ปรับเลข 10 ตามความยาว RFID จริงได้
    if (value.length >= 10) {
      this.signInWithRFID(value);
    }
  }

  signInWithRFID(rfidValue: string) {
    if (this.isLoading) return;

    const cleanRfId = String(rfidValue || '').trim();
    if (!cleanRfId) return;

    this.isLoading = true;

    const payload = {
      rfId: cleanRfId,
    };

    this.http.post<any>(`${config.apiServer}/api/user/signInRfId`, payload).subscribe({
      next: (res) => {
        this.authService.login(res);

        Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ',
          text: `ยินดีต้อนรับ ${res.name}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: true,
        }).then(() => {
          this.token = localStorage.getItem('materialStore_token') || '';
          this.empNo = localStorage.getItem('materialStore_empNo') || '';
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        console.error('RFID Login Error:', error);

        const errorMessage =
          error?.error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';

        if (error?.error?.message === 'unauthorized') {
          this.resetLoginState();
          Swal.fire({
            title: 'ไม่สามารถเข้าสู่ระบบได้',
            text: 'ไม่มีสิทธิ์ในการเข้าถึง',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        if (error?.error?.message === 'user_has_been_delete') {
          this.resetLoginState();
          Swal.fire({
            title: 'ไม่สามารถเข้าสู่ระบบได้',
            text: 'ผู้ใช้นี้ถูกลบออกจากระบบแล้ว',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        this.resetLoginState();
        Swal.fire({
          title: 'ไม่สามารถเข้าสู่ระบบได้',
          text: errorMessage,
          icon: 'error',
          timer: 2000,
        });
      },
      complete: () => {
        if (!this.token) {
          this.isLoading = false;
        }
      },
    });
  }

  signIn() {
    if (this.empNo === '' || this.password === '') {
      Swal.fire({
        title: 'ตรวจสอบข้อมูล',
        text: 'โปรดกรอก username หรือ password ด้วย',
        icon: 'error',
      });
      return;
    }

    this.isLoading = true;

    const payload = {
      empNo: this.empNo,
      password: this.password,
    };

    this.http.post<any>(`${config.apiServer}/api/user/signin`, payload).subscribe({
      next: (res) => {
        this.authService.login(res);

        Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ',
          text: `ยินดีต้อนรับ ${res.name}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: true,
        }).then(() => {
          this.token = localStorage.getItem('materialStore_token') || '';
          this.empNo = localStorage.getItem('materialStore_empNo') || '';
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        this.isLoading = false;

        const errorMessage =
          error?.error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';

        if (error?.error?.message === 'unauthorized') {
          Swal.fire({
            title: 'ไม่สามารถเข้าสู่ระบบได้',
            text: 'ไม่มีสิทธิ์ในการเข้าถึง',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        if (error?.error?.message === 'user_has_been_delete') {
          Swal.fire({
            title: 'ไม่สามารถเข้าสู่ระบบได้',
            text: 'ผู้ใช้นี้ถูกลบออกจากระบบแล้ว',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        Swal.fire({
          title: 'ตรวจสอบข้อมูล',
          text: errorMessage,
          icon: 'error',
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  clearInputs(type: 'rfid' | 'employee' | 'all' = 'all') {
    if (type === 'rfid' || type === 'all') {
      this.clearRFIDInput();
      this.focusRFIDInput();
    }

    if (type === 'employee' || type === 'all') {
      this.empNo = '';
      this.password = '';
    }
  }
}