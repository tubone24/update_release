const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function run() {
  try {
    const github = new GitHub(process.env.GITHUB_TOKEN);
    const { owner, repo } = context.repo;
    const tagName = context.ref;
    const tag = tagName.replace('refs/tags/', '');
    const getReleaseResponse = await github.repos.getReleaseByTag({
      owner,
      repo,
      tag
    });

    const {
      data: { id: oldReleaseId, html_url: oldHtmlUrl, upload_url: oldUploadUrl, body: oldBody, draft: oldDraft, name: oldName, prerelease: oldPrerelease }
    } = getReleaseResponse;

    console.log(`Got release info: '${oldReleaseId}', ${oldName}, '${oldHtmlUrl}', '${oldUploadUrl},'`);
    console.log(`Body: ${oldBody}`);
    console.log(`Draft: ${oldDraft}, Prerelease: ${oldPrerelease}`);

    const newReleaseName = core.getInput('release_name', { required: false });
    const newBody = core.getInput('body', { required: false });
    const newDraft = core.getInput('draft', { required: false }) === 'true';
    const newPrerelease = core.getInput('prerelease', { required: false }) === 'true';
    const isAppendBody = core.getInput('isAppendBody', { required: false }) === 'true';

    let body;
    if (isAppendBody !== '' && !!isAppendBody) {
      body = `${oldBody}\n${newBody}`;
    }
    let name;
    if (newReleaseName !== '' && !!newReleaseName) {
      name = newReleaseName;
    } else {
      name = oldName;
    }

    const updateReleaseResponse = await github.repos.updateRelease({
      owner,
      release_id: oldReleaseId,
      repo,
      body: body,
      name: name,
      draft: newDraft,
      prerelease: newPrerelease
    });

    const {
      data: {
        id: updatedReleaseId,
        body: updatedBody,
        upload_url: updatedUploadUrl,
        html_url: updatedHtmlUrl,
        name: updatedReleaseName,
        published_at: updatedPublishAt
      }
    } = updateReleaseResponse;
    core.setOutput('id', updatedReleaseId.toString());
    core.setOutput('html_url', updatedHtmlUrl);
    core.setOutput('upload_url', updatedUploadUrl);
    core.setOutput('name', updatedReleaseName);
    core.setOutput('body', updatedBody);
    core.setOutput('published_at', updatedPublishAt);
    core.setOutput('tag_name', tag);
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
  }
}

module.exports = run;
