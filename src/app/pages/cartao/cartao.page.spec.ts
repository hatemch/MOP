import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartaoPage } from './cartao.page';

describe('CartaoPage', () => {
  let component: CartaoPage;
  let fixture: ComponentFixture<CartaoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartaoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
