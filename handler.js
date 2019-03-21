'use strict';

const { IncomingWebhook } = require('@slack/client');
const { URL } = require('url');
const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
const cslBaseUrl = new URL(process.env.CSL_URL).origin;

function cslUrl(path) {
  return `${cslBaseUrl}/${path.replace(/^\//, '')}`;
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
        text: `<${cslUrl('org/moderation')}|Open moderation queue>`,
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
        image_url: body.data.image_url,
      }
      break;
    case 'petition.flagged':
      text = 'A petition is flagged for the first or fifth time';
      message = {
        title: text,
        fallback: text,
        color: 'danger',
        text: `${body.data.title} • <${body.data.url}|Open petition>`,
        image_url: body.data.image_url,
      }
      break;
    case 'petition.launched':
      text = 'A new petition has been launched';
      message = {
        title: text,
        fallback: text,
        color: 'good',
        text: `${body.data.title} • <${body.data.url}|Open petition>`,
        image_url: body.data.image_url,
      }
      break;
    case 'petition.reactivated':
      text = 'A hidden or ended petition has been reactivated';
      message = {
        title: text,
        fallback: text,
        color: 'warning',
        text: `${body.data.title} • <${body.data.url}|Open petition>`,
        image_url: body.data.image_url,
      }
      break;
    case 'petition.launched.requires_moderation':
      text = 'A new petition requires moderation';
      message = {
        title: text,
        fallback: text,
        color: 'warning',
        text: `${body.data.title} • <${body.data.url}|Open petition>`,
        image_url: body.data.image_url,
      }
      break;
    case 'petition.target.response':
      text = 'A decision maker has responded to a petition notification';
      message = {
        title: text,
        fallback: text,
        color: 'warning',
        text: `${body.data.title} • <${body.data.url}|Open petition>`,
        image_url: body.data.image_url,
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
