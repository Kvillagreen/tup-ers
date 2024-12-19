import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivePetitionComponent } from './receive-petition.component';

describe('ReceivePetitionComponent', () => {
  let component: ReceivePetitionComponent;
  let fixture: ComponentFixture<ReceivePetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivePetitionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReceivePetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
