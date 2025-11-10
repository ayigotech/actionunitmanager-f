import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TeacherLoginComponent } from './teacher-login.component';

describe('TeacherLoginComponent', () => {
  let component: TeacherLoginComponent;
  let fixture: ComponentFixture<TeacherLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TeacherLoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
