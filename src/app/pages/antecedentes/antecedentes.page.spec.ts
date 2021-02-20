import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntecedentesPage } from './antecedentes.page';

describe('AntecedentesPage', () => {
  let component: AntecedentesPage;
  let fixture: ComponentFixture<AntecedentesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AntecedentesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AntecedentesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
