    function(instance, properties, context) {

        (async function () {
        		
            	instance.triggerEvent('start_search');


                let {
                    object_type,
                    file_name,
                    key,
                    constraint_type,
                    value,
                    origin_address,
                    range,
                    unit,
                    download_json,
                    sort_field,
                    descending,
                    field_object_type

                } = properties;


                const keys = ['_p_field1', '_p_field2', '_p_field3', '_p_field4', '_p_field5', '_p_field6', '_p_field7',
                    '_p_field8', '_p_field9', '_p_field10', '_p_field11', '_p_field12', '_p_field13', '_p_field14', '_p_field15', '_p_field16',
                    '_p_field17'];


                let selectedFields;

                if(properties.selectedFields){
                    selectedFields = properties.selectedFields.split(',');
                    selectedFields = selectedFields.map(item => item.trim());
                }
                let childObjectExtractFields;
                if(properties.child_object_extract_fields) {
                    childObjectExtractFields = properties.child_object_extract_fields.split(',');
                    childObjectExtractFields = childObjectExtractFields.map(item => item.trim());
                }

                let f;

                if (field_object_type){
                    f = field_object_type.split(',');
                    f = f.map(item => item.trim());
                }

                const {publishState} = instance;

                let cursor = 0;
                let remaining = 1;
                const appVersion = app.app_version;
                const appOrigin = document.location.origin;

                const objectDB = (object_type.includes('user')) ? object_type : object_type.toLowerCase().split('.')[1];
                const newCustomJSON = [];


                let constraints = [
                    {
                        "key": key,
                        "constraint_type": constraint_type
                    }
                ];


                if (value) constraints[0].value = value;
                if (constraint_type === 'geographic_search') {
                    constraints[0].value = {
                        "origin_address": encodeURIComponent(origin_address),
                        "range": range,
                        "unit": unit
                    }
                }


                while (remaining !== 0) {

                    let entityURL = `${appOrigin}/version-${appVersion}/api/1.1/obj/${objectDB}?cursor=${cursor}&constraints=${JSON.stringify(constraints)}`;

                    if (sort_field) {

                        entityURL = `${entityURL}&sort_field=${sort_field}&descending=${descending}`;

                    }

                    await fetch(entityURL)
                        .then((response) => {
                            return response.json();
                        })
                        .then( async (data) => {
                        	remaining = data.response.remaining;
                            cursor = data.response.cursor + data.response.count;

                            let bubbleJson = data.response.results;
                            
                            if(field_object_type) {
                                const promiseFetchesForEachObject = bubbleJson.map(object => {

                                    const promiseFetchesForEachField = f.map(field => {
                                        const objectField = object[field];

                                        if (!objectField) {
											object[field] = null;
                                            return Promise.resolve();
                                        }

                                        const objectLevelTow = objectField.map((idToAnotherObject) => {
                                            const urlForRequest = `${appOrigin}/version-${appVersion}/api/1.1/obj/${field}/${idToAnotherObject}`;

                                            return fetch(urlForRequest)
                                                .then((response) => {
                                                    return response.json();
                                                }).then(obj => {
                                                	object[field].shift();
                                                
                                                    if (!childObjectExtractFields) {
                                               
                                                        object[field].push(obj.response);
                                                    } else {
                                                        const newObjectFromChildObject = {};
                                                        childObjectExtractFields.forEach(item => {
                                                          
                                                            newObjectFromChildObject[item] = obj.response[item];                                                    
                                                            
                                                        });
														object[field].push(newObjectFromChildObject);

                                 
                                                    }
                                                });

                                        });

                                        return Promise.all(objectLevelTow);
                                    });

                                    return Promise.all(promiseFetchesForEachField);
                                });

                                await Promise.all(promiseFetchesForEachObject);
                            }
                            const dataGroupedByKeys = {};
                            keys.forEach(field => {
                                dataGroupedByKeys[field] = [];
                            });
                            bubbleJson.forEach( item => {
                                if(selectedFields) {
                                    const newObjectOnlyFieldsSelection = {};
                                    selectedFields.forEach(fieldName => {
                                        newObjectOnlyFieldsSelection[fieldName] = item[fieldName]
                                        }
                                    );
                                    newCustomJSON.push(newObjectOnlyFieldsSelection);
                                } else {
                                    newCustomJSON.push(item);
                                }

                                if (selectedFields) {
                                    keys.forEach((field, index) => {
                                        const userField = selectedFields[index];
                                        let fieldFromServerItem

                                        if (typeof (item[userField]) == 'object' && !Array.isArray(item[userField]) &&
                                            item[userField] !== null) {
                                            if (item[userField].hasOwnProperty('address')) {
                                                fieldFromServerItem = item[userField] ? item[userField]['address'] : '';
                                            }
                                        } else {
                                            fieldFromServerItem = item[userField] ? item[userField].toString() : '';
                                        }
                                        dataGroupedByKeys[field].push(fieldFromServerItem);


                                    })
                                    publishState('retunJson', dataGroupedByKeys);
                                }
                            })
                        });


						instance.triggerEvent('ended_search');
                }

                function download(filename, text) {

                    const elementLink = document.createElement('a');
                    elementLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    elementLink.setAttribute('download', filename);

                    elementLink.style.display = 'none';
                    document.body.appendChild(elementLink);

                    elementLink.click();
                    document.body.removeChild(elementLink);
                }
                if( newCustomJSON.length ){

                    if (download_json){
                        // Start file download.

                        const CustomJSONForExport = {[objectDB] : newCustomJSON};
                        download(`${file_name}.json`, JSON.stringify(CustomJSONForExport, null, 4));
                    }
                }

            }


        )();
    }