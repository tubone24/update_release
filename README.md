# update_release (GitHub Release API)

This GitHub Action (written in JavaScript) is to change the Body Text and Name of an already created Release with using the GitHub Release API.

## Usage

### Pre-requisites

Create a workflow `.yml` file in your .github/workflows directory. 

[An example workflow]() is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow#creating-a-workflow-file).

### Inputs

Change GitHub Releases, if you set the inputs. 

- release_name
  - If If this item is set, the release name is overridden.
- body
  - If If this item is set, the body text is overridden.
- draft
  - If If this item is set, the draft is overridden.
- prerelease
  - If If this item is set, the prerelease is overridden.
- isAppendBody
  - If true, append body text on old one.

### Outputs
- id
  - The release ID
- html_url
  - The URL users can navigate to in order to view the release. i.e. https://github.com/octocat/Hello-World/releases/v1.0.0
- upload_url
  - The URL for uploading assets to the release, which could be used by GitHub Actions for additional uses, for example the [@actions/upload-release-asset](https://github.com/actions/upload-release-asset) GitHub Action

### Example workflow - update a release

```
name: Release

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            asset_name_suffix: ''
            asset_content_type: application/octet-stream
          - os: windows-latest
            asset_name_suffix: .exe
            asset_content_type: application/octet-stream
          - os: macOS-latest
            asset_name_suffix: ''
            asset_content_type: application/octet-stream
    steps:
      - uses: actions/checkout@v1
      - uses: tubone24/setup-nim-action@v1.0.1
      - name: Install Dependencies
        run: nimble install -d --accept
      - name: Build
        run: nimble build -d:release
      - name: get version
        id: get_version
        run: |
          echo ::set-output name=VERSION::${GITHUB_REF/refs\/tags\//}
      - name: update release
        id: update_release
        uses: tubone24/update_release@v1.0
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          body: test_body # new body text
      - name: Upload Release Asset
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.github_token }}
        with:
          upload_url: ${{ steps.update_release.outputs.upload_url }}
          asset_path: ./bin/post_twitter_on_work${{ matrix.asset_name_suffix }}
          asset_name: post_twitter_on_work_${{ runner.os }}_${{ steps.get_version.outputs.VERSION }}${{ matrix.asset_name_suffix }}
          asset_content_type: ${{ matrix.asset_content_type }}
```

`on-release-created` is a event to create a release and you can get release id on the actions. Also changed body text.

This uses the GITHUB_TOKEN provided by the [virtual environment](https://docs.github.com/en/actions/reference/virtual-environments-for-github-hosted-runners#github_token-secret), so no new token is needed.
