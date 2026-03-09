import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTransactionComponent } from './job-transaction.component';

describe('JobTransactionComponent', () => {
  let component: JobTransactionComponent;
  let fixture: ComponentFixture<JobTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobTransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
