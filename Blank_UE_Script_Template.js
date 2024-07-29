/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */

//Start of script
//SuiteScript Define fucntion / Imported NetSuite modules
define(['N/log', 'N/search', 'N/record'],

//SuiteScript Define callback function
function(log, search, record) {
    
    //execute function
    function beforeSubmit(context) {
        
        //Try catch logging
        try {


        }
        catch{
                //Error catch logging 
                log.error(ex.stack);
                log.error('AS ERROR', JSON.stringify(ex));
        }
    }
    
        // The return statement that identifies the entry point funtions.
        return {
            beforeLoad: myBeforeLoad,
            beforeSubmit: myBeforeSubmit,
            afterSubmit: myAfterSubmit
        }; 
});
