export class OutrosObjetos {
    codigoObjeto:string;
    numguia:string;
    tipo_local:number;
    tipo_objeto:number;
    unidade_medida:number;
    quantidade:string;
    descricao: string;
    descricao_local: string;
    quesitacoes:string;
    usuario:string;
   
    examen_requisitado: any;
    nome_examen_requisitado: any;
  
     constructor() {
         this.codigoObjeto='';
         this.numguia='';
         
         this.tipo_local=0;
         this.tipo_objeto=0;
         this.unidade_medida=0;
         this.quantidade='';
         this.descricao='';
         this.descricao_local='';
         this.quesitacoes='';
         this.usuario='';

    
     }
  
  }
  