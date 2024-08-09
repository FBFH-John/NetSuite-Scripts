/** 
 *@NApiVersion 2.x 
 *@NScriptType Portlet 
 */ 

 //Start of script
//SuiteScript Define fucntion / Imported NetSuite modules
define(['N/log', 'N/search', 'N/runtime', 'N/record'], 
    
    //SuiteScript Define callback function
    function(log, search, runtime, record) {

        //Render function
        function render(params) {

            //Setting portlet Tile 
            params.portlet.title = 'My Portlet';

            //Defining HTML content
            var content = '<td><span><b>Hello!!!</b></span></td>';
            
            //Setting portlet object with HTML content
            params.portlet.html = content;
        }
        return {
            render: render
        };
});