import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OfferingsComponent } from './offerings.component';

describe('OfferingsComponent', () => {
  let component: OfferingsComponent;
  let fixture: ComponentFixture<OfferingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OfferingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OfferingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
