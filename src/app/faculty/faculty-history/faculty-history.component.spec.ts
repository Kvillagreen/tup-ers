import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyHistoryComponent } from './faculty-history.component';

describe('FacultyHistoryComponent', () => {
  let component: FacultyHistoryComponent;
  let fixture: ComponentFixture<FacultyHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
