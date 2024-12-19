import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackPetitionComponent } from './track-petition.component';

describe('TrackPetitionComponent', () => {
  let component: TrackPetitionComponent;
  let fixture: ComponentFixture<TrackPetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackPetitionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackPetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
