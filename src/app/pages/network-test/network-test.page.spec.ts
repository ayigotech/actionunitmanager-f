import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkTestPage } from './network-test.page';

describe('NetworkTestPage', () => {
  let component: NetworkTestPage;
  let fixture: ComponentFixture<NetworkTestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkTestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
