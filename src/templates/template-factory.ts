import type { ProjectContext } from '@/types'

interface Template {
  id: string
  getFilePath: (context: ProjectContext) => string
  initContent: (context: ProjectContext) => string
}

export class TemplateFactory {
  constructor(context: ProjectContext) {
    this.context = context
  }

  private templates: Template[] = []
  private context: ProjectContext

  register(template: Template): this {
    this.templates.push(template)
    return this
  }

  generate(): void {
    this.templates.forEach((template) => {
      const content = template.initContent(this.context)
      const filePath = template.getFilePath(this.context)
      this.context.files[filePath] = content
    })
  }
}
