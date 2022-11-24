const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')

const token = '5725192120:AAHYO_qCulKhq8f9sOTKzz0L6XxyLKG6Jno'
const webAppUrl = 'https://stirring-torrone-f0f82e.netlify.app'

const bot = new TelegramBot(token, { polling: true })
const app = express()

app.use(express.json())
app.use(cors())

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветствие' },
  ])

  bot.on('message', async (msg) => {
    const text = msg.text
    const chatId = msg.chat.id
    if (text === '/start') {
      await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        reply_markup: {
          keyboard: [
            [
              {
                text: 'Заполнить форму',
                web_app: { url: webAppUrl + '/form' },
              },
            ],
          ],
        },
      })
      await bot.sendMessage(
        chatId,
        `Привет,${msg.from.first_name}! 
        Меня зовут Аня и я мастер-бровист`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Выбрать услуги и записаться!',
                  web_app: { url: webAppUrl },
                },
              ],
            ],
          },
        }
      )
    }

    if (msg?.web_app_data?.data) {
      try {
        const data = JSON.parse(msg?.web_app_data?.data)
        await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
        await bot.sendMessage(chatId, 'Ваш адрес: ' + data?.address)
        await bot.sendMessage(chatId, 'Ваша любимая услуга: ' + data?.service)

        setTimeout(async () => {
          await bot.sendMessage('Всю информацию вы получите в этом чате')
        }, 3000)
      } catch (e) {
        console.log(e)
      }
    }

    // return bot.sendMessage(chatId, 'Я тебя не понимаю, давай начнём заново')
  })
}

start()

const PORT = 8000

app.post('/web-data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Я свяжусь с вами в ближайшее время для подтверждения записи!',
      input_message_content: {
        message_text: 'Общая стоимость услуг составит' + totalPrice,
      },
    })
    return res.status(200).json({})
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Не удалось оформить запись',
      input_message_content: { message_text: 'Не удалось оформить запись' },
    })
    return res.status(500).json({})
  }
})

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
