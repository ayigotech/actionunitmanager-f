import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageBooksPage } from './manage-books.page';

describe('ManageBooksPage', () => {
  let component: ManageBooksPage;
  let fixture: ComponentFixture<ManageBooksPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBooksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
