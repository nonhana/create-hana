import process from 'node:process'
import * as prompts from '@clack/prompts'
import { generateProject } from '@/core/generator'
import { runQuestions } from '@/questions'

const cwd = process.cwd()

async function init() {
  prompts.intro('🌸 Welcome to create-hana!')
  const config = await runQuestions()
  await generateProject(config, cwd)
  prompts.outro('Project created successfully! 🎉')
}

init().catch(e => console.error(e))
