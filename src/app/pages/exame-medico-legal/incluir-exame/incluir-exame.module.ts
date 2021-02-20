import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicSelectableModule } from 'ionic-selectable';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { IncluirExamePage } from './incluir-exame.page';
import { BuscarOcorrenciaPageModule } from '../buscar-ocorrencia/buscar-ocorrencia.module';
import { BuscarOcorrenciaPage } from '../buscar-ocorrencia/buscar-ocorrencia.page';

const routes: Routes = [
  {
    path: '',
    component: IncluirExamePage,
    
  }
];

@NgModule({
  imports: [
    IonicSelectableModule,
    NgxDatatableModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    BuscarOcorrenciaPageModule
  ],
  declarations: [IncluirExamePage],
  entryComponents: [
    BuscarOcorrenciaPage
  ]
})
export class IncluirExamePageModule {}
