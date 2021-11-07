jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('fs');

const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');
const fs = require('fs');
import {run} from '../src/update-release'

/* eslint-disable no-undef */
describe('Update Release', () => {
  const OLD_ENV = process.env;
  let updateRelease: jest.Mock
  let getRelease: jest.Mock;
  let getReleaseByTag: jest.Mock;

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV };
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
    getRelease = jest.fn().mockReturnValueOnce({
      data: {
        id: 'test_release_id',
        html_url: 'oldHtmlUrl',
        upload_url: 'oldUploadUrl',
        body: 'oldBody',
        draft: false,
        name: 'oldName',
        prerelease: false
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
        getReleaseByTag: getReleaseByTag,
        getRelease: getRelease,
      }
    };

    GitHub.mockImplementation(() => github);
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('Ref tag is used', async () => {
    process.env.GITHUB_TOKEN = 'token';
    await run();

    expect(getReleaseByTag).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag: 'v1.0.0'
    });
  });
  test('Custom tag is used', async () => {
    process.env.GITHUB_TOKEN = 'token';
    process.env.TAG_NAME = "v3.0.0";

    await run();

    expect(getReleaseByTag).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tag: 'v3.0.0'
    });
  });
  test('Use release id', async () => {
    process.env.GITHUB_TOKEN = 'token';
    process.env.RELEASE_ID = "test_release_id";
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
      release_id: 'test_release_id',
      repo: 'repo',
      name: 'myRelease',
      body: 'myBody',
      draft: false,
      prerelease: false
    });
  });
  test('Update release endpoint is called', async () => {
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
    process.env.GITHUB_TOKEN = 'token';
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
  test('invalid body path', async () => {
    process.env.GITHUB_TOKEN = 'token';
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('testBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('invalid.md');

    fs.readFileSync.mockImplementation(() => {
      throw new Error('Error read file');
    });

    core.setOutput = jest.fn();

    core.setFailed = jest.fn();

    await run();

    expect(updateRelease).not.toHaveBeenCalled();
    expect(core.setFailed).toHaveBeenCalledWith('Error read file');
    expect(core.setOutput).toHaveBeenCalledTimes(0);
  });
  test('error update release', async () => {
    process.env.GITHUB_TOKEN = 'token';
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('myRelease')
      .mockReturnValueOnce('testBody')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('invalid.md');

    fs.readFileSync = jest.fn().mockReturnValueOnce('# test markdown\nThe markdown is great.');
    updateRelease.mockRestore();
    updateRelease.mockImplementation(() => {
      throw new Error('Error update release');
    });

    core.setOutput = jest.fn();

    core.setFailed = jest.fn();

    await run();

    expect(updateRelease).toHaveBeenCalled();
    expect(core.setFailed).toHaveBeenCalledWith('Error update release');
    expect(core.setOutput).toHaveBeenCalledTimes(0);
  });
  test('error not set GITHUB_TOKEN', async () => {
    core.getInput = jest
        .fn()
        .mockReturnValueOnce('myRelease')
        .mockReturnValueOnce('testBody')
        .mockReturnValueOnce('false')
        .mockReturnValueOnce('false')
        .mockReturnValueOnce('false')
        .mockReturnValueOnce('invalid.md');

    fs.readFileSync = jest.fn().mockReturnValueOnce('# test markdown\nThe markdown is great.');

    await run();

    expect(core.setFailed).toHaveBeenCalledWith('need to set GITHUB_TOKEN');
  });
});
