import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type JobRow = {
  dateTimePD: string;
  jobNo: string;
  type: 'Issue' | 'Return';
  materialNo: string;
  materialName: string;
  materialSpec: string;
  mcNo: string;
  requestBy: string;
  remark?: string;
};


@Component({
  selector: 'app-job-transaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-transaction.component.html',
  styleUrl: './job-transaction.component.css'
})
export class JobTransactionComponent {

  issueJobs: JobRow[] = [
    {
      dateTimePD: '22-12-2025 07:34',
      jobNo: '20251222006',
      type: 'Issue',
      materialNo: 'P07080003400000',
      materialName: 'SPCEN-SD',
      materialSpec: '0.8 x 34',
      mcNo: 'B3',
      requestBy: 'LA647',
      remark: ''
    },
    {
      dateTimePD: '22-12-2025 07:34',
      jobNo: '20251222007',
      type: 'Issue',
      materialNo: 'P07080003400000',
      materialName: 'SPCEN-SD',
      materialSpec: '0.8 x 34',
      mcNo: 'B4',
      requestBy: 'LA647',
      remark: ''
    },
    {
      dateTimePD: '22-12-2025 08:02',
      jobNo: '20251222009',
      type: 'Issue',
      materialNo: 'P14090008600000',
      materialName: 'SUYP-1',
      materialSpec: '0.9 x 86',
      mcNo: 'B1',
      requestBy: 'LA440',
      remark: ''
    }
  ];

  returnJobs: JobRow[] = [
    {
      dateTimePD: '22-12-2025 07:45',
      jobNo: '20251222008',
      type: 'Return',
      materialNo: 'P13090006500000',
      materialName: 'SECC-GX-J2',
      materialSpec: '0.9 x 65',
      mcNo: 'C3',
      requestBy: 'LB369',
      remark: ''
    }
  ];

  trackIssue(index: number, row: JobRow) {
    return row.jobNo;
  }

  trackReturn(index: number, row: JobRow) {
    return row.jobNo;
  }



}
