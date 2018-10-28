import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailablePlanesComponent } from './available-planes.component';

describe('AvailablePlanesComponent', () => {
  let component: AvailablePlanesComponent;
  let fixture: ComponentFixture<AvailablePlanesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailablePlanesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailablePlanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
