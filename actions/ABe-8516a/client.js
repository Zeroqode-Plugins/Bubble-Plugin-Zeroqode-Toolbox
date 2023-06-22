function(properties, context) {


	const { xml, url_endpoint } = properties;
    function IsJsonString(str) {
            try {
                JSON.parse(xml);
                
            } catch (e) {
                
                return false;
                
            }
            return true;
    }
	let bodyForBubble;

	if ( !IsJsonString(xml)) {   
     
        const json = txml.parse(xml);
        bodyForBubble = JSON.stringify(json);
	
		console.log(json);

    } else {
        
        bodyForBubble = xml
        
    }

    const body = {
	method:'POST',
	headers: {
      'Content-Type': 'application/json'
     
    },
	 body: bodyForBubble
}

fetch(url_endpoint, body)
  .then(response => response.json())
  .then(data => console.log(data));

}