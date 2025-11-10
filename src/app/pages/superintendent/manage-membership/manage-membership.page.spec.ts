import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageMembershipPage } from './manage-membership.page';

describe('ManageMembershipPage', () => {
  let component: ManageMembershipPage;
  let fixture: ComponentFixture<ManageMembershipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMembershipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
