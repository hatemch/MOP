import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IonicSelectableModule } from 'ionic-selectable';

import { BuscarGuiaPericaPage } from './buscar-guia-perica.page';

const routes: Routes = [
  {
    path: '',
    component: BuscarGuiaPericaPage
  }
];

@NgModule({
  imports: [
    NgxDatatableModule,
    IonicSelectableModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BuscarGuiaPericaPage]
})
export class BuscarGuiaPericaPageModule {}
