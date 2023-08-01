/**
 *    ____                  __________
 *   / __ \_   _____  _____/ __/ / __ \_      __
 *  / / / / | / / _ \/ ___/ /_/ / / / / | /| / /
 * / /_/ /| |/ /  __/ /  / __/ / /_/ /| |/ |/ /
 * \____/ |___/\___/_/  /_/ /_/\____/ |__/|__/
 *
 * The copyright indication and this authorization indication shall be
 * recorded in all copies or in important parts of the Software.
 *
 * @github https://github.com/0verfl0w767
 *
 */
import * as fs from 'fs'
import { js2xml, xml2json, xml2js } from 'xml-js'
const getResponse = async () => {
  const requestXML = fs.readFileSync('./request/request.xml', 'utf-8')

  const response = await fetch(
    'http://sugang.suwings.syu.ac.kr/websquare/engine/proworks/callServletService.jsp',
    {
      method: 'POST',
      body: requestXML,
      headers: { 'Content-Type': 'application/xml; charset=UTF-8' },
    },
  )

  if (!response.ok) {
    response.text().then((text) => {
      throw new Error(text)
    })
  }

  const rawXML = await response.text()
  const rawJSON = xml2json(rawXML)

  fs.writeFile('./response/response.xml', rawXML, (err) => {
    if (err) {
      console.log(err)
    }
  })

  fs.writeFile('./response/response.json', JSON.stringify(JSON.parse(rawJSON), null, 2), (err) => {
    if (err) {
      console.log(err)
    }
  })
}

const getConvert = () => {
  const response = JSON.parse(fs.readFileSync('./response/response.json', 'utf-8'))

  let infos: any = []

  for (let element of response['elements']) {
    for (let elemen of element['elements']) {
      for (let eleme of elemen['elements']) {
        let department = ''
        let lecture = ''
        let professor = ''
        let limit = 0
        let basket = 0

        for (let elem of eleme['elements']) {
          if (elem['name'] == 'FCLT_NM') department = elem['attributes']['value']
          if (elem['name'] == 'SBJT_NM') lecture = elem['attributes']['value']
          if (elem['name'] == 'STF_NM') professor = elem['attributes']['value']
          if (elem['name'] == 'LIMIT_CNT') limit = elem['attributes']['value']
          if (elem['name'] == 'APLY_CNT') basket = elem['attributes']['value']
        }

        let info = {
          '학부(과)': department,
          '강좌명': lecture,
          '교수명': professor,
          '제한인원': limit,
          '장바구니': basket,
          '경쟁률': basket / limit,
        }

        infos.push(info)
      }
    }
  }

  const today = new Date()
  const year = today.getFullYear()
  const month = ('0' + (today.getMonth() + 1)).slice(-2)
  const day = ('0' + today.getDate()).slice(-2)
  const hours = ('0' + today.getHours()).slice(-2)
  const minutes = ('0' + today.getMinutes()).slice(-2)
  const seconds = ('0' + today.getSeconds()).slice(-2)
  const dateString = year + '-' + month + '-' + day
  const timeString = hours + ':' + minutes + ':' + seconds

  let convert = {
    'time': dateString + ' ' + timeString,
    'data': infos,
  }

  fs.writeFile('./response/convert.json', JSON.stringify(convert, null, 2), (err) => {
    if (err) {
      console.log(err)
    }
  })
}

getResponse()
getConvert()
