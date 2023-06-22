function(instance, properties, context) {

    const { you_js, value_type, return_a_lista, type_of_state, result_type } = properties;
    const { publishState, triggerEvent} = instance;
    const {reportDebugger} = context;


    function zeroQodeExportDateinState(value) {


        let clientArray;
        if (return_a_lista){

            clientArray = value.map( item => item.toString());
        }


        ( !return_a_lista )
            ? publishState( "return_you_value", value.toString())
            : publishState( "return_you_list_with_values", clientArray);

    }
    async function clientFunction() {
        try{
            
        eval(you_js);
        triggerEvent("the_function_has_been_executed");
            
        } catch(err) {
            
            reportDebugger(err);
            triggerEvent("custom_js_error");
            
		}
        
		
    }

    clientFunction();


}