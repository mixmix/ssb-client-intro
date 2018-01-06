const Client = require('ssb-client')
const pull = require('pull-stream')
const paraMap = require('pull-paramap')
const Abortable = require('pull-abortable')
const get = require('lodash/get')

var minutes = 60*1000

Client((err, sbot) => {
  if (err) throw err

  var someTimeAgo = Number(new Date()) - 60*minutes

  pull(
    sbot.createFeedStream({ reverse: true, gt: someTimeAgo, live: true }), // source
    addAuthorName(),
    pull.drain(renderMsg) // sink
  )

  function renderMsg (msg) {
    if (msg.sync) {
      console.log('*** up to date, now listening for new messages ***')
      return
    }

    console.log(`author: ${get(msg, 'value.authorName')} (${get(msg, 'value.author')})`)
    console.log('time:', new Date(msg.value.timestamp))
    console.log('type:', get(msg, 'value.content.type'))
    console.log('text:', get(msg, 'value.content.text'))
    console.log()
  }

  function addAuthorName () {
    return paraMap((msg, doneCb) => {
      if (msg.sync) {
        doneCb(null, msg)
        return
      }

      // take a msg in, pull out the author id : @yeasdasd..asd
      const id = get(msg, 'value.author')
      const abortable = Abortable()

      // create a new user stream, and look for the most recent `about` message they have published
      pull(
        sbot.createUserStream({ id, reverse: true }),
        abortable,
        pull.filter(msg => {
          return get(msg, 'value.content.type') === 'about' &&
            get(msg, 'value.content.about') === id
        }),
        pull.drain(aboutMsg => {
          // add the name from that about message to decorate the orignal msg
          msg.value.authorName = get(aboutMsg, 'value.content.name')

          doneCb(null, msg)

          // abort the stream once you'e found the most recent about msg
          abortable.abort()
        })
      )
    })
  }

})


