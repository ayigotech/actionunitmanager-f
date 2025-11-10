import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AbsentMembersComponent } from './absent-members.component';

describe('AbsentMembersComponent', () => {
  let component: AbsentMembersComponent;
  let fixture: ComponentFixture<AbsentMembersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AbsentMembersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AbsentMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
