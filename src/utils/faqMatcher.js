// src/utils/faqMatcher.js

const responses = [
    {
      keywords: ['reset', 'router'],
      response: 'To reset your router, hold the reset button for 10 seconds until the lights blink.'
    },
    {
      keywords: ['change', 'microwave', 'time'],
      response: 'To change time on your microwave, press "Clock", enter the time, then "Start".'
    },
    {
      keywords: ['replace', 'water', 'filter'],
      response: 'To replace your water filter, twist and pull out the old one, insert the new one until it clicks.'
    },
    {
      keywords: ['help', 'device'],
      response: 'Sure! Tell me what kind of device you need help with: router, microwave, or water filter.'
    }
  ]
  
  export function getSmartResponse(query) {
    const q = query.toLowerCase()
    for (let item of responses) {
      if (item.keywords.every(k => q.includes(k))) {
        return item.response
      }
    }
    return "Sorry, I couldn't find a guide for that. Please try rephrasing your question.";
  }
  