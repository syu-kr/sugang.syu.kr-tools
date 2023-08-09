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

const type: string = '3' // 1: basket,  2: sugang, 3: closed sugang

const getResponse = async () => {
  const requestXML = fs.readFileSync('./request/request' + type + '.xml', 'utf-8')

  const response = await fetch('http://sugang.suwings.syu.ac.kr/websquare/engine/proworks/callServletService.jsp', {
    method: 'POST',
    body: requestXML,
    headers: { 'Content-Type': 'application/xml; charset=UTF-8' },
  })

  if (!response.ok) {
    response.text().then((text) => {
      throw new Error(text)
    })
  }

  const rawXML = await response.text()
  const rawJSON = xml2json(rawXML)

  fs.writeFile('./response/response' + type + '.xml', rawXML, (err) => {
    if (err) {
      console.log(err)
    }
  })

  fs.writeFile('./response/response' + type + '.json', JSON.stringify(JSON.parse(rawJSON), null, 2), (err) => {
    if (err) {
      console.log(err)
    }
  })
}

const getConvert = () => {
  const response = JSON.parse(fs.readFileSync('./response/response' + type + '.json', 'utf-8'))

  let infos: any = []

  for (let element of response['elements']) {
    for (let elemen of element['elements']) {
      for (let eleme of elemen['elements']) {
        let info = {}
        let lectnum = 0
        let area = ''
        let department = ''
        let lecture = ''
        let professor = ''
        let limit = 0
        let basket = 0
        let sugang = 0
        let notice = 0

        for (let elem of eleme['elements']) {
          if (elem['name'] == 'LECT_NO') lectnum = elem['attributes']['value']
          if (elem['name'] == 'CTNCCH_FLD_DIV_CD') area = elem['attributes']['value']
          if (elem['name'] == 'FCLT_NM') department = elem['attributes']['value']
          if (elem['name'] == 'SBJT_NM') lecture = elem['attributes']['value']
          if (elem['name'] == 'STF_NM') professor = elem['attributes']['value']
          if (elem['name'] == 'LIMIT_CNT') limit = elem['attributes']['value']
          if (elem['name'] == 'APLY_CNT') basket = elem['attributes']['value']
          if (elem['name'] == 'TLSN_LMIT_PRNS_CNT') limit = elem['attributes']['value']
          if (elem['name'] == 'ALLS_PRNS') sugang = elem['attributes']['value']
          if (elem['name'] == 'NOTI_CTNT') notice = elem['attributes']['value']
        }

        if (type == '1') {
          info = {
            '강좌번호': lectnum,
            '학부(과)': department,
            '강좌명': lecture,
            '교수명': professor,
            '제한인원': limit,
            '장바구니': basket,
            '경쟁률': basket / limit,
          }
        }

        if (type == '2') {
          info = {
            '강좌번호': lectnum,
            '영역구분':
              area == '03'
                ? '사회과학영역'
                : area == '04'
                ? '자연과학영역'
                : area == '07'
                ? '일반선택영역'
                : area == '12'
                ? '인성영역'
                : area == '13'
                ? '기초영역'
                : area == '15'
                ? '인문예술영역'
                : area,
            '학부(과)': department,
            '강좌명': lecture,
            '교수명': professor,
            '제한인원': limit,
            '신청인원': sugang,
            '공지': notice,
            '상태': +limit < +sugang ? '이상 감지' : +limit == +sugang ? '신청 불가' : '신청 가능',
          }
        }

        if (type == '3') {
          if (department == '공통(교양)' && +sugang >= 16) {
            continue
          }
          if (+sugang >= 8) {
            continue
          }
          // if (limit == sugang) {
          //   continue
          // }
          info = {
            '강좌번호': lectnum,
            '영역구분':
              area == '03'
                ? '사회과학영역'
                : area == '04'
                ? '자연과학영역'
                : area == '07'
                ? '일반선택영역'
                : area == '12'
                ? '인성영역'
                : area == '13'
                ? '기초영역'
                : area == '15'
                ? '인문예술영역'
                : area,
            '학부(과)': department,
            '강좌명': lecture,
            '교수명': professor,
            '제한인원': limit,
            '신청인원': sugang,
            '공지': notice,
          }
        }

        if (Object.keys(info).length != 0) infos.push(info)

        // if (
        //   (department == '공통(교양)' || department == '컴퓨터공학부') &&
        //   (+limit - +sugang == 1 || +limit - +sugang == 2 || +limit - +sugang == 3)
        // )
        //   infos.push(info)

        // if (department == '공통(교양)' || department == '컴퓨터공학부') infos.push(info)
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

  fs.writeFile('./response/convert' + type + '.json', JSON.stringify(convert, null, 2), (err) => {
    if (err) {
      console.log(err)
    }
  })
}

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

getResponse()

delay(4000).then(() => {
  getConvert()
})
