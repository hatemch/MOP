import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncluirExamePage } from './incluir-exame.page';

describe('IncluirExamePage', () => {
  let component: IncluirExamePage;
  let fixture: ComponentFixture<IncluirExamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncluirExamePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncluirExamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
