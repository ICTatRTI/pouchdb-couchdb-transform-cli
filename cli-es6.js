#!/usr/bin/env node

if (!process.argv[2] || !process.argv[3] || !process.argv[4] || !process.argv[4]) {
  console.log('Usage:')
  console.log('  pouchdb-couchdb-transform-cli <PouchDbPrefix> <dbName> <transformerPath> [view] [batchSize] [dry-run] ')
  console.log('Example:')
  console.log(`  pouchdb-couchdb-transform-cli 'http://admin:password@couchdb:5984' test-db ./transformer-example.js`)
  console.log(`  pouchdb-couchdb-transform-cli 'http://admin:password@couchdb:5984' test-db ./transformer-example.js _design/reporting/_views/foo 50 true`)
  process.exit()
}


// const PouchDB = require('pouchdb')
import PouchDB from 'pouchdb'

const sleep = (mseconds) => new Promise((res) => setTimeout(() => res(), mseconds))
import util from 'util'

import * as child from 'child_process';
const exec = util.promisify(child.exec)
import { dirname } from 'path';
// import log from 'tangy-log/log'
let dryRun = false
if (process.argv[7]) {
  if (process.argv[7] === 'true' || process.argv[7] === true) {
    dryRun = true
  }
}
const params = {
  pouchDbPrefix: process.argv[2],
  dbName: process.argv[3],
  transformerPath: process.argv[4],
  view: (process.argv[5]) ? process.argv[5] : '_all_docs',
  batchSize: (process.argv[6]) ? parseInt(process.argv[6]) : 50,
  dryRun: dryRun
}

// let transformer = require(params.transformerPath).transformer

let state = Object.assign({}, params, {
  complete: false,
  startTime: new Date().toISOString(),
  skip: 0,
  totalTransformedDocs: 0
})

async function go(state) {
  try {
    const DB = PouchDB.defaults({prefix: state.pouchDbPrefix})
    // const db = new DB(state.dbName)
    // Periodically update the status json.
    // log.info(state)
    // const logStateInterval = setInterval(() => log.info(state), 5*1000)
    //  Run batches.
    let shouldRun = true
    let response = { stdout: '', stderr: '' }
    console.log(response.stdout)
    let iteration=1
    while (shouldRun) {
      response = await exec(`./run-batch-es6.js ${params.pouchDbPrefix} ${params.dbName} ${params.transformerPath} ${params.view} ${params.batchSize} ${state.skip} iteration ${params.dryRun}`)
      iteration++
      // Determine next step.
      console.log(response.stdout)
      if (response.stderr === 'No docs in that range') {
        shouldRun = false
      } else {
        state.skip += state.batchSize
      }
    }
    // clearInterval(logStateInterval)
    state.complete = true
    // log.info(state)
    process.exit()
  } catch (error) {
    // log.error(error)
    console.log(error)
  }
}
go(state)
