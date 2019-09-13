# Example use for Slack app "Slack Commands", providing some limited bot-functionality
Let's get started!

First, setup a slash command in Slack. You can do that here: [https://slack.com/apps/A0F82E8CA-slash-commands](https://slack.com/apps/A0F82E8CA-slash-commands)

You'll install the slash commands "app" to your slack account. Once you've got that setup, continue below.

Ok now that it's installed, setup a slash command.

We're going to use /rikku-example as our prefix here. 
When remixing, please replace this with your `/YOURNAME-example`. 

Use the following values:

command: /rikku-example

url: https://pp-slack-command-test.glitch.me/

method: POST

#### Run locally or [![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/pp-slack-command-test)
1. Get the code
    * Either clone this repo and run `npm install`
    * Or visit https://pp-slack-command-test.glitch.me/
2. Set the following environment variables to `.env` (see `.env.sample`):
    * `SLACK_VERIFICATION_TOKEN`: Your app's verification token (available on the Basic information page)
3. If you're running the app locally:
    * Start the app (`npm start`)
