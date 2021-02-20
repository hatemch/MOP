import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrogasPage } from './drogas.page';

describe('DrogasPage', () => {
  let component: DrogasPage;
  let fixture: ComponentFixture<DrogasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrogasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrogasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
