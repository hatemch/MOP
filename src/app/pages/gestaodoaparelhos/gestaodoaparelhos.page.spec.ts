import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestaodoaparelhosPage } from './gestaodoaparelhos.page';

describe('GestaodoaparelhosPage', () => {
  let component: GestaodoaparelhosPage;
  let fixture: ComponentFixture<GestaodoaparelhosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestaodoaparelhosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestaodoaparelhosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
