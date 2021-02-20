export class GuiaPericia {
    codigo: string;
    nome_guia: string;
    tipo_guia: string;
    ano: string;
    sequencial: string = '0';
    numero_periciando: string;
    data_registro: string;
    hora_registro: string;
    numero_procedimento: string;
    destino_lado: string;
    situacao: string;
    orgao: string;
    unidade: string;
    sigilosa: string = "N";
    resgistrado: string;
    autoridade: string='';
    usuario: string;
    motivoCancelamento: string='';

    //properties to use only for the search
    periodoRegistroDataInicio: string;
    periodoRegistroDataFin: string;
    periodoDoFatoDataInicio: string;
    periodoDoFatoDataFin: string;
    periciando:string;
    //para Asosiação do guias
    status2: string;
    reenviar: boolean;
    constructor() {
        this.reenviar = false;
    }
}