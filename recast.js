console.log('Loading function')

const r = require('recastai').default
const request = require('request')

const recastClient = new r('e4e2ddece33c5b99c41f24a1b13f1fca')

let sessionId = null
let endConv = false
let done = null

// Format reply for Alexa
let alexaReply = (text) => {
  done.send({
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: text
      },
      shouldEndSession: endConv
    }
  })

  // Always set endConv back to false
  endConv = false
}

let handleAlexaMessage = (text) => {
  endIntents = [
    'goodbye',
    'thanks',
  ]

  // Send input to Recast.AI
  recastClient.request.converseText(text, { conversationToken: sessionId })
    .then((res) => {

      console.log(res)
      
      // Set end conversation flag to true when we match an end intent, so Alexa stop listening continously
      if (res.action && endIntents.indexOf(res.action.slug) > -1) {
        console.log('End of conversation')
        endConv = true
      }

      // reply to Alexa
      alexaReply(res.replies.join(' '))
    })
    .catch((err) => {
      console.error(err)
      done.send(err)
    })
}

exports.bot = (event, doneFct) => {
  console.log('Received event:', JSON.stringify(event, null, 2))

  done = doneFct

  let helloReplies = [
    'Hello! How can I help you today?',
    'Welcome back. What do you need?'
  ]

  if (event.request) {
    console.log('Alexa message received')
    // Alexa Message
    if (event.request.type == 'LaunchRequest') {
      console.log('Trigger word received')
      // User says invovation word, reply hello
      alexaReply(helloReplies[Math.floor(Math.random() * helloReplies.length)])
    } else if (event.request.type == 'IntentRequest') {
      // Conversation

      console.log(event.request)

      alexaReply('test message')

        const text= 'info yucca'
      //const text = event.request.intent.slots.sentence.value
      console.log(event.request.intent.slots.sentence)
      console.log(event.request.intent.slots.sentence.value)
      //const text='info pasta'
      console.log('Received: ', text)

      sessionId = (sessionId == null ? event.session.sessionId : sessionId)

      

      if (text) {
        handleAlexaMessage(text)
      } else {
        done.send(new Error('No text provided'))
      }
    }
  }

  console.log('Processing finished')
}
