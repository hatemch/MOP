import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCargoPage } from './add-cargo.page';

describe('AddCargoPage', () => {
  let component: AddCargoPage;
  let fixture: ComponentFixture<AddCargoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCargoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCargoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
