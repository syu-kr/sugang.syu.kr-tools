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
import * as xmljs from 'xml-js'

const parseXml = (xml: string): any => {
  return xmljs.xml2js(xml, { compact: true })
}

const buildXml = (obj: any): string => {
  return xmljs.js2xml(obj, { compact: true, spaces: 2 })
}

const mergeXml = (xml1: string, xml2: string): string => {
  const doc1 = parseXml(xml1)
  const doc2 = parseXml(xml2)

  const rows1 = doc1.vector.data ? (Array.isArray(doc1.vector.data) ? doc1.vector.data : [doc1.vector.data]) : []
  const rows2 = doc2.vector.data ? (Array.isArray(doc2.vector.data) ? doc2.vector.data : [doc2.vector.data]) : []

  const mergedRows = [...rows1, ...rows2]

  doc1.vector.data = mergedRows

  return buildXml(doc1)
}

const mergeFiles = () => {
  try {
    const xml1 = fs.readFileSync('./response/response0.xml', 'utf8')
    const xml2 = fs.readFileSync('./response/response1.xml', 'utf8')

    const mergedXml = mergeXml(xml1, xml2)

    fs.writeFileSync('merged.xml', mergedXml, 'utf8')
    console.log('XML 병합 완료.')
  } catch (error) {
    console.error('XML 병합 실패.', error)
  }
}

const getConvert = () => {
  const response = JSON.parse(xmljs.xml2json(fs.readFileSync('./merged.xml', 'utf-8')))

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

        info = {
          '강좌번호': lectnum,
          '학부(과)': department,
          '강좌명': lecture,
          '교수명': professor,
          '제한인원': limit,
          '장바구니': basket,
          '경쟁률': basket / limit,
        }

        if (Object.keys(info).length != 0) infos.push(info)
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

  fs.writeFile('./merged.json', JSON.stringify(convert, null, 2), (err) => {
    if (err) {
      console.log(err)
    }
  })

  console.log(dateString + ' ' + timeString + ' api cheked.')
}

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

mergeFiles()

getConvert()
