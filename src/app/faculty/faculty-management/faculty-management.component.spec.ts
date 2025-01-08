import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyManagementComponent } from './faculty-management.component';

describe('FacultyManagementComponent', () => {
  let component: FacultyManagementComponent;
  let fixture: ComponentFixture<FacultyManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
