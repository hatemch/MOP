export class Infracao {
    Segmento: string = "";
    Grupo: string = "";
    usuario: string = ""; //(codigo) - Response
    codigo_infracao: string = ""; // codigo_infracao
    placa: string = ""; //Placa - Response
    DataInicial: string = "";
    DataFinal: string = "";
    HoraInicial: string = "";
    HoraFinal: string = "";
    UF: string = "";
    Municipio: string = "";

    //Response
    codigo: string;
    
    auto: string;
    ndetran: string;
    desdobramento_infracao: string; //Desdobramento
    descricao_infracao: string; //Descrição
    descricao_infracaoCurta: string; //DescriçãoCurta
    data_ocorrencia: string  //Data Infração
    hora_ocorrencia:string; //Hora Infração
    local_ocorrencia: string; //Local
    nome_municipio: string; //Municipio
    latitude: string;
    longitude: string;
    pim: string;
    imei: string;

    //more info to print
    enquadramento: string;
    matricula: string;
    marca: string;
    especie: string;
    renavam: string;
    municipio_veiculo: string;
    uf_veiculo: string;
    nome_condutor: string;
    cpf_condutor: string;
    cnh_condutor: string;
    condutor_ausente: string;
    codigo_municipio: string;
    uf_municipio: string;
    obs: string;

    // Para o reenvio de infracoes
    status2: string;
    reenviar: boolean;
    constructor() {
       this.reenviar = false;
    }

}




    

    
