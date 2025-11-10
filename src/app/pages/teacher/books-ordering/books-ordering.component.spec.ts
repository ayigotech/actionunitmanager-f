import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BooksOrderingComponent } from './books-ordering.component';

describe('BooksOrderingComponent', () => {
  let component: BooksOrderingComponent;
  let fixture: ComponentFixture<BooksOrderingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BooksOrderingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BooksOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
