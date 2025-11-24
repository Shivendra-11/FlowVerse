  export const getLanguageId = (language) => {
    let languageId = {
      "c++": 54,
      java: 62,
      python: 71,
      javascript: 63,
      c: 50,
      perl: 82,
    };
    return languageId[language];
  };

  export const submitBatch = async (submissions) => {
    const axios = require("axios");

    const options = {
      method: "GET",
      url: "https://attm2x-m2x-v1.p.rapidapi.com/devices",
      params: {
        limit: "10",
        sort: "created",
        dir: "desc",
      },
      headers: {
        "x-rapidapi-key": "ca31f4c020mshfad380e0449a47cp1787d9jsndafc0c7097d1",
        "x-rapidapi-host": "attm2x-m2x-v1.p.rapidapi.com",
      },
    };

    async function fetchData() {
      try {
        const response = await axios.request(options);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }

    return await fetchData();
  };

 export const submitTokenres=async (submitToken)=>{
    const axios = require('axios');

  const options = {
    method: 'GET',
    url: 'https://judge0-extra-ce1.p.rapidapi.com/submissions/batch',
    params: {
      tokens: submitToken.join(','),
      base64_encoded: 'true',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': 'ca31f4c020mshfad380e0449a47cp1787d9jsndafc0c7097d1',
      'x-rapidapi-host': 'judge0-extra-ce1.p.rapidapi.com'
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  
  while(true){
    const result = await fetchData();
    const IsresultObtained=result.every((res)=>res.status.id>2);
    if(IsresultObtained){
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}


