import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RelatorioOcorrenciaNaturezaPage } from './relatorio-ocorrencia-natureza.page';

describe('RelatorioOcorrenciaNaturezaPage', () => {
  let component: RelatorioOcorrenciaNaturezaPage;
  let fixture: ComponentFixture<RelatorioOcorrenciaNaturezaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatorioOcorrenciaNaturezaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioOcorrenciaNaturezaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
