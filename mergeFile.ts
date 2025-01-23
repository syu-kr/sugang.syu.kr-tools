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

mergeFiles()
