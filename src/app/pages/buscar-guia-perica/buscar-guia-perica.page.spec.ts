import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarGuiaPericaPage } from './buscar-guia-perica.page';

describe('BuscarGuiaPericaPage', () => {
  let component: BuscarGuiaPericaPage;
  let fixture: ComponentFixture<BuscarGuiaPericaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscarGuiaPericaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarGuiaPericaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
