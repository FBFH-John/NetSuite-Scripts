/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */

//Start of script
//SuiteScript Define fucntion / Imported NetSuite modules
define(['N/log', 'N/search', 'N/record'],

//SuiteScript Define callback function
function(log, search, record) {
    
    //execute function
    function execute(context) {
        
        //Try catch logging
        try {


        }
        catch{
                //Error catch logging 
                log.error(ex.stack);
                log.error('AS ERROR', JSON.stringify(ex));
        }
    }
    
    // SuiteScript entry point function
    return {
        execute: execute
    };
});
