import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmaPage } from './arma.page';

describe('ArmaPage', () => {
  let component: ArmaPage;
  let fixture: ComponentFixture<ArmaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArmaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArmaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
