import { promises as fs } from 'fs'
import { join } from 'path'
import { Project } from './types'
import { captionPresets } from './types'
import { randomUUID } from 'crypto'

export function getProjectsDir(): string {
  return join(process.cwd(), 'storage', 'projects')
}

export function getUploadsDir(): string {
  return join(process.cwd(), 'storage', 'uploads')
}

export function getExportsDir(): string {
  return join(process.cwd(), 'storage', 'exports')
}

async function ensureDirs() {
  await fs.mkdir(getProjectsDir(), { recursive: true })
  await fs.mkdir(getUploadsDir(), { recursive: true })
  await fs.mkdir(getExportsDir(), { recursive: true })
}

export async function saveProject(project: Project): Promise<Project> {
  await ensureDirs()
  const filePath = join(getProjectsDir(), `${project.id}.json`)
  const dataToSave = {
    ...project,
    createdAt: project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt,
    updatedAt: project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt,
  }
  await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf8')
  return project
}

export async function getProject(id: string): Promise<Project | null> {
  await ensureDirs()
  const filePath = join(getProjectsDir(), `${id}.json`)
  try {
    const content = await fs.readFile(filePath, 'utf8')
    const raw = JSON.parse(content)
    return {
      ...raw,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    }
  } catch {
    return null
  }
}

export async function getAllProjects(): Promise<Project[]> {
  await ensureDirs()
  try {
    const files = await fs.readdir(getProjectsDir())
    const projects: Project[] = []
    for (const file of files) {
      if (file.endsWith('.json')) {
        const id = file.replace(/\.json$/, '')
        const project = await getProject(id)
        if (project) {
          projects.push(project)
        }
      }
    }
    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } catch {
    return []
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  await ensureDirs()
  const project = await getProject(id)
  if (!project) return false

  const filePath = join(getProjectsDir(), `${id}.json`)
  try {
    await fs.unlink(filePath)
    // Optionally delete video file if inside storage/uploads
    if (project.videoPath && project.videoPath.includes('storage/uploads')) {
      try {
        await fs.unlink(project.videoPath)
      } catch {}
    }
    return true
  } catch {
    return false
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const project = await getProject(id)
  if (!project) return null

  const updated: Project = {
    ...project,
    ...updates,
    id, // preserve id
    updatedAt: new Date(),
  }

  await saveProject(updated)
  return updated
}
