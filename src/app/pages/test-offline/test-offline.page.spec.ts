import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestOfflinePage } from './test-offline.page';

describe('TestOfflinePage', () => {
  let component: TestOfflinePage;
  let fixture: ComponentFixture<TestOfflinePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestOfflinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
