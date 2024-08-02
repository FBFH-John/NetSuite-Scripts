/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define(['N/log', 'N/search', 'N/runtime', 'N/record'], function(log, search, runtime, record) {
    function pageInit(context) {
      if (context.mode !== 'create' && context.mode !== 'copy') return;
      var currentRecord = context.currentRecord;
      currentRecord.setValue('itemid', 'To Be Generated');
    }
  
    
    return {
      pageInit: pageInit,
    }
  });
  