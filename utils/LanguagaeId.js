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

const submitBatch = async (submissions) => {
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

module.exports = { getLanguageId, submitBatch };
