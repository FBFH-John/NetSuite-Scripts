/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

//Start of script
//SuiteScript Define fucntion and importing NetSuite modules
 define(['N/record', 'N/email', 'N/runtime'],
    //SuiteScript entry point function 
    function(record, email, runtime) {
        //
        function setItemLocationCosts(context) {
            /**
             * This function sets the standard costing for all locations in NeSuite for newly created "Donated" class items
             * @param context - The item record that was submitted.
             * @returns - Nothing
             */

            //Getting donated classes
            




            var currentRecord = context.newRecord;
            var productCat = currentRecord.getValue('class');
            var arrDonatedClass = runtime.getCurrentScript().getParameter('custscript_fb_mhi_donated_class').split(',');
            var isDonated;
            if(arrDonatedClass.length == 1){
                isDonated = productCat == arrDonatedClass[0]
            } else{
                isDonated = arrDonatedClass.indexOf(productCat) != -1
            }
            var lineCount = currentRecord.getLineCount('locations');
            
            try {
                if (isDonated) {
                var weight = currentRecord.getValue('weight');
                var costPerPound = runtime.getCurrentScript().getParameter('custscript_fb_mhi_cost_per_pound');
                var standardCost = parseFloat(weight * costPerPound);
                for (var i = 0; i < lineCount; i++) {
                    currentRecord.setSublistValue({
                    sublistId: 'locations',
                    fieldId: 'cost',
                    line: i,
                    value: standardCost
                    });
                }
                //Commented by AW on 2/24 request from Fatima 
                currentRecord.setValue('cost', standardCost);
                }
            } catch(e) {
                log.error({ title: 'Error', details: e });
                email.send({
                author: 10,
                recipients: 'sherri.lu@myersholum.com',
                subject: 'FB Automate Standard Costing UE Error',
                body: e
                });
            }
    }
  
    return {
      beforeSubmit: setItemLocationCosts
    }
  });
  