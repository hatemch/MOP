export class DrogaModel {
    codigoDroga:string;
    numguia:string;
    tipo_local:number;
    tipo_droga:number;
    unidade_medida:number;
    quantidade:string;
    descricao: string;
    descricao_local: string;
    quesitacoes:string;
    usuario:string;

    examen_requisitado: any;
    nome_examen_requisitado: any;
   
     constructor() {
         this.codigoDroga='';
         this.tipo_droga = 0;
         this.numguia='';
       
         this.tipo_local=0;
         this.unidade_medida=0;
         this.quantidade='';
         this.descricao='';
         this.descricao_local='';
         this.quesitacoes='';
         this.usuario='';

    
     }
  
  }
  