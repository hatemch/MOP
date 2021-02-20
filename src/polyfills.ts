/*
  * Este arquivo inclui polyfills necessários ao Angular e é carregado antes do aplicativo.
  * Você pode adicionar seus próprios polyfills extras a este arquivo.
  *
  * Este arquivo é dividido em duas seções:
  * 1. Polyfills do navegador. Estes são aplicados antes de carregar o ZoneJS e são classificados pelos navegadores.
  * 2. Importações de aplicativo. Arquivos importados após ZoneJS que devem ser carregados antes do seu principal
  *      Arquivo.
  *
  * A configuração atual é para os chamados navegadores "evergreen"; as últimas versões dos navegadores que
  * atualizar-se automaticamente. Isso inclui o Safari> = 10, o Chrome> = 55 (incluindo o Opera),
  * Edge> = 13 na área de trabalho e iOS 10 e Chrome no celular.
  *
  * Saiba mais em https://angular.io/guide/browser-support
*/

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.

/**
 * Animações da Web `@ angular / navegador de plataforma / animações
 * Necessário somente se o AnimationBuilder for usado dentro do aplicativo e usar o IE / Edge ou o Safari.
 * Suporte de animação padrão em Angular não requer nenhum polyfills (como de Angular 6.0).
 * /
// import 'web-animations-js'; // Execute `npm install --save web-animations-js`.


/**

 * Por padrão, o zone.js corrigirá todas as possíveis macroTask e DomEvents.
 * o usuário pode desativar partes do patch macroTask / DomEvents definindo os seguintes flags
 * porque esses sinalizadores precisam ser configurados antes de o `zone.js` ser carregado e o webpack
 * vai colocar a importação no topo do pacote, então o usuário precisa criar um arquivo separado
 * neste diretório (por exemplo: zone-flags.ts) e coloque os seguintes sinalizadores
 * nesse arquivo e adicione o seguinte código antes de importar o zone.js.
 * importar './zone-flags.ts';
 *
 * Os sinalizadores permitidos em zone-flags.ts estão listados aqui.
 *
 * Os seguintes sinalizadores funcionarão para todos os navegadores.
 *
 * (janela como qualquer) .__ Zone_disable_requestAnimationFrame = true; // desativar o patch requestAnimationFrame
 * (janela como qualquer) .__ Zone_disable_on_property = true; // desabilitar o patch onProperty como onclick
 * (janela como qualquer) .__ zone_symbol__BLACK_LISTED_EVENTS = ['scroll', 'mousemove']; // disable disable eventNames especificado
 *
 * nas ferramentas de desenvolvedor do IE / Edge, o addEventListener também será empacotado por zone.js
 * com o seguinte sinalizador, ele irá ignorar o patch `zone.js` para o IE / Edge
 *
 * (janela como qualquer) .__ Zone_enable_cross_context_check = true;
 
**/

import './zone-flags.ts';

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */

import 'zone.js/dist/zone';  // Included with Angular CLI.


/***************************************************************************************************
 * APPLICATION IMPORTS
 */
