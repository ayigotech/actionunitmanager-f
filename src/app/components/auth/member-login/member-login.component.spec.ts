import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MemberLoginComponent } from './member-login.component';

describe('MemberLoginComponent', () => {
  let component: MemberLoginComponent;
  let fixture: ComponentFixture<MemberLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MemberLoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
