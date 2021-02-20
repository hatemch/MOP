import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncluirOutrasPericiasPage } from './incluir-outras-pericias.page';

describe('IncluirOutrasPericiasPage', () => {
  let component: IncluirOutrasPericiasPage;
  let fixture: ComponentFixture<IncluirOutrasPericiasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncluirOutrasPericiasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncluirOutrasPericiasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
