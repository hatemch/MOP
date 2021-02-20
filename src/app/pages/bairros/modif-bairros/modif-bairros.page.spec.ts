import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifBairrosPage } from './modif-bairros.page';

describe('ModifBairrosPage', () => {
  let component: ModifBairrosPage;
  let fixture: ComponentFixture<ModifBairrosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifBairrosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifBairrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
