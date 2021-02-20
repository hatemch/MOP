import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalizacaoPage } from './localizacao.page';

describe('LocalizacaoPage', () => {
  let component: LocalizacaoPage;
  let fixture: ComponentFixture<LocalizacaoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalizacaoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalizacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
