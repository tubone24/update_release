jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('fs');

const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');
const fs = require('fs');
const run = require('../src/update-release.js');

/* eslint-disable no-undef */
describe('Update Release', () => {
  let updateRelease;
  let getReleaseByTag;

  beforeEach(() => {
    updateRelease = jest.fn().mockReturnValueOnce({
      data: {
        id: 'releaseId',
        body: 'newBody',
        html_url: 'newHtmlUrl',
        upload_url: 'newUploadUrl',
        name: 'newName',
        published_at: 'newPublishedAt'
      }
    });
    getReleaseByTag = jest.fn().mockReturnValueOnce({
      data: {
        id: 'releaseId',
        html_url: 'oldHtmlUrl',
        upload_url: 'oldUploadUrl',
        body: 'oldBody',
        draft: false,
        name: 'oldName',
        prerelease: false
      }
    });

    context.repo = {
      owner: 'owner',
      repo: 'repo',
      tag: 'tag'
    };
    context.sha = 'sha';
    context.ref = 'refs/tags/v1.0.0';

    const github = {
      repos: {
        updateRelease: updateRelease,
        getReleaseByTag: getReleaseByTag
      }
    };

    GitHub.mockImplementation(() => github);
  });

  test('Update release endpoint is called', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: 'myBody',
      draft: false,
      prerelease: false
    });
  });
  test('isAppend body text', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('true')
      .mockReturnValueOnce('');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: 'oldBody\nmyBody',
      draft: false,
      prerelease: false
    });
  });
  test('isNotAppend body text', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: 'myBody',
      draft: false,
      prerelease: false
    });
  });
  test('Not Change release Name', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'oldName',
      body: 'myBody',
      draft: false,
      prerelease: false
    });
  });
  test('Not Change body', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: 'oldBody',
      draft: false,
      prerelease: false
    });
  });
  test('Change draft', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('true')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: 'myBody',
      draft: true,
      prerelease: false
    });
  });
  test('Change prerelease', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('true')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: 'myBody',
      draft: false,
      prerelease: true
    });
  });
  test('Not Change draft', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: 'myBody',
      draft: false,
      prerelease: false
    });
  });
  test('Not Change prerelease', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('myBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: 'myBody',
      draft: false,
      prerelease: false
    });
  });
  test('Body path', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('test.md');
    fs.readFileSync = jest.fn().mockReturnValueOnce('# test markdown\nThe markdown is great.');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: '# test markdown\nThe markdown is great.',
      draft: false,
      prerelease: false
    });
  });
  test('is Append Body path', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('true')
      .mockReturnValueOnce('test.md');
    fs.readFileSync = jest.fn().mockReturnValueOnce('# test markdown\nThe markdown is great.');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: 'oldBody\n# test markdown\nThe markdown is great.',
      draft: false,
      prerelease: false
    });
  });
  test('Body path with body text', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('testBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('test.md');
    fs.readFileSync = jest.fn().mockReturnValueOnce('# test markdown\nThe markdown is great.');

    await run();

    expect(updateRelease).toHaveBeenCalledWith({
      owner: 'owner',
      release_id: 'releaseId',
      repo: 'repo',
      name: 'myRelease',
      body: '# test markdown\nThe markdown is great.',
      draft: false,
      prerelease: false
    });
  });
});
