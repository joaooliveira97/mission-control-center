import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeGridComponent } from './free-grid.component';

describe('FreeGridComponent', () => {
  let component: FreeGridComponent;
  let fixture: ComponentFixture<FreeGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreeGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
