# pouchdb-couchdb-transform-cli

You have a pouchdb/couchdb with lots of docs. You need to transform some or all of them in a perfomant way that won't blow up the memory on your machine. Write your transformer and use.

## Install
```
npm install -g pouchdb-couchdb-transform-cli
```

## Example transformer module 
This will transform all docs with property of foo so that foo equals true. Save it as a file named `transformer-example.js`.
```
module.exports = function(doc) {
  if (doc.foo) return Object.assign({}, doc, {foo: true})
}
```
Note that if you don't return the doc, it won't be transformed / updated in the database.

Then run that transformer against a database.
```
pouchdb-couchdb-transform-cli 'http://admin:password@couchdb:5984' test-db ./transformer-example.js
```

Note that if that was a local PouchDB database using LevelDB your command might look like....
```
pouchdb-couchdb-transform-cli ./db/ test-db ./transformer-example.js
```


## Usage

