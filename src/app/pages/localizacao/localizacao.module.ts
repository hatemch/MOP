import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicSelectableModule } from 'ionic-selectable';
import { IonicModule } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocalizacaoPage } from './localizacao.page';

const routes: Routes = [
  {
    path: '',
    component: LocalizacaoPage
  }
];

@NgModule({
  imports: [
   
    IonicSelectableModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [LocalizacaoPage]
})
export class LocalizacaoPageModule {}
