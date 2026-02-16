const axios = require('axios');

const checkWebsite=  async(url) => {

    const start = Date.now();

    try{
         const response = await axios.get (url, {
            timeout: 5000,
            validateStatus: () => true

         });

         const responseTime = Date.now() - start;

         return{
            status: response.status >= 200 && response.status <400 ? "UP" : "DOWN",
            responseTime: responseTime,
            statusCode : response.status

         };
        
        
        }
        catch(error){
            return {
                status: "DOWN",
                responseTime: null,
                statusCode: null
            }
        }


}
module.exports = checkWebsite;