import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncluirPericiandoPage } from './incluir-periciando.page';

describe('IncluirPericiandoPage', () => {
  let component: IncluirPericiandoPage;
  let fixture: ComponentFixture<IncluirPericiandoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncluirPericiandoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncluirPericiandoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
