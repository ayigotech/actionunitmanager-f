import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuarterlyOrdersPage } from './quarterly-orders.page';

describe('QuarterlyOrdersPage', () => {
  let component: QuarterlyOrdersPage;
  let fixture: ComponentFixture<QuarterlyOrdersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterlyOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
