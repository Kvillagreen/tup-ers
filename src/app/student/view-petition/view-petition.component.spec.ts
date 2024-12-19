import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPetitionComponent } from './view-petition.component';

describe('ViewPetitionComponent', () => {
  let component: ViewPetitionComponent;
  let fixture: ComponentFixture<ViewPetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPetitionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
