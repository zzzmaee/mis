import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ARMComponent } from './arm.component';

describe('ARMComponent', () => {
  let component: ARMComponent;
  let fixture: ComponentFixture<ARMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ARMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ARMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
