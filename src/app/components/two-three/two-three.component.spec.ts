import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoThreeComponent } from './two-three.component';

describe('TwoThreeComponent', () => {
  let component: TwoThreeComponent;
  let fixture: ComponentFixture<TwoThreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwoThreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
