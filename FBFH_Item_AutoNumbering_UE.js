/**
*@NApiVersion 2.1
*@NScriptType UserEventScript
*/

//Start of script
//SuiteScript Define fucntion / Imported NetSuite modules
define(['N/log', 'N/search', 'N/runtime', 'N/record'],

    //SuiteScript Define callback function
    function(log, search, runtime, record) {
        
        //beforeSubmit function
       function beforeSubmit(context) {

           //Begining script debug log
           log.debug("---Begin - FBFH_Item_AutoNumbering Script - Begin---", "---Begin - FBFH_Item_AutoNumbering Script - Begin---");

           //Try catch logging
           try {

                //Setting new record as current record object via context module
                var currentRecord = context.newRecord;

                //Calling itemAutoNumber function if the record event is "Create" or "Copy" 
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.COPY) { 

                    //Calling itemAutoNumber function - Finds the next item number based on class
                    itemAutoNumber(currentRecord);
                }
                
                //Calling itemStandardCosting function if the record event is "Create" or "Copy" 
                if (currentRecord.type == record.Type.INVENTORY_ITEM || currentRecord.type == record.Type.LOT_NUMBERED_INVENTORY_ITEM) {

                    //Calling itemStandardCosting - Sets standarding costing for donated items
                    itemStandardCosting(currentRecord);
                }

                //Ending Script debug log
                log.debug("---End FBFH_Item_AutoNumbering Script End---", "---End - FBFH_Item_AutoNumbering Script - End---");
                
                //Returning function
                return;
    
           }
           catch (ex) {
                   //Error catch logging 
                   log.error(ex.stack);
                   log.error('AS ERROR', JSON.stringify(ex));
                   log.error('error string', ex.toString());
           }
       }
       
       function itemStandardCosting (currentRecord) {
            //Getting Class from runtime record
            var itemClassID = currentRecord.getValue('class');

            //Begining script debug log
           log.debug("---Begin - FBFH_Item_AutoNumberinf Script / itemStandardCosting - Begin---", "---Begin - FBFH_Item_AutoNumberinf Script / itemStandardCosting - Begin---");


            //Chwcking to see if record class is a donated class
            if (itemClassID == 2 || itemClassID == 26) {

                //Declaring varibles
                var maxStandardCostVerID = 0;
                var pricePerPound = 0;

                //Grabbing item weight from conext record module
                var itemWeight = parseFloat(currentRecord.getValue('weight'));

                //Creating Search Object - Grabbing latest standard cost version based on internal id
                var tempSearchObj = search.create({
                    type: 'standardcostversion',
                    filters: [],
                    columns: [
                        search.createColumn({
                            name: 'internalid',
                            summary: 'MAX'
                        })
                    ]
                });

                //Executing search object
                tempSearchObj.run().each(function (result) {

                    //Grabbing the internal id of the latest standard cost version
                    maxStandardCostVerID = result.getValue({ name: 'internalid', summary: 'MAX' });
                });

                //Creating search object - Grabbing price per price field using the internal id from the last search
                tempSearchObj = search.create({
                    type: 'standardcostversion',
                    filters: [{
                        name: 'internalid',
                        operator: 'is',
                        values: [maxStandardCostVerID]
                    }],
                    columns: [
                        search.createColumn({
                            name: 'custrecord_fbfh_price_per_pound'
                        })
                    ]
                });

                //Executing temp search object
                tempSearchObj.run().each(function (result) {

                    //Grabbing stardard cost version - price per pound field 
                    pricePerPound = parseFloat(result.getValue({ name: 'custrecord_fbfh_price_per_pound'}));
                });

                //Setting purchased price to (price per pound x weight)
                currentRecord.setValue('cost', parseFloat((itemWeight * pricePerPound).toFixed(2)));

                //Grabbing total lines from Item record sublist locations
                let subListLines = currentRecord.getLineCount({
                    sublistId: 'locations'
                });

                //Setting location default pricing via sublist loop
                for (let i = 0; i < subListLines; i++) {

                    //Seeting default location cost to (price per pound x weight)
                    currentRecord.setSublistValue({
                        sublistId: 'locations',
                        fieldId: 'cost',
                        line: i,
                        value: parseFloat((itemWeight * pricePerPound).toFixed(2))
                    });
                    log.debug("loop: " + i, parseFloat((itemWeight * pricePerPound).toFixed(2)));
                }

            }
            //Ending script debug log
            log.debug("---End - FBFH_Item_AutoNumberinf Script / itemStandardCosting - End---", "---End - FBFH_Item_AutoNumberinf Script / itemStandardCosting - End---");

            //Returning function
            return;
        }

       function itemAutoNumber (currentRecord) {

            //Beginning script log message
            log.debug("---Begin - FBFH_Item_AutoNumberinf Script / itemAutoNumber - Begin---", "---Begin - FBFH_Item_AutoNumberinf Script / itemAutoNumber - Begin---");

            //Getting Class from runtime record
            var newItemClassID = currentRecord.getValue('class');

            //Debug log: newItemClassID
            log.debug("Function: itemAutoNumber", "newItemClassID:" + newItemClassID);

            //Searching for item number prefix based on newItemClassID
            var tempSearchObj = search.lookupFields({
                type: search.Type.CLASSIFICATION,
                id: newItemClassID,
                columns: 'custrecord_fbfh_item_num_prefix'
            });
            //Grabbing newItemNumPrefix from tempSearchObj
            var newItemNumPrefix = tempSearchObj["custrecord_fbfh_item_num_prefix"];

            //Debug log: newItemNumPrefix
            log.debug("Function: itemAutoNumber", "newItemNumPrefix:" + newItemNumPrefix);
            
            //Getting item number suffix from class record
            var tempSearchObj = search.lookupFields({
                type: search.Type.CLASSIFICATION,
                id: newItemClassID,
                columns: 'custrecord_fbfh_item_num_length'
            });
            //Grabbing newItemNumLength from tempSearchObj
            var newItemNumLength = tempSearchObj["custrecord_fbfh_item_num_length"];

            //Debug log: newItemNumLength
            log.debug("Function: itemAutoNumber", "newItemNumLength:" + newItemNumLength);
    
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
                ['nameinternal', 'startswith', newItemNumPrefix]
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

            //Looping until a good item number is found
            var loopflag = 1;

            while (loopflag === 1){

                //Debug log: newItemNumLength
                log.debug("Function: itemAutoNumber - Check loop", "newItemNumber:" + newItemNumber);

                //Checking to see if item number is availble
                //Creating search object to find the curent max item number 
                var checkItemNumSearchObj = search.create({
                    type: 'item',
                    filters: [
                    ['nameinternal', 'is', newItemNumber]
                    ],
                    columns: [
                    search.createColumn({
                        name: 'itemid'
                    })
                    ]
                })

                //Grabbing result count to see if result set is empty
                var checkItemNumSearchResult = checkItemNumSearchObj.runPaged().count;

                //Checking if result set is empty
                if (checkItemNumSearchResult > 0) {

                    //Adding 1 to newItemNumber abd looping to see if this a valid id number 
                    newItemNumber = '' + parseInt(newItemNumber) + 1;

                }else{

                    //Breaking loop if empty
                    loopflag = 2;
                }

            };

            //Debug log: newItemNumLength
            log.debug("Function: itemAutoNumber", "newItemNumber:" + newItemNumber);

            //Setting the itemid field on the new record 
            currentRecord.setValue('itemid', newItemNumber); 

            //Ending script log message
            log.debug("---End - FBFH_Item_AutoNumberinf Script / itemAutoNumber - End---", "---End - FBFH_Item_AutoNumberinf Script / itemAutoNumber - End---");
       }

       function setITemIDTBD (currentRecord) {
            /*
            // Exiting script if context is not "Create" or "Copy"
            if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.COPY) return;

            //Setting new record object
            var currentRecord = context.newRecord;

            //Setting item ID default value
            currentRecord.setValue('itemid', 'To Be Generated');
            */
        }
       
       // SuiteScript entry point function
       return {

        beforeSubmit: beforeSubmit

       }
    });