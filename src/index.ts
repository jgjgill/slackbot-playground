import { App, UploadedFile } from "@slack/bolt";
import { config } from "dotenv";
config();

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

app.command("/커뮤니티_도입", async ({ command, ack, say, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: command.trigger_id,
      view: {
        type: "modal",
        callback_id: "커뮤니티_테스트_모달",
        title: {
          type: "plain_text",
          text: "커뮤니티 테스트",
        },
        submit: {
          type: "plain_text",
          text: "제출하기",
        },
        private_metadata: command.channel_id,
        blocks: [
          {
            type: "input",
            block_id: "테스트_인풋1",
            element: {
              type: "plain_text_input",
              action_id: "테스트_인풋1",
            },
            label: {
              type: "plain_text",
              text: "테스트 인풋1",
            },
          },
          {
            type: "input",
            block_id: "테스트_인풋2",
            element: {
              type: "plain_text_input",
              action_id: "테스트_인풋2",
            },
            label: {
              type: "plain_text",
              text: "테스트 인풋2",
            },
          },
          {
            type: "input",
            block_id: "커뮤니티_이미지",
            label: {
              type: "plain_text",
              text: "파일 업로드",
            },
            element: {
              type: "file_input",
              action_id: "커뮤니티_이미지",
              filetypes: ["png"],
            },
          },
        ],
      },
    });
  } catch (err) {
    console.error(err);
  }
});

app.view("커뮤니티_테스트_모달", async ({ ack, body, view, client }) => {
  await ack();

  const result = await client.chat.postMessage({
    channel: body.view.private_metadata,
    text: `*커뮤니티 관련 테스트 스레드*`,
  });

  const threadTs = result.ts;
  const guide =
    "https://www.notion.so/jgjgill/658646acbf244a0d84e03f9795b57617?pvs=4";

  // await client.files.sharedPublicURL({
  //   token: process.env.SLACK_USER_TOKEN,
  //   file: view.state.values["커뮤니티_로고"]["커뮤니티_로고"].files![0].id,
  // });

  function makeImageMessageBlocks(files?: UploadedFile[]) {
    if (!files) {
      throw new Error("이미지 파일이 없습니다.");
    }

    const blocks = [];

    for (const file of files) {
      blocks.push({
        type: "image",
        alt_text: "이미지 설명",
        image_url: file.url_private_download,
      });
    }

    return blocks;
  }

  try {
    await client.chat.postMessage({
      channel: body.view.private_metadata,
      thread_ts: threadTs,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "이미지 포함된 메시지",
          },
        },
        ...makeImageMessageBlocks(
          view.state.values["커뮤니티_이미지"]["커뮤니티_이미지"].files
        ),
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<${guide} | 노션 문서>`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@U04R85H1J69> 관리자입니다.`,
          },
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
});

async function init() {
  await app.start(process.env.PORT || 3000);

  console.log("Bolt app is running!");
}

init();
