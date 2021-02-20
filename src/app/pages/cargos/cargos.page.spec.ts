import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CargosPage } from './cargos.page';

describe('CargosPage', () => {
  let component: CargosPage;
  let fixture: ComponentFixture<CargosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CargosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CargosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
