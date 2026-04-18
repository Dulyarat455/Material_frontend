import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionStoreReportComponent } from './transaction-store-report.component';

describe('TransactionStoreReportComponent', () => {
  let component: TransactionStoreReportComponent;
  let fixture: ComponentFixture<TransactionStoreReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionStoreReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionStoreReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
