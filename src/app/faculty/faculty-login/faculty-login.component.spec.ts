import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyLoginComponent } from './faculty-login.component';

describe('FacultyLoginComponent', () => {
  let component: FacultyLoginComponent;
  let fixture: ComponentFixture<FacultyLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
