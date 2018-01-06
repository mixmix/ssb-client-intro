const Client = require('ssb-client')

Client((err, sbot) => {
  if (err) throw err

  sbot.whoami((err, data) => {
    if (err) console.error(err)
    else console.log(data)

    sbot.close()
  })
})
