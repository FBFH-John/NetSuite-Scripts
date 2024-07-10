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
            
            //Loading array with record internal IDs
            let rmaArr = ['1557126', '1556882', '1556884', '1557250', '1556996', '1556887', '1557242', '1557356', '1558792', '1558793', '1557019', '1558568', '1552248', '1552250', '1557014', '1557011', '1557012', '1559025', '1559026', '1557006', '1559007', '1557241', '1557251', '1557363', '1557364', '1557368', '1557366', '1558685', '1558998', '1558999', '1559000', '1559016', '1558684', '1556563', '1556567', '1557694', '1557253', '1559013', '1558026', '1558028', '1558031', '1557003', '1557004', '1557127', '1557367', '1557369', '1557699', '1557702', '1557703', '1557705', '1558024', '1558030', '1558452', '1558025', '1556570', '1556881', '1556990', '1557121', '1557708', '1558575', '1558678', '1558682', '1558683', '1552251', '1552252', '1558791', '1559009', '1557120', '1557123', '1557138', '1556991', '1557124', '1558450', '1557357', '1557358', '1558688', '1558689', '1558690', '1552255', '1556880', '1557355', '1558681', '1556992', '1556993', '1556994', '1556995', '1556997', '1557134', '1557135', '1558997', '1552257', '1558023', '1557245', '1557246', '1552253', '1558687', '1559003', '1558021', '1559008', '1557917', '1558019', '1557018', '1557701', '1558680', '1557243', '1557247', '1557249', '1557122', '1556877', '1557710', '1557125', '1557244', '1557002', '1557712', '1557716', '1558347', '1558679', '1557359', '1557360', '1557361', '1557362', '1558796', '1557015', '1557017', '1558795', '1559022', '1559023', '1559024', '1558570', '1556562', '1557248', '1557700', '1559010', '1559011', '1559004', '1559006', '1557136', '1558348', '1557000', '1556878', '1558574', '1558565', '1558566', '1557008', '1559005', '1558560', '1559001', '1556998', '1556999'];

            //Main loop
            //Loads a record object, sets the memo line, zeros out line item quantity, and sets 'isclosed' field to true.    
            for (let i = 0; i < rmaArr.length; i++) {
                
                //Loading record object
                var rmaRecord = record.load({
                    type: record.Type.RETURN_AUTHORIZATION, 
                    id: rmaArr[i],
                    isDynamic: false
                });

                //Debug line for testing
                //log.debug(rmaRecord.getValue({fieldId: 'tranid'}));

                //Seting memo line
                rmaRecord.setValue('memo', 'RMA created by mistake. Closing.');

                //Setting line item quantity
                rmaRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: 0,
                    value: 0
                });

                //Setting line item 'isclosed'
                rmaRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'isclosed',
                    line: 0,
                    value: true
                });

                //Saving record
                rmaRecord.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: false
                });

            }

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
