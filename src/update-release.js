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
      data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl, body, draft, name, prerelease }
    } = getReleaseResponse;

    console.log(`Got release info: '${releaseId}', ${name}, '${htmlUrl}', '${uploadUrl},'`);
    console.log(`Body: ${body}`);
    console.log(`Draft: ${draft}, Prerelease: ${prerelease}`);

    const newReleaseName = core.getInput('release_name', { required: false });
    let newBody = core.getInput('body', { required: false });
    const newDraft = core.getInput('draft', { required: false }) === 'true';
    const newPrerelease = core.getInput('prerelease', { required: false }) === 'true';
    const isAppendBody = core.getInput('isAppendBody', { required: false }) === 'true';

    if (isAppendBody !== '' && !!isAppendBody) {
      newBody = `${body}\n${newBody}`;
    }
    let newName;
    if (newReleaseName !== '' && !!newReleaseName) {
      newName = newReleaseName;
    } else {
      newName = name;
    }

    const updateReleaseResponse = await github.repos.updateRelease({
      owner,
      release_id: releaseId,
      repo,
      body: newBody,
      name: newName,
      draft: newDraft,
      prerelease: newPrerelease
    });
    core.setOutput('id', releaseId.toString());
    core.setOutput('html_url', htmlUrl);
    core.setOutput('upload_url', uploadUrl);
    core.setOutput('tag_name', tag);
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
  }
}

module.exports = run;
