import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
})
export class GalleryPage implements OnInit {

  // Data passed in by componentProps
  // @Input() foto: string;
  @Input() fotos: Array<any>;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    console.log('fotos: ', this.fotos);
  }

  close()
  {
    this.modalController.dismiss();
  }

}
