/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/search', 'N/runtime', 'N/plugin'], function(search, runtime, plugin) {

    function setItemId(context) {
      if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.COPY) return;
      var MHI = plugin.loadImplementation({
        type: 'customscript_fb_mhi_library_plugin',
        implementation: 'default'
      });
      var currentRecord = context.newRecord,
      itemMct = currentRecord.getValue('class');
      log.debug("jtest", currentRecord.getValue('class'))
       log.debug("currentRecord : type ",currentRecord.type);
      var itemType = currentRecord.type;
      var suffixLength = runtime.getCurrentScript().getParameter('custscript_fb_mhi_autonumber_length') || 5;
        log.debug("SuffixLength ", suffixLength)
      if (!itemMct) return;
  
      var itemId = MHI.createItemNumber(itemMct, suffixLength);
      log.debug("itemMct : itemid ",itemMct + ":" + itemId)
      currentRecord.setValue('itemid', itemId);
      
    }
  
    return {
      beforeSubmit: setItemId
    }
  });
  