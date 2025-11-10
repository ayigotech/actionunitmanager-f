import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageOfficersPage } from './manage-officers.page';

describe('ManageOfficersPage', () => {
  let component: ManageOfficersPage;
  let fixture: ComponentFixture<ManageOfficersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageOfficersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
