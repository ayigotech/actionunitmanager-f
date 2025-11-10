import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreloaderComponent } from './preloader.component';

describe('PreloaderComponent', () => {
  let component: PreloaderComponent;
  let fixture: ComponentFixture<PreloaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PreloaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PreloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
