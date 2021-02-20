export class ArmaModel {
    codigoArma:string;
    numguia:string;
    tipo_local:number;
    tipo_arma:number;
    calibre:string;
    serie:string;
    marca:string;
    descricao: string;
    descricao_local: string;
    quesitacoes:string;
    usuario:string;
    examen_requisitado: any;
    nome_examen_requisitado: any;
     constructor() {
         this.codigoArma='';
         this.numguia='';
         this.tipo_local=0;
         this.calibre='';
         //this.tipo_arma='';
         this.serie='';
         this.descricao='';
         this.descricao_local='';
         this.quesitacoes='';
         this.usuario='';

    
     }
  
  }
  