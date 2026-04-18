import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionJobReportComponent } from './transaction-job-report.component';

describe('TransactionJobReportComponent', () => {
  let component: TransactionJobReportComponent;
  let fixture: ComponentFixture<TransactionJobReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionJobReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionJobReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
