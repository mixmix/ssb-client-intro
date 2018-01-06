const Client = require('ssb-client')
const pull = require('pull-stream')
const get = require('lodash/get')

Client((err, sbot) => {
  if (err) throw err

  var minutes = 60*1000
  var someTimeAgo = Number(new Date()) - 60*minutes

  var source = sbot.createFeedStream({ reverse: true, gt: someTimeAgo, live: true })
  var sink = pull.drain(renderMsg)
    
  function renderMsg (msg) {
    if (msg.sync) {
      console.log('*** up to date, now listening for new messages ***')
      return
    }

    console.log(`author: ${get(msg, 'value.author')}`)
    console.log('time:', new Date(msg.value.timestamp))
    console.log('type:', get(msg, 'value.content.type'))
    console.log('text:', get(msg, 'value.content.text'))
    console.log()
  }

  pull(
    source,
    sink
  )
})


