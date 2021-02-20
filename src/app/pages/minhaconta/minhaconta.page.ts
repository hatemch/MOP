import { Component, ViewChild, OnInit, ChangeDetectorRef, ElementRef, Input } from '@angular/core';
import { NavController, Events, ModalController, } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { Md5 } from 'ts-md5/dist/md5';

import { WebView } from '@ionic-native/ionic-webview/ngx';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

import { Storage } from '@ionic/storage';

import { finalize } from 'rxjs/operators';

import fixOrientation from 'fix-orientation';




const STORAGE_KEY = 'my_images';
@Component({
  selector: 'app-minhaconta',
  templateUrl: './minhaconta.page.html',
  styleUrls: ['./minhaconta.page.scss'],
})
export class MinhaContaPage implements OnInit {
  @ViewChild('Nome', { static: false }) iNome;

  @ViewChild('inputcamera', { static: true }) cameraInput: ElementRef;

  @ViewChild('imgresult', { static: true }) imgResult: ElementRef;

  

  displayCard() {
   return this.Foto !== '';
  }

  Plataforma : String;  
  images = [];
  imageData = [];
  public SrcPhotoAvatar: any = "assets/imgs/user.jpg";
  public Foto : any;
  public CodigoUsuarioLogado: String;
  public NomeUsuarioLogado: String;
  public Nome: String;
  public SobreNome: String;
  public Email: String;
  public Celular: String;
  public IMEI: String;



  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController,
    public platform: Platform,
    private http: HttpClient,
    private webview: WebView,
    private camera: Camera,

    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private storage: Storage,
    private plt: Platform,
    private loadingController: LoadingController,
    private ref: ChangeDetectorRef,

  ) { }


  ngOnInit() {

  }

  /*
  ionViewDidLoad() {

    //console.log(("Passou")

    
  };
  */


  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.    
    ////console.log(("ionViewWillEnter");
    //this.CRUDActionAPIForm('Pesquisando', null); 

  }

  ionViewDidEnter() {
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    //console.log(("ionViewDidEnter");

    let imgResult = this.imgResult.nativeElement as HTMLInputElement;
    imgResult.src = this.SrcPhotoAvatar;

    //MY BIT
    const element = this.cameraInput.nativeElement as HTMLInputElement;
    element.onchange = () => {

      // Depois colocar um loading aqui!!!     

      const reader = new FileReader();

      reader.onload = (r: any) => {

        //THIS IS THE ORIGINAL BASE64 STRING AS SNAPPED FROM THE CAMERA
        //THIS IS PROBABLY THE ONE TO UPLOAD BACK TO YOUR DB AS IT'S UNALTERED
        //UP TO YOU, NOT REALLY BOTHERED
        let base64 = r.target.result as string;

        //FIXING ORIENTATION USING NPM PLUGIN fix-orientation
        fixOrientation(base64, { image: true }, (fixed: string, image: any) => {
          //fixed IS THE NEW VERSION FOR DISPLAY PURPOSES
          this.Foto = fixed;
          //this.alertService.hideLoader(500);
        });

      };

      reader.readAsDataURL(element.files[0]);
    };

    
    if (!this.Authorizer.HashKey) {
      this.navCtrl.navigateRoot('/login');
    } else {
      this.MostraDados(this.Authorizer.CodigoUsuarioSistema);
    }
    

  }

  ionViewWillLeave() {
    // Disparado quando o roteamento de componentes está prestes a ser animado.    

  }

  ionViewDidLeave() {
    // Disparado quando o roteamento de componentes terminou de ser animado.    
    ////console.log(("ionViewDidLeave");    
  }
  goBack() {
    this.navCtrl.back();
  }

  MostraDados(CodigoUsuario: any) {
    // paramStatus: Pesquisando, Editando, Deletando      
    let params = {
      'StatusCRUD': 'Pesquisar',
      'formValues': '',
      'CodigoUsuarioSistema': CodigoUsuario,
      'Hashkey': this.Authorizer.HashKey
    };

    this.Authorizer.QueryStoreProc('MinhaConta', 'spMinhaConta', params).then(res => {
      let resultado: any = res[0];
      try {
        if (resultado.success) {

          this.Nome = JSON.parse(resultado.results)[0].Nome;
          this.SobreNome = JSON.parse(resultado.results)[0].SobreNome;
          this.Celular = JSON.parse(resultado.results)[0].Celular;
          this.IMEI = JSON.parse(resultado.results)[0].IMEI;

          this.alertService.showLoader(resultado.message, 1000);
        }
        else {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: 'Minha Conta', pMessage: resultado.message });
          //this.navCtrl.navigateRoot('/login');
          this.navCtrl.back();
        }
      } catch (err) {
        this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: 'Minha Conta', pMessage: 'Nenhum usuário!' });
      }
    });

  }

  GravarDados(form: NgForm) {
    // paramStatus: Pesquisar, Gravar, Deletar
    form.value.Senha = Md5.hashStr(form.value.Senha);
    form.value.ReSenha = Md5.hashStr(form.value.ReSenha);
    //form.value.foto    = this.img; 
    let params = {
      'StatusCRUD': 'Gravar',
      'formValues': form.value,
      'CodigoUsuarioSistema': this.Authorizer.CodigoUsuarioSistema,
      'Hashkey': this.Authorizer.HashKey
    };
    this.Authorizer.QueryStoreProc('MinhaConta', 'spMinhaConta', params).then(res => {
      let resultado: any = res[0];
      try {
        if (resultado.success) {
          this.Nome = JSON.parse(resultado.results)[0].Nome;
          this.SobreNome = JSON.parse(resultado.results)[0].SobreNome;
          this.Celular = JSON.parse(resultado.results)[0].Celular;
          this.IMEI = JSON.parse(resultado.results)[0].IMEI;

          this.alertService.showLoader(resultado.message, 1000);
        }
        else {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: 'Minha Conta', pMessage: resultado.message });
          //this.navCtrl.navigateRoot('/login');
        }
      } catch (err) {
        this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: 'Minha Conta', pMessage: 'Nenhum usuário!' });
      }
    });
  }



  /*
    loadStoredImages() {
      this.storage.get(STORAGE_KEY).then(images => {
        if (images) {
          let arr = JSON.parse(images);
          this.images = [];
          for (let img of arr) {
            let filePath = this.file.dataDirectory + img;
            let resPath = this.pathForImage(filePath);
            this.images.push({ name: img, path: resPath, filePath: filePath });
          }
        }
      });
    }
  
    pathForImage(img) {
      if (img === null) {
        return '';
      } else {
        let converted = this.webview.convertFileSrc(img);
        return converted;
      }
    }
  
    async presentToast(text) {
      const toast = await this.toastController.create({
        message: text,
        position: 'bottom',
        duration: 3000
      });
      toast.present();
    }
  
    */

  takePicture(sourceType: any) {    
      const element = this.cameraInput.nativeElement as HTMLInputElement;
      element.click();    
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Selecionar fonte da imagem",
      buttons: [{
        text: 'Carregar da biblioteca de Imagens',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use a Camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Desistir',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }
  /*
  createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
    }, error => {
      this.presentToast('Error while storing file.');
    });
  }

  updateStoredImages(name) {
    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      if (!arr) {
        let newImages = [name];
        this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      } else {
        arr.push(name);
        this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      }

      let filePath = this.file.dataDirectory + name;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
        name: name,
        path: resPath,
        filePath: filePath
      };

      this.images = [newEntry, ...this.images];
      this.ref.detectChanges(); // trigger change detection cycle
    });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);

    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      let filtered = arr.filter(name => name != imgEntry.name);
      this.storage.set(STORAGE_KEY, JSON.stringify(filtered));

      var correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);

      this.file.removeFile(correctPath, imgEntry.name).then(res => {
        this.presentToast('File removed.');
      });
    });
  }


  startUpload(imgEntry) {
    this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
      .then(entry => {
        (<FileEntry>entry).file(file => this.readFile(file))
      })
      .catch(err => {
        this.presentToast('Error while reading file.');
      });
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });
      formData.append('file', imgBlob, file.name);
      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {
    const loading = await this.loadingController.create({
      //   content: 'Uploading image...',
    });
    await loading.present();

    this.http.post("http://localhost:8888/upload.php", formData)
      .pipe(
        finalize(() => {
          loading.dismiss();
        })
      )
      .subscribe(res => {
        if (res['success']) {
          this.presentToast('Upload de arquivo concluído.')
        } else {
          this.presentToast('Falha no upload do arquivo.')
        }
      });
  }
  */



  /* 
   async Pesquisar(form: NgForm, event: Events) {
     //console.log((form.value);
     //console.log((event);
   
     const modal = await this.modalController.create({
       component: DevicesmodalPage,
       componentProps: form.value
     });
     return await modal.present();
   }
   */


}
