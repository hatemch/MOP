import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExameLaboratorialLegalPage } from './exame-laboratorial-legal.page';

describe('ExameLaboratorialLegalPage', () => {
  let component: ExameLaboratorialLegalPage;
  let fixture: ComponentFixture<ExameLaboratorialLegalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExameLaboratorialLegalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExameLaboratorialLegalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
