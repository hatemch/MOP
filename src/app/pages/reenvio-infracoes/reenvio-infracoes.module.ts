import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReenvioInfracoesPage } from './reenvio-infracoes.page';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IonicSelectableModule } from 'ionic-selectable';

const routes: Routes = [
  {
    path: '',
    component: ReenvioInfracoesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxDatatableModule,
    IonicSelectableModule
  ],
  declarations: [ReenvioInfracoesPage]
})
export class ReenvioInfracoesPageModule {}
