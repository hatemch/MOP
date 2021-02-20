import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ConsultaInfracaoPage } from './consultainfracao.page';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IonicSelectableModule } from 'ionic-selectable';

const routes: Routes = [
  {
    path: '',
    component: ConsultaInfracaoPage
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
  declarations: [ConsultaInfracaoPage]
})
export class ConsultaInfracaoPageModule {}
