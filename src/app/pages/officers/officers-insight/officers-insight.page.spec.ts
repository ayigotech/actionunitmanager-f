import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficersInsightPage } from './officers-insight.page';

describe('OfficersInsightPage', () => {
  let component: OfficersInsightPage;
  let fixture: ComponentFixture<OfficersInsightPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficersInsightPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
