#!/usr/bin/env node

if (!process.argv[2] || !process.argv[3] || !process.argv[4] || !process.argv[5] || !process.argv[6] || !process.argv[7]) {
  console.log('Usage:')
  console.log('  ./process-batch.js <PouchDbPrefix> <dbName> <transformerPath> <view> <batchSize> <skip> ')
  process.exit()
}

const PouchDB = require('pouchdb')
const log = require('tangy-log').log
const clog = require('tangy-log').clog
const sleep = (mseconds) => new Promise((res) => setTimeout(() => res(), mseconds))

const params = {
  pouchDbPrefix: process.argv[2],
  dbName: process.argv[3],
  transformerPath: process.argv[4],
  view: process.argv[5],
  batchSize: parseInt(process.argv[6]),
  skip: parseInt(process.argv[7])
}

const transformer = require(params.transformerPath)
const DB = PouchDB.defaults({prefix: params.pouchDbPrefix})
const db = new DB(params.dbName)

async function runBatch(params, db, transformer) {
  try {
    let body = {} 
    if (params.view === '_all_docs') { 
      body = await db.allDocs({ include_docs: true, skip: params.skip, limit: params.batchSize })
    } else {
      body = await db.query(params.view, { include_docs: true, skip: params.skip, limit: params.batchSize })
    }
    const docs = body.rows.map(row => row.doc)
    if (docs.length === 0) {
      process.stderr.write('No docs in that range')
      return process.exit()
    }
    clog(docs)
    const transformedDocs = docs
      .map(doc => transformer(doc))
      .filter(entry => entry !== undefined)
    clog(transformedDocs)
    for (let transformedDoc of transformedDocs) {
      log.debug(transformedDoc)
      await db.put(transformedDoc)
    }
    process.exit()
  } catch (error) {
    console.log(error)
    log.debug(error)
    process.exit()
  }
}
runBatch(params, db, transformer)
