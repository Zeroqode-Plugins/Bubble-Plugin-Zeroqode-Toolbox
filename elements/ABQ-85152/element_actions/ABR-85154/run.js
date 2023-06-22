function(instance, properties, context) {
		
	
     const keys = ['_p_field1', '_p_field2', '_p_field3', '_p_field4', '_p_field5', '_p_field6', '_p_field7',
                '_p_field8', '_p_field9', '_p_field10', '_p_field11', '_p_field12', '_p_field13', '_p_field14', '_p_field15', '_p_field16',
                '_p_field17'];
    
    const bubbleState = {};
    keys.forEach( field => {
        
    bubbleState[field] = [];
        
    })

	let { xml, selected_fields} = properties; 
	const body = document.querySelector('body');
	const divWithXML = document.querySelector('#xml');

    if(!divWithXML){
        body.insertAdjacentHTML('beforebegin', `<div id="xml"> ${xml}<d/iv>` );
        
    } else {
		divWithXML.innerHTML = xml;
	}
	
    const divXML = document.querySelector('#xml');
    
   	selected_fields = selected_fields.split(',');
    selected_fields = selected_fields.forEach( (item, index) => {
            const tags = divXML.querySelectorAll(item.trim());
        	const htmlText = []
             Array.from(tags).forEach((item, index) => {
				htmlText.push(item.innerText);
                
			});
		
        	bubbleState[`_p_field${index+1}`].push(...htmlText);
    })
	
  	console.log(bubbleState);
	instance.publishState('result', bubbleState);


}