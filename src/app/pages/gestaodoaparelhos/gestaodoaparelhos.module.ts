import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GestaodoaparelhosPage } from './gestaodoaparelhos.page';

const routes: Routes = [
  {
    path: '',
    component: GestaodoaparelhosPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GestaodoaparelhosPage]
})
export class GestaodoaparelhosPageModule {}
