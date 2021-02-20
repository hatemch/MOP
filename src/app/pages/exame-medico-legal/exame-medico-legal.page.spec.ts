import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExameMedicoLegalPage } from './exame-medico-legal.page';

describe('ExameMedicoLegalPage', () => {
  let component: ExameMedicoLegalPage;
  let fixture: ComponentFixture<ExameMedicoLegalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExameMedicoLegalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExameMedicoLegalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
