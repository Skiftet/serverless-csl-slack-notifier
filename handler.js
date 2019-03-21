'use strict';

const { IncomingWebhook } = require('@slack/client');
const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);
const csl_url = new URL(process.env.CSL_URL).origin;

function csl_url(path) {
  return `${csl_url}/${path.replace(/^\//, '')}`;
}

async function notify(message) {
  await new Promise((resolve, reject) => {
    webhook.send(
      {
        attachments: [message],
      },
      function(err, res) {
      if (err) {
          console.log('Error:', err);
          reject();
      } else {
          console.log('Message sent: ', res);
          resolve();
      }
    });
  }).catch(err => { throw err });
}

module.exports.webhook = async (event) => {
  const body = JSON.parse(event.body)
  // await notify(body.type);

  let message = null;
  let text;
  switch (body.type) {
    case 'blast_email.created':
      text = 'A new blast email is ready for moderation';
      message = {
        title: text,
        fallback: text,
        color: 'warning',
        text: `<${csl_url('org/moderation')}|Open moderation queue>`,
      }
      break;
    case 'event.created':
      text = 'A new event is published';
      message = {
        title: text,
        fallback: text,
        color: 'good',
        text: `<${body.data.url}|Open event>`,
      }
      break;
    case 'event.updated':
      text = 'An event has been updated';
      message = {
        title: text,
        fallback: text,
        color: 'warning',
        text: `<${body.data.url}|Open event>`,
      }
      break;
    case 'petition.ended':
      text = 'A petition is marked as won, lost, or ended for another reason';
      message = {
        title: text,
        fallback: text,
        color: 'warning',
        text: `${body.data.title} • <${body.data.url}|Open petition>`,
      }
      break;
    case 'petition.flagged':
      text = 'A petition is flagged for the first or fifth time';
      message = {
        title: text,
        fallback: text,
        color: 'danger',
        text: `${body.data.title} • <${body.data.url}|Open petition>`,
      }
      break;
    case 'petition.launched':
      text = 'A new petition has been launched';
      message = {
        title: text,
        fallback: text,
        color: 'good',
        text: `${body.data.title} • <${body.data.url}|Open petition>`,
      }
      break;
    case 'petition.launched.ham':
      text = 'A petition has passed the post-launch spam check';
      message = {
        title: text,
        fallback: text,
        color: 'good',
        text: `${body.data.title} • <${body.data.url}|Open petition>`,
      }
      break;
  default:
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'OK',
        }),    
      };
  }

  await notify(message);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'OK',
    }),
  };
};
