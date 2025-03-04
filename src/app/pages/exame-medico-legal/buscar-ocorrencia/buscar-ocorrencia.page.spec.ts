import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarOcorrenciaPage } from './buscar-ocorrencia.page';

describe('BuscarOcorrenciaPage', () => {
  let component: BuscarOcorrenciaPage;
  let fixture: ComponentFixture<BuscarOcorrenciaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscarOcorrenciaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarOcorrenciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
