import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TeachersManagementComponent } from './teachers-management.component';

describe('TeachersManagementComponent', () => {
  let component: TeachersManagementComponent;
  let fixture: ComponentFixture<TeachersManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TeachersManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeachersManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
