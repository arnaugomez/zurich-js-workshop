import { node } from '@elysia/node'
import { cors } from '@elysiajs/cors'
import { Elysia, t } from 'elysia'
import OpenAI from 'openai'
import { buildRewritePrompt } from './solution/buildRewritePrompt.solution.js'

const port = Number(process.env.PORT ?? 3001)
const useMockResponse = process.env.MOCK_RESPONSE === 'true'

let openai: OpenAI | null = null

function getOpenAiClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required unless MOCK_RESPONSE=true.')
  }

  openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return openai
}

const app = new Elysia({ adapter: node() })
  .use(cors({ origin: 'http://localhost:5173' }))
  .post(
    '/api/rewrite',
    async ({ body, set }) => {
      if (useMockResponse) {
        await new Promise(resolve => setTimeout(resolve, 1_000))
        return { text: 'MOCK RESPONSE' }
      }

      try {
        const result = await getOpenAiClient().responses.create({
          model: 'gpt-5.4-nano',
          input: buildRewritePrompt(body.task, body.text),
        })
        return { text: result.output_text }
      } catch (error) {
        console.error(error)
        set.status = 500
        return { error: 'Could not rewrite the selected text.' }
      }
    },
    {
      body: t.Object({
        task: t.Union([
          t.Literal('summarize'),
          t.Literal('expand'),
          t.Literal('rephrase'),
          t.Literal('proofread'),
        ]),
        text: t.String(),
      }),
    },
  )

app.listen(port)
console.log(`AI rewrite server listening on http://localhost:${port}`)
