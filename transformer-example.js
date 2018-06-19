module.exports = function(doc) {
  if (doc.foo) return Object.assign({}, doc, {foo: true})
}
