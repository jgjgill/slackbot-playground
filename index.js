const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.command("/테스트", async ({ command, ack, say }) => {
  await ack();

  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `안녕하세요! <@${command.user_name}>`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Click Me!",
          },
          action_id: "button_click",
        },
      },
    ],
  });
});

app.action("button_click", async ({ body, ack, say }) => {
  await ack();
  await say(`버튼을 클릭하셨군요..! <@${body.user.id}>`);
});

async function init() {
  await app.start(process.env.PORT || 3000);

  console.log("Bolt app is running!");
}

init();
