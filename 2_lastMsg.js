const Client = require('ssb-client')
const pull = require('pull-stream')
const get = require('lodash/get')

Client((err, sbot) => {
  if (err) throw err

  var source = sbot.createFeedStream({ reverse: true, limit: 10 })
  var sink = pull.drain(renderMsg)
    
  function renderMsg (msg) {
    console.log(`author: ${get(msg, 'value.author')}`)
    console.log('type:', get(msg, 'value.content.type'))
    console.log('text:', get(msg, 'value.content.text'))
    console.log()
  }

  pull(
    source,
    sink
  )
})


// simple pull-stream example
//
// var source = pull.values([1,2,3,4,5,6])
// var double = pull.map(msg => msg*2)
// var filter = pull.filter(msg => msg >=6)
// var sink = pull.drain(msg => {
//   console.log('here is the next thing in the pull-stream', msg)
// })

// pull(
//   source,
//   double,
//   filter,
//   sink
// )
