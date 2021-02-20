import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationsService {

  constructor() { }

  /* ------------------------------------------- NUMBERS ONLY ----------------------------------------- */
  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }
  /* ------------------------------------------- END NUMBERS ONLY ----------------------------------------- */
  /* ------------------------------------------- MASK db to format CPF  ----------------------------------------- */
  parseIDDBtoFormat(id: any): string {
    if (id == "") {
      return id
    } else {
      let parseId: string;
      if (id.length == 14) { //CNPJ
        id = id.toString();
        parseId = id.substring(0, 2) + '.' + id.substring(2, 5) + '.' + id.substring(5, 8) + '/' + id.substring(8, 12) + '-' + id.substring(12, 14)
        return parseId;
      } if (id.length == 11) { //CPF
        id = id.toString();
        parseId = id.substring(0, 3) + '.' + id.substring(3, 6) + '.' + id.substring(6, 9) + '-' + id.substring(9, 11)
        return parseId;
      } else {
        return id
      }
    }
  }
  /* ------------------------------------------- END MASK db to format CPF  ----------------------------------------- */
  /* ------------------------------------------- MASK CPF  ----------------------------------------- */
  /* ValString: value to be validated
       idComponent: this is the id of your HTML component. For example id="" 
    */
  private DECIMAL_SEPARATOR = ".";
  private GROUP_SEPARATOR = ",";
  private pureResult: any;
  private maskedId: any;
  private val: any;
  private v: any;

  formatCPF(valString: any, idComponent: any) {

    let mask: string;

    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);

    if (parts[0].length > 0 && parts[0].length <= 11) { // this is for CPF validation
      mask = this.cpf_mask(parts[0]);

    } else {
      // This is to separate string, maybe you would like to use to make validations in the future
      mask = parts[0].substring(0, 11);
    }

    //Warning: This is old code but it works, if you find a better solution 
    // just tell me. Your friend JC.
    (<HTMLInputElement>document.getElementById(idComponent)).value = mask;
  }

  private cpf_mask(v) {
    v = v.replace(/\D/g, ''); //Elimina todo lo que no es Digito
    v = v.replace(/(\d{3})(\d)/, '$1.$2'); //Coloca punto entre el trecero y cuarto digito
    v = v.replace(/(\d{3})(\d)/, '$1.$2'); //Coloca punto entre el trecero y cuarto digito
    //de nuevo (para el segundo bloque de números)
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); //Coloca un guion entre Coloca el tercero y cuarto digito del ultimo bloque
    return v;
  }
  /* ------------------------------------------- END MASK CPF ------------------------------------------ */
  /* ------------------------------------------- MASK PHONE ----------------------------------------- */
  formatTelefone(valString: any, idComponent: any) {

    let mask: string;

    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);

    if (parts[0].length > 0 && parts[0].length <= 10) { // this is for CPF validation
      mask = this.phone(parts[0]);

    } else if (parts[0].length <= 11) {  // this is for CNPJ validation
      mask = this.movil(parts[0]);
    } else {
      // This is to separate string, maybe you would like to use to make validations in the future
      mask = parts[0].substring(0, 11);
    }

    //Warning: This is old code but it works, if you find a better solution 
    // just tell me. Your friend JC.
    (<HTMLInputElement>document.getElementById(idComponent)).value = mask;

  }

  private unFormat(val) {
    if (!val) {
      return '';
    }
    val = val.replace(/\D/g, '');

    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  };

  phone(v) {
    v = v.replace(/\D/g, ''); //Elimina todo lo que no es Digito
    v = v.replace(/(\d{2})(\d)/, '($1)$2'); //set ()
    v = v.replace(/(\d{4})(\d)/, '$1-$2'); // set -
    return v;
  }

  movil(v) {
    v = v.replace(/\D/g, ''); //Elimina todo lo que no es Digito
    v = v.replace(/(\d{2})(\d)/, '($1)$2'); //set ()
    v = v.replace(/(\d{5})(\d)/, '$1-$2'); // set -
    return v;
  }
  /* ------------------------------------------- END MASK PHONE ----------------------------------------- */

  public convertToNumber(value: string) {
    if (value) {
      value = value.replace(/\D/g, '');
    } else {
      value = "";
    }
    return value;
  }

  /* ------------------------------------------- CONVER TO NUMBERS NUMBERS ----------------------------------------- */
  public convertCPFtoNumber(value: any) {
    if (value) {
      value = value.replace(/\./g, '');
      value = value.replace(/\-/g, '');
      value = value.replace(/\//g, '');
      value = value.replace(/\(/g, '');
      value = value.replace(/\)/g, '');
    } else {
      value = "";
    }
    return value;
  }
  /* ------------------------------------------- END CONVER TO NUMBERS NUMBERS ----------------------------------------- */

  validateRG(rg: string) {

    if (rg) {
      if (rg.match(/^\d+/)) return true;
      return false
    }
    return false
  }


  /* ------------------------------------------- MASK CEP ----------------------------------------- */

  formatcep(valString: any, idComponent: any) {

    let mask: string;

    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormatcep(val).split(this.DECIMAL_SEPARATOR);

    if (parts[0].length <= 8) {  // this is for CEP validation
      mask = this.cep(parts[0]);
    }
    else {
      // This is to separate string, maybe you would like to use to make validations in the future
      mask = parts[0].substring(0, 8);
    }

    (<HTMLInputElement>document.getElementById(idComponent)).value = mask;

  }

  unFormatcep(val) {
    if (!val) {
      return '';
    }
    val = val.replace(/\D/g, '');

    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  };

  cep(v) {
    v = v.replace(/\D/g, ''); //Remove tudo o que não é dígito
    v = v.replace(/^(\d{5})(\d)/, '$1-$2'); //Coloca - entre o quinto e o sexto dígito
    return v;
  }
  /* ------------------------------------------- END MASK CEP ------------------------------------------ */


  /**
   * FORMAT RG
   */

  formatRG(valString: any, idComponent: any) {

    // let mask: string;

    // if (!valString) {
    //   return '';
    // }
    // let val = valString.toString();
    // const parts = this.unFormatcep(val).split(this.DECIMAL_SEPARATOR);

    // if (parts[0].length <= 10) {  // this is for RG validation
    //   mask = this.rg(parts[0]);
    // }
    // else {
    //   // This is to separate string, maybe you would like to use to make validations in the future
    //   mask = parts[0].substring(0, 10);
    // }

    // (<HTMLInputElement>document.getElementById(idComponent)).value = mask;

    let mask: string;

    if (!valString) {
      return '';
    }
    
    mask = valString.toString();
    mask = mask.replace(/\D/g, ''); //Remove tudo o que não é dígito

    if(mask.length > 2)
    {
      mask = mask.substring(0, mask.length - 2) + '-' + mask.substring(mask.length - 2, mask.length);
    }
    
    (<HTMLInputElement>document.getElementById(idComponent)).value = mask;

  }

  rg(v) {
    v = v.replace(/\D/g, ''); //Remove tudo o que não é dígito

    //v = v.replace(/^(\d{5})(\d)/, '$1.$2'); //Coloca ponto entre o segundo e o terceiro dígitos
    v = v.replace(/^(\d{8})(\d)/, '$1-$2'); //Coloca ponto entre o quinto e o sexto dígitos
    return v;
  }
}
