import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyReportPetitionComponent } from './faculty-report-petition.component';

describe('FacultyReportPetitionComponent', () => {
  let component: FacultyReportPetitionComponent;
  let fixture: ComponentFixture<FacultyReportPetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyReportPetitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyReportPetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
