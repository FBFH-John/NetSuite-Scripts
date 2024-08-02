/**
*@NApiVersion 2.1
*@NScriptType UserEventScript
*/

//Start of script
//SuiteScript Define fucntion / Imported NetSuite modules
define(['N/log', 'N/search', 'N/runtime', 'N/record'],

    //SuiteScript Define callback function
    function(log, search, runtime, record) {
       
       //beforeLoad function
        function beforeLoad(context) {
            
            // Exiting script if context is not "Create" or "Copy"
            if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.COPY) return;
            
            //Setting new record object
            var currentRecord = context.newRecord;

            //Setting item ID default value
            currentRecord.setValue('itemid', 'To Be Generated');
        }       
        //beforeSubmit function
       function beforeSubmit(context) {
           
           //Try catch logging
           try {

             //Exiting script if the record event isn't "Create" and "Copy" 
             if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.COPY) return;
             
            //Setting current record object via context module
            var currentRecord = context.newRecord;
    
            //Getting Class from runtime record
            var newItemClassID = currentRecord.getValue('class');
    
            //Searching for item number prefix based on newItemClassID
            var tempSearchObj = search.lookupFields({
                type: search.Type.CLASSIFICATION,
                id: newItemClassID,
                columns: 'custrecord_fbfh_item_num_prefix'
            });
            //Grabbing newItemNumPrefix from tempSearchObj
            var newItemNumPrefix = tempSearchObj["custrecord_fbfh_item_num_prefix"];
            
            //Getting item number suffix from class record
            var tempSearchObj = search.lookupFields({
                type: search.Type.CLASSIFICATION,
                id: newItemClassID,
                columns: 'custrecord_fbfh_item_num_length'
            });
            //Grabbing newItemNumLength from tempSearchObj
            var newItemNumLength = tempSearchObj["custrecord_fbfh_item_num_length"];
    
            //Validating needed inputs before find next item num in sequence
            if ((!newItemClassID) || (!newItemNumPrefix)) {
                //Throwing error and exting script
                log.error("The 'Class ID' or the 'Item Number Prefix' could not be found." + " newItemClassID value: " + newItemClassID + " / newItemNumPrefix value: " + newItemNumPrefix);
                let errorMessage = "The 'Class ID' or the 'Item Number Prefix' could not be found. Please check the class records and try again.";
                throw errorMessage;
            }
    
            //Setting last number and new item number varible 
            var lastCurrentItemNumber = 0;
            var newItemNumber = '';
    
            //Creating search object to find the curent max item number 
            var maxItemNumSearchObj = search.create({
              type: 'item',
              filters: [
                ['name', 'startswith', newItemNumPrefix]
              ],
              columns: [
                search.createColumn({
                  name: 'itemid',
                  summary: 'MAX'
                })
              ]
            });
            
            //Grabbing search results from search object
            maxItemNumSearchObj.run().each(function (result) {
                
                //Grabbing lastCurrentItemNumber from the result set and incrementing newItemNumber by 1 
                lastCurrentItemNumber = result.getValue({ name: 'itemid', summary: 'MAX' });

                //Checking if lastCurrentItemNumber is empty
                if (lastCurrentItemNumber !== "") {

                    //Setting newItemNumber
                    newItemNumber = '' + (parseInt(lastCurrentItemNumber) + 1);

                }else{

                    //Setting the new item number with the class prefix
                    newItemNumber = '' + newItemNumPrefix; 
    
                    //If search result set is empty, scripts assumes it's the first item in the class. Creates new number set based on newItemNumPrefix and newItemNumLength
                    for (let x = 1; x <= newItemNumLength; x++) {
                        
                        //Creating new item number from prefix and length
                        newItemNumber = newItemNumber + '0';   
                    }
                }
            });
    
            //Setting new Item Number on current record
            log.debug("new item id",newItemNumber);
            currentRecord.setValue('itemid', newItemNumber); 
           }
           catch (ex) {
                   //Error catch logging 
                   log.error(ex.stack);
                   log.error('AS ERROR', JSON.stringify(ex));
           }
       }
       
       // SuiteScript entry point function
       return {
           beforeSubmit: beforeSubmit,
           beforeLoad : beforeLoad
       };
    });