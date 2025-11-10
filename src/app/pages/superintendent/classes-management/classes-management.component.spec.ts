import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClassesManagementComponent } from './classes-management.component';

describe('ClassesManagementComponent', () => {
  let component: ClassesManagementComponent;
  let fixture: ComponentFixture<ClassesManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ClassesManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
