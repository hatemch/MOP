import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjetosPericiaPage } from './objetos-pericia.page';

describe('ObjetosPericiaPage', () => {
  let component: ObjetosPericiaPage;
  let fixture: ComponentFixture<ObjetosPericiaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjetosPericiaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjetosPericiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
