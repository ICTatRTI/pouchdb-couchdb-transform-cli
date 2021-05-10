#!/usr/bin/env node

if (!process.argv[2] || !process.argv[3] || !process.argv[4] || !process.argv[5] || !process.argv[6] || !process.argv[7]) {
  console.log('Usage:')
  console.log('  ./process-batch.js <PouchDbPrefix> <dbName> <transformerPath> <view> <batchSize> <skip> <iteration> <dry-run>')
  process.exit()
}

import PouchDB from 'pouchdb'
import log from 'tangy-log'

const sleep = (mseconds) => new Promise((res) => setTimeout(() => res(), mseconds))
let dryRun = false
if (process.argv[9]) {
  if (process.argv[9] === 'true' || process.argv[9] === true) {
    dryRun = true
  }
}
const params = {
  pouchDbPrefix: process.argv[2],
  dbName: process.argv[3],
  transformerPath: process.argv[4],
  view: process.argv[5],
  batchSize: parseInt(process.argv[6]),
  skip: parseInt(process.argv[7]),
  iteration: parseInt(process.argv[8]),
  dryRun: dryRun
}
//import { Get } from 'tangy-form/helpers.js'
import * as pkg from 'tangy-form/helpers.js';
// console.log(pkg.Get)
const { Get } = pkg.Get;
import * as task from './task3.js'
const transformer = task.task
// console.log("task: " + task)
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
    // clog(docs)
    let transformedDocs = []
    for (const doc of docs) {
      transformedDocs.push(await transformer(doc, db, params.iteration))
    }

    transformedDocs = transformedDocs.filter(entry => entry !== undefined)
    if (params.dryRun) {
      console.log("Dry run! transformedDocs: " + transformedDocs.length)
    } else {
      for (let transformedDoc of transformedDocs) {
        log.debug(transformedDoc)
        await db.put(transformedDoc)
      }
    }
    process.exit()
  } catch (error) {
    console.log(error)
    log.debug(error)
    process.exit()
  }
}
runBatch(params, db, transformer)
