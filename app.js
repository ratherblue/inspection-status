const express = require('express');
const app = express();
const port = 3000;
const http = require('follow-redirects').http;
const url = require('url');
const axios = require('axios');

app.get('/', (req, res) => {
  // get project number from url
  const params = url.parse(req.url, true).query;

  // example project numbers: 20073038 20073039 20073040 20073041
  requestPermitAxios(Number(params.q), 'QQ', res)
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

function requestPermitAxios(projectNumber, permitTypeCode, res) {
  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  const data = `ProjectNo=${projectNumber}&PermitTypeCode=${permitTypeCode}&Submit=Submit`;

  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  axios({
    method: 'post',
    url: 'https://www.pdinet.pd.houstontx.gov/cohilms/webs/Inspn_Status.asp',
    data: data
  }, options)
    .then((response) => {
      console.log(response);

      const data = response.data;

      if (data.includes('ErrorMsg = The Specified Project Number is Not on File')) {
        res.send(`The Specified Project Number <b>${projectNumber}</b> is Not on File`);
      } else {
        var output = [];
        output.push(`<b>Project number</b>: ${projectNumber}`);
        output.push(`<b>Description</b>: ${getDescription(data)}`);
        output.push(getTableContent(data));
        res.send(output.join('<br>'));
      }
    }, (error) => {
      console.log(error);
    });
}

function getDescription(data) {
  return data
    .split('<TD class="content_small" width="20%" align="Right" bgColor="#D5E6FF"><b>Description:')[1]
    .split('<TD class="content" align="left" bgColor="#ededed">')[1]
    .split('</td>')[0]
}

function getTableContent(data) {
  const tableStart = '<TABLE ALIGN="left" BORDER="1" WIDTH="630" CELLSPACING="0" CELLPADDING="0">'
  return tableStart + data
    .split(tableStart)[1]
    .split('<!-- InstanceEndEditable -->')[0]
}
