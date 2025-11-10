import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReassignTeacherModalComponent } from './reassign-teacher-modal.component';

describe('ReassignTeacherModalComponent', () => {
  let component: ReassignTeacherModalComponent;
  let fixture: ComponentFixture<ReassignTeacherModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReassignTeacherModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReassignTeacherModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
