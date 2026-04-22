import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionAllReportComponent } from './transaction-all-report.component';

describe('TransactionAllReportComponent', () => {
  let component: TransactionAllReportComponent;
  let fixture: ComponentFixture<TransactionAllReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionAllReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionAllReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
