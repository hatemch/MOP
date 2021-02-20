import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { ConsultaListaPage } from './consulta-lista.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
const routes: Routes = [
  {
    path: '',
    component: ConsultaListaPage
  }
];

@NgModule({
  imports: [
    IonicSelectableModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxDatatableModule
  ],
  declarations: [ConsultaListaPage]
})
export class ConsultaListaPageModule {}
