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
      .mockReturnValueOnce('false');

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
});
