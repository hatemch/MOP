export class VeiculoGuia {
    codigo:string;
    numguia:string;
    placa: string;
    marca: string;
    tipo_local:number;
    tipo_veiculo:string;
    ano_mod:string;
    modelo:string;
    ano_fab:string;
    chassi: string;
    renavam: string;
    descricao: string;
    descricao_local: string;
    quesitacoes:string;
    usuario:string;
    //properties for the exames pericias part
    codigoExameVeiculo: string;
    idExame:string;
    examen_requisitado: any;
    nome_examen_requisitado: any;
   
 
  
     constructor() {
         this.codigo='';
         this.numguia='';
         this.placa='';
         this.marca='';
         this.tipo_local=0;
         this.tipo_veiculo='';
         this.ano_fab='';
         this.ano_mod='';
         this.modelo='';
         this.chassi='';
         this.renavam='';
         this.descricao='';
         this.descricao_local='';
         this.quesitacoes='';
         this.usuario='';

    
     }
  
  }
  