import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyForgetPasswordComponent } from './faculty-forget-password.component';

describe('FacultyForgetPasswordComponent', () => {
  let component: FacultyForgetPasswordComponent;
  let fixture: ComponentFixture<FacultyForgetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyForgetPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyForgetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
