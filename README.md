# pouchdb-couchdb-transform-cli

You have a pouchdb/couchdb with lots of docs. You need to transform some or all of them in a perfomant way that won't blow up the memory on your machine. Write your transformer and use. Note that if this module gives you trouble, you can also try https://github.com/ntsang168/couchtransform which is strictly for use with CouchDB.

This module uses the node.js core module `child_process` to spawn a separate process for each of your transforms. This prevents lazy garbage collection in node from allowing memory to balloon. 

## Install
```
npm install -g pouchdb-couchdb-transform-cli
```

## Example transformer usage
This will transform all docs with property of foo so that foo equals true. Save it as a file named `transformer-example.js`.
```javascript
module.exports = function(doc) {
  if (doc.hasOwnProperty('foo')) {
    doc.foo = true
    return doc
  }
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

## Asynchronous Transformers
You can also make asynchronous calls in your transformers by adding the `async` keyword to your transformer function.
```javascript
module.exports = async function(doc) {
  if (doc.hasOwnProperty('foo')) {
    const request = await fetch(`https://some-server.com/what-foo-should-be`)
    const whatFooShouldBe = await request.json()
    doc.foo = whatFooShouldBe.foo
    return doc
  }
}
```

## Limitations
With the current code you can't pass in view keys which would be handy. Want to send a PR? :-)
