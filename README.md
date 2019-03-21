A CSL webhook listener that sends slack notifications about events that might require attention

### Prerequisites
* An amazon account with configured credentials in your terminal
* NodeJS installed

### Installation

1. Create an incoming webhook Slack app https://api.slack.com/incoming-webhooks
1. Run `$ npm install -g serverless` to install the serverless framework
1. Start the serverless webhook listener by running `$ SLACK_WEBHOOK_URL=https://url-of-the-hook-you-get-from-your-slack-app CSL_URL=https://url-to-your-csl-site sls deploy`
1. Serverless will now create the webhook listener. This might take a minute. When the command has run its course, copy the printed endpoint URL and create a CSL webhook endpoint by going into `https://url-to-your-csl-site/org/settings/integrations/webhook_endpoints/new` and pasting the URL into the input. Don't forget to save.
1. You should now receive notifications about events in Slack!
