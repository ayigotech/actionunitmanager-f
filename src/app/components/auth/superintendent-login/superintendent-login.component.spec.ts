import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SuperintendentLoginComponent } from './superintendent-login.component';

describe('SuperintendentLoginComponent', () => {
  let component: SuperintendentLoginComponent;
  let fixture: ComponentFixture<SuperintendentLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SuperintendentLoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperintendentLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
