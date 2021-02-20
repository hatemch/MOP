import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfisPage } from './perfis.page';

describe('PerfisPage', () => {
  let component: PerfisPage;
  let fixture: ComponentFixture<PerfisPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerfisPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
