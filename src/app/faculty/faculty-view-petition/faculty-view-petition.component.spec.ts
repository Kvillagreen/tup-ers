import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyViewPetitionComponent } from './faculty-view-petition.component';

describe('FacultyViewPetitionComponent', () => {
  let component: FacultyViewPetitionComponent;
  let fixture: ComponentFixture<FacultyViewPetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyViewPetitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyViewPetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
