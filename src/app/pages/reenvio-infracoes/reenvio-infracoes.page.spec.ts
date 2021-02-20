import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReenvioInfracoesPage } from './reenvio-infracoes.page';

describe('ReenvioInfracoesPage', () => {
  let component: ReenvioInfracoesPage;
  let fixture: ComponentFixture<ReenvioInfracoesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReenvioInfracoesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReenvioInfracoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
