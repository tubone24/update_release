import {getInput, setFailed, setOutput, info} from '@actions/core'
import {GitHub, context} from '@actions/github'
import {readFileSync} from 'fs'

export const run = async (): Promise<void> => {
  try {
    const github = new GitHub(process.env.GITHUB_TOKEN)
    const owner = process.env.RELEASE_OWNER ?? context.repo.owner
    const repo = process.env.RELEASE_REPO ?? context.repo.repo
    const tagName = process.env.TAG_NAME ?? context.ref
    const tag = tagName.replace('refs/tags/', '')
    const getReleaseResponse = await github.repos.getReleaseByTag({
      owner,
      repo,
      tag
    })

    const {
      data: {
        id: oldReleaseId,
        html_url: oldHtmlUrl,
        upload_url: oldUploadUrl,
        body: oldBody,
        draft: oldDraft,
        name: oldName,
        prerelease: oldPrerelease
      }
    } = getReleaseResponse

    info(
      `Got release info: '${oldReleaseId}', ${oldName}, '${oldHtmlUrl}', '${oldUploadUrl},'`
    )
    info(`Body: ${oldBody}`)
    info(`Draft: ${oldDraft}, Prerelease: ${oldPrerelease}`)

    const newReleaseName = getInput('release_name', {required: false})
    const newBody = getInput('body', {required: false})
    const newDraft = getInput('draft', {required: false})
    const newPrerelease = getInput('prerelease', {required: false})
    const isAppendBody =
      getInput('is_append_body', {required: false}) === 'true'
    const newBodyPath = getInput('body_path', {required: false})

    let bodyFileContent = null
    if (newBodyPath !== '' && !!newBodyPath) {
      try {
        bodyFileContent = readFileSync(newBodyPath, {encoding: 'utf8'})
      } catch (error) {
        setFailed(error.message)
        return
      }
      if (isAppendBody) {
        bodyFileContent = `${oldBody}\n${bodyFileContent}`
      }
    }
    let body
    if (newBody === '') {
      body = oldBody
    } else if (isAppendBody) {
      body = `${oldBody}\n${newBody}`
    } else {
      body = newBody
    }

    let name
    if (newReleaseName !== '' && !!newReleaseName) {
      name = newReleaseName
    } else {
      name = oldName
    }
    let prerelease
    if (newPrerelease !== '' && !!newPrerelease) {
      prerelease = newPrerelease === 'true'
    } else {
      prerelease = oldPrerelease
    }
    let draft
    if (newDraft !== '' && !!newDraft) {
      draft = newDraft === 'true'
    } else {
      draft = oldDraft
    }

    const updateReleaseResponse = await github.repos.updateRelease({
      owner,
      release_id: oldReleaseId,
      repo,
      body: bodyFileContent || body,
      name,
      draft,
      prerelease
    })

    const {
      data: {
        id: updatedReleaseId,
        body: updatedBody,
        upload_url: updatedUploadUrl,
        html_url: updatedHtmlUrl,
        name: updatedReleaseName,
        published_at: updatedPublishAt
      }
    } = updateReleaseResponse
    setOutput('id', updatedReleaseId.toString())
    setOutput('html_url', updatedHtmlUrl)
    setOutput('upload_url', updatedUploadUrl)
    setOutput('name', updatedReleaseName)
    setOutput('body', updatedBody)
    setOutput('published_at', updatedPublishAt)
    setOutput('tag_name', tag)
  } catch (error) {
    setFailed(error.message)
  }
}
