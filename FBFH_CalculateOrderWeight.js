/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */

//Start of script
//Encapsulating Log fucntion
define(['N/log', 'N/search'],
    function(log, search) {
        //beforeSubmit function
        function beforeSubmit(context) {
            //Try catch logging
            try {
                //setting script varibles
                let totalWeight = 0;

                //Getting order record and item line count
                log.debug('start');
                let rec = context.newRecord;
                let totalLines = rec.getLineCount({
                    sublistId: 'item'
                });

                //Looping through order line items
                for (let i = 0; i < totalLines; i++) {
                    //Getting item internal ID
                    let itemID = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                    log.debug(itemID);

                    //Getting item card weight
                    let itemweight_kvp = search.lookupFields({
                        type: search.Type.ITEM,
                        id: itemID,
                        columns: 'weight'
                    });
                    let itemweight = itemweight_kvp["weight"];
                    log.debug(itemweight);

                    //Setting order line item  weight (Custom Column)
                    rec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_fb_mhi_item_weight',
                        line: i,
                        value: parseFloat(itemweight)
                    });
                  
                    //Getting item quantity 
                    let qty = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });

                    //Setting order line item weight total (Custom Column)
                    rec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_mhi_total_item_weight',
                        line: i,
                        value: parseFloat(itemweight * qty)
                    });

                    //Running total of order weight
                    totalWeight += parseFloat(itemweight * qty);
                }

                //Setting order total weigth field
                rec.setValue({
                    fieldId: 'custbody_fb_mhi_total_weight_order',
                    value: totalWeight
                });
            } catch (ex) {
                //Error catch logging 
                log.error(ex.stack);
                log.error('AS ERROR', JSON.stringify(ex));
            }
        }

        //return function
        return {

            beforeSubmit: beforeSubmit,

        }
    });