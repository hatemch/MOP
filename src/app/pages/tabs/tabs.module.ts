import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { path: 'detalhes', loadChildren: '../exame-medico-legal/incluir-exame/detalhes/detalhes.module#DetalhesPageModule' },
      { path: 'incluir-exame', loadChildren: '../exame-medico-legal/incluir-exame/incluir-exame.module#IncluirExamePageModule' },
      {
        path: 'local-pericia',
        loadChildren: '../exame-medico-legal/incluir-exame/local-pericia/local-pericia.module#LocalPericiaPageModule'
      },
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/incluir-exame',
    pathMatch: 'full'

  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TabsPage]
})
export class TabsPageModule { }
