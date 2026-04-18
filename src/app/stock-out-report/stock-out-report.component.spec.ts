import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockOutReportComponent } from './stock-out-report.component';

describe('StockOutReportComponent', () => {
  let component: StockOutReportComponent;
  let fixture: ComponentFixture<StockOutReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockOutReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockOutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
