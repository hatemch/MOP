import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncluirExameLaboratorialPage } from './incluir-exame-laboratorial.page';

describe('IncluirExameLaboratorialPage', () => {
  let component: IncluirExameLaboratorialPage;
  let fixture: ComponentFixture<IncluirExameLaboratorialPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncluirExameLaboratorialPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncluirExameLaboratorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
