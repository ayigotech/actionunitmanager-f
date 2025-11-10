import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChurchSignupPage } from './church-signup.page';

describe('ChurchSignupPage', () => {
  let component: ChurchSignupPage;
  let fixture: ComponentFixture<ChurchSignupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChurchSignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
