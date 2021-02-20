import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FotosPage } from './fotos.page';

describe('FotosPage', () => {
  let component: FotosPage;
  let fixture: ComponentFixture<FotosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FotosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FotosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
