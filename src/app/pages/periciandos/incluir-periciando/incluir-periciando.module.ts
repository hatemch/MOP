import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicSelectableModule } from 'ionic-selectable';
import { IonicModule } from '@ionic/angular';

import { IncluirPericiandoPage } from './incluir-periciando.page';
import { BuscarPessoasPage } from '../buscar-pessoas/buscar-pessoas.page';
import { BuscarPessoasPageModule } from '../buscar-pessoas/buscar-pessoas.module';

const routes: Routes = [
  {
    path: '',
    component: IncluirPericiandoPage
  }
];

@NgModule({
  imports: [
    IonicSelectableModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    BuscarPessoasPageModule
  ],
  declarations: [IncluirPericiandoPage],
  entryComponents: [
    BuscarPessoasPage
  ]
})
export class IncluirPericiandoPageModule { }
