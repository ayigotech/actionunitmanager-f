import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuperintendentDashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  let component: SuperintendentDashboardPage;
  let fixture: ComponentFixture<SuperintendentDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperintendentDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
