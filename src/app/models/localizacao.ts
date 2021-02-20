export class Localizacao {

    codigo: string;
    usuario: string;
    data_posicao: string;
    latitude: string;
    longitude: string;
    pim: string;
    imei: string;
    versao: string;
    data_posicao2: string;
    data_insercao: string;
    data_atualizacao:string;
    grupo:string;
    segmento:string ='';
    agenteOnline: boolean = false;
    agenteOffline: boolean= false;
    //to do the logic of wich user is login or not
    dataExpiracaoSesao: string;
}